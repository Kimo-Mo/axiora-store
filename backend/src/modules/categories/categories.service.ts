import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ConflictError, NotFoundError, ValidationError } from "../../shared/errors.js";
import type {
  CategoryBreadcrumb,
  PublicCategory,
  PublicCategoryDetail,
} from "../products/products.types.js";
import type { CreateCategoryInput, UpdateCategoryInput } from "./categories.schemas.js";

/** Depth ceiling for taxonomy walks, so corrupt data cannot spin a CTE forever. */
const MAX_TAXONOMY_DEPTH = 20;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function looksLikeUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

const categorySelect = {
  id: true,
  nameAr: true,
  nameEn: true,
  slug: true,
  descriptionAr: true,
  descriptionEn: true,
  image: true,
  parentId: true,
  sortOrder: true,
} satisfies Prisma.CategorySelect;

type CategoryRecord = Prisma.CategoryGetPayload<{ select: typeof categorySelect }>;

function toPublicCategory(
  category: CategoryRecord,
  productCount: number,
  children: PublicCategory[] = [],
): PublicCategory {
  return { ...category, productCount, children };
}

/**
 * Active-product counts for a set of categories, keyed by category id.
 *
 * One grouped query rather than a `_count` per category: the tree walk would
 * otherwise issue a query per node. Deactivated products are excluded so the number
 * beside a filter facet always matches what selecting that facet returns.
 */
async function countActiveProductsByCategory(categoryIds: string[]): Promise<Map<string, number>> {
  if (categoryIds.length === 0) return new Map();

  const grouped = await prisma.product.groupBy({
    by: ["categoryId"],
    where: { categoryId: { in: categoryIds }, isActive: true },
    _count: { _all: true },
  });

  return new Map(grouped.map((row) => [row.categoryId, row._count._all]));
}

/**
 * Resolve a category reference — slug or id — into a record.
 *
 * The storefront links by slug and admin tooling holds ids, so both address a
 * category in practice and forcing callers to convert would only invite mistakes.
 */
export async function resolveCategory(reference: string): Promise<CategoryRecord> {
  const bySlug = await prisma.category.findUnique({ where: { slug: reference }, select: categorySelect });
  if (bySlug) return bySlug;

  if (looksLikeUuid(reference)) {
    const byId = await prisma.category.findUnique({ where: { id: reference }, select: categorySelect });
    if (byId) return byId;
  }

  throw new NotFoundError("Category not found");
}

/**
 * Every descendant of a category, plus the category itself (FR-009).
 *
 * A single recursive CTE rather than an application-level walk: taxonomy depth is
 * unbounded, so a loop would cost a network round trip per level and could not be
 * expressed as one set operation (research.md D-2). Descendants are restricted to
 * active categories so a facet can never surface products hiding under a category
 * the storefront does not show.
 */
export async function resolveDescendantCategoryIds(rootId: string): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    WITH RECURSIVE category_tree("id", "depth") AS (
      SELECT "id", 0 FROM "Category" WHERE "id" = ${rootId}
      UNION ALL
      SELECT c."id", ct."depth" + 1
      FROM "Category" c
      INNER JOIN category_tree ct ON c."parentId" = ct."id"
      WHERE c."isActive" = true AND ct."depth" < ${MAX_TAXONOMY_DEPTH}
    )
    SELECT DISTINCT "id" FROM category_tree
  `);

  return rows.map((row) => row.id);
}

/**
 * Ancestor trail for a category, root first, excluding the category itself
 * (research.md D-7).
 *
 * Walks `parentId` upward in one round trip. The `depth` column exists purely to
 * break the recursion on a cycle that only corrupt data could introduce.
 */
export async function getCategoryAncestors(categoryId: string): Promise<CategoryBreadcrumb[]> {
  const rows = await prisma.$queryRaw<Array<{ nameAr: string; nameEn: string; slug: string; depth: number }>>(
    Prisma.sql`
      WITH RECURSIVE ancestors("nameAr", "nameEn", "slug", "parentId", "depth") AS (
        SELECT "nameAr", "nameEn", "slug", "parentId", 0 FROM "Category" WHERE "id" = ${categoryId}
        UNION ALL
        SELECT c."nameAr", c."nameEn", c."slug", c."parentId", a."depth" + 1
        FROM "Category" c
        INNER JOIN ancestors a ON c."id" = a."parentId"
        WHERE a."depth" < ${MAX_TAXONOMY_DEPTH}
      )
      SELECT "nameAr", "nameEn", "slug", "depth"
      FROM ancestors
      WHERE "depth" > 0
      ORDER BY "depth" DESC
    `,
  );

  return rows.map(({ nameAr, nameEn, slug }) => ({ nameAr, nameEn, slug }));
}

/** Build the nested tree the store sidebar renders, from a flat record list. */
function nestCategories(records: CategoryRecord[], counts: Map<string, number>): PublicCategory[] {
  const nodes = new Map<string, PublicCategory>();
  for (const record of records) {
    nodes.set(record.id, toPublicCategory(record, counts.get(record.id) ?? 0));
  }

  const roots: PublicCategory[] = [];
  for (const record of records) {
    const node = nodes.get(record.id);
    if (!node) continue;
    const parent = record.parentId ? nodes.get(record.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function toFlatCategories(records: CategoryRecord[], counts: Map<string, number>): PublicCategory[] {
  return records.map((record) => toPublicCategory(record, counts.get(record.id) ?? 0));
}

/**
 * Active categories as a tree, or as a flat list.
 *
 * The flat form exists because the store page filter renders its own grouping: a
 * nested payload would force it to re-derive the same shape.
 */
export async function listCategories(options: { tree: boolean; flat: boolean }): Promise<PublicCategory[]> {
  const records = await prisma.category.findMany({
    where: { isActive: true },
    select: categorySelect,
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
  });

  const counts = await countActiveProductsByCategory(records.map((record) => record.id));

  if (options.flat) return toFlatCategories(records, counts);
  return options.tree
    ? nestCategories(records, counts)
    : toFlatCategories(records, counts);
}

export async function getCategoryDetail(reference: string): Promise<PublicCategoryDetail> {
  const category = await resolveCategory(reference);

  // An inactive category 404s rather than rendering an unlinked page a shopper
  // could otherwise reach by typing its URL.
  const active = await prisma.category.findUnique({
    where: { id: category.id },
    select: { isActive: true },
  });
  if (!active?.isActive) {
    throw new NotFoundError("Category not found");
  }

  const ancestors = await getCategoryAncestors(category.id);
  const breadcrumbs: CategoryBreadcrumb[] = [
    ...ancestors,
    { nameAr: category.nameAr, nameEn: category.nameEn, slug: category.slug },
  ];

  const children = await prisma.category.findMany({
    where: { parentId: category.id, isActive: true },
    select: categorySelect,
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
  });
  const counts = await countActiveProductsByCategory(children.map((child) => child.id));

  return {
    ...category,
    productCount: (await countActiveProductsByCategory([category.id])).get(category.id) ?? 0,
    breadcrumbs,
    children: children.map((child) => toPublicCategory(child, counts.get(child.id) ?? 0)),
  };
}

// ─── Admin ───────────────────────────────────────────────────────────────────

async function assertParentExists(parentId: string | null | undefined): Promise<void> {
  if (!parentId) return;
  const parent = await prisma.category.findUnique({ where: { id: parentId }, select: { id: true } });
  if (!parent) {
    throw new ValidationError("Parent category does not exist", { parentId: "Unknown category" });
  }
}

/**
 * Refuse a re-parent that would create a cycle.
 *
 * `onDelete: SetNull` stops a deleted parent from taking its subtree with it, but
 * nothing prevents an update pointing a category at one of its own descendants —
 * which would orphan that subtree and make the descendant CTE spin on it.
 */
async function assertNoCycle(categoryId: string, parentId: string | null | undefined): Promise<void> {
  if (parentId === undefined) return;
  if (parentId === null) return;
  if (parentId === categoryId) {
    throw new ValidationError("A category cannot be its own parent", { parentId: "Self-parenting is not allowed" });
  }
  await assertParentExists(parentId);

  const descendantIds = await resolveDescendantCategoryIds(categoryId);
  if (descendantIds.includes(parentId)) {
    throw new ValidationError("A category cannot be moved beneath one of its own subcategories", {
      parentId: "Would create a cycle",
    });
  }
}

/** Surface a slug collision as a named conflict instead of a bare P2002. */
async function assertSlugAvailable(slug: string, excludeId?: string): Promise<void> {
  const existing = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
  if (existing && existing.id !== excludeId) {
    throw new ConflictError("A category with this slug already exists", {
      slug: "Slug already in use",
    });
  }
}

export async function createCategory(input: CreateCategoryInput) {
  // The slug arrives validated and required (data-model.md §3), and it is what
  // every storefront link is built from — regenerating it from the name would
  // silently hand the administrator a different URL than the one they submitted.
  await assertSlugAvailable(input.slug);
  await assertParentExists(input.parentId);

  return prisma.category.create({
    data: {
      nameAr: input.nameAr,
      nameEn: input.nameEn,
      slug: input.slug,
      descriptionAr: input.descriptionAr ?? null,
      descriptionEn: input.descriptionEn ?? null,
      parentId: input.parentId ?? null,
      image: input.image ?? null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const existing = await prisma.category.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new NotFoundError("Category not found");

  if (input.slug) await assertSlugAvailable(input.slug, id);
  await assertNoCycle(id, input.parentId);

  // Spread each field conditionally: an explicit `null` in the body means "clear
  // this", which a plain pass-through of the parsed object would also have done
  // correctly, but the explicit form keeps optional-without-key distinguishable
  // from present-and-null once Zod's `.optional()` has run.
  return prisma.category.update({
    where: { id },
    data: {
      ...(input.nameAr !== undefined ? { nameAr: input.nameAr } : {}),
      ...(input.nameEn !== undefined ? { nameEn: input.nameEn } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.descriptionAr !== undefined ? { descriptionAr: input.descriptionAr } : {}),
      ...(input.descriptionEn !== undefined ? { descriptionEn: input.descriptionEn } : {}),
      ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });
}

/**
 * Delete a category, refusing while products or subcategories are attached
 * (FR-019).
 *
 * Checked explicitly so the response can explain the blocker. The schema's
 * `onDelete: Restrict` stays the authoritative backstop for a request that races
 * a concurrent product creation.
 */
export async function deleteCategory(id: string): Promise<void> {
  const existing = await prisma.category.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new NotFoundError("Category not found");

  const [productCount, childCount] = await Promise.all([
    prisma.product.count({ where: { categoryId: id } }),
    prisma.category.count({ where: { parentId: id } }),
  ]);

  if (productCount > 0) {
    throw new ConflictError(
      "Cannot delete category with active products. Reassign or delete products first.",
      { code: "CATEGORY_HAS_PRODUCTS", productCount },
    );
  }

  if (childCount > 0) {
    throw new ConflictError("Cannot delete a category that has subcategories. Remove them first.", {
      code: "CATEGORY_HAS_CHILDREN",
      childCount,
    });
  }

  await prisma.category.delete({ where: { id } });
}