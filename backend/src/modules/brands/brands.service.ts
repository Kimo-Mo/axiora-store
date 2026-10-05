import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ConflictError, NotFoundError } from "../../shared/errors.js";
import type { PublicBrand } from "../products/products.types.js";
import type { CreateBrandInput, UpdateBrandInput } from "./brands.schemas.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const brandSelect = {
  id: true,
  nameAr: true,
  nameEn: true,
  slug: true,
  logo: true,
} satisfies Prisma.BrandSelect;

type BrandRecord = Prisma.BrandGetPayload<{ select: typeof brandSelect }>;

/**
 * Active-product counts per brand, in one grouped query.
 *
 * Deactivated products are excluded so the number beside a filter facet always
 * matches what selecting that facet returns.
 */
async function countActiveProductsByBrand(brandIds: string[]): Promise<Map<string, number>> {
  if (brandIds.length === 0) return new Map();

  const grouped = await prisma.product.groupBy({
    by: ["brandId"],
    where: { brandId: { in: brandIds }, isActive: true },
    _count: { _all: true },
  });

  return new Map(grouped.map((row) => [row.brandId, row._count._all]));
}

/**
 * Every active brand, for the store filter bar.
 *
 * Brands with no active products are omitted rather than shown with a zero: a
 * facet that can never narrow anything is noise.
 */
export async function listBrands(): Promise<PublicBrand[]> {
  const records = await prisma.brand.findMany({
    where: { isActive: true },
    select: brandSelect,
    orderBy: { nameEn: "asc" },
  });

  const counts = await countActiveProductsByBrand(records.map((record) => record.id));
  return records
    .map((record) => ({ ...record, productCount: counts.get(record.id) ?? 0 }))
    .filter((brand) => brand.productCount > 0);
}

/**
 * Resolve a brand reference — slug or id — into a record.
 *
 * Both address a brand in practice: the storefront links by slug, admin tooling
 * holds ids.
 */
export async function resolveBrand(reference: string): Promise<BrandRecord> {
  const bySlug = await prisma.brand.findUnique({ where: { slug: reference }, select: brandSelect });
  if (bySlug) return bySlug;

  if (UUID_PATTERN.test(reference)) {
    const byId = await prisma.brand.findUnique({ where: { id: reference }, select: brandSelect });
    if (byId) return byId;
  }

  throw new NotFoundError("Brand not found");
}

// ─── Admin ───────────────────────────────────────────────────────────────────

async function assertSlugAvailable(slug: string, excludeId?: string): Promise<void> {
  const existing = await prisma.brand.findUnique({ where: { slug }, select: { id: true } });
  if (existing && existing.id !== excludeId) {
    throw new ConflictError("A brand with this slug already exists", { slug: "Slug already in use" });
  }
}

export async function createBrand(input: CreateBrandInput) {
  // The slug arrives validated and required (data-model.md §3), and it is what
  // every storefront link is built from — regenerating it from the name would
  // silently hand the administrator a different URL than the one they submitted.
  await assertSlugAvailable(input.slug);

  return prisma.brand.create({
    data: {
      nameAr: input.nameAr,
      nameEn: input.nameEn,
      slug: input.slug,
      logo: input.logo ?? null,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updateBrand(id: string, input: UpdateBrandInput) {
  const existing = await prisma.brand.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new NotFoundError("Brand not found");

  if (input.slug) await assertSlugAvailable(input.slug, id);

  return prisma.brand.update({
    where: { id },
    data: {
      ...(input.nameAr !== undefined ? { nameAr: input.nameAr } : {}),
      ...(input.nameEn !== undefined ? { nameEn: input.nameEn } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.logo !== undefined ? { logo: input.logo } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });
}

/**
 * Delete a brand, refusing while products are assigned (FR-019).
 *
 * Checked explicitly so the response can explain the blocker; the schema's
 * `onDelete: Restrict` remains the backstop against a concurrent insert.
 */
export async function deleteBrand(id: string): Promise<void> {
  const existing = await prisma.brand.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new NotFoundError("Brand not found");

  const productCount = await prisma.product.count({ where: { brandId: id } });
  if (productCount > 0) {
    throw new ConflictError("Cannot delete brand with active products. Reassign or delete products first.", {
      code: "BRAND_HAS_PRODUCTS",
      productCount,
    });
  }

  await prisma.brand.delete({ where: { id } });
}