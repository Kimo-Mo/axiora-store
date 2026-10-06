import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { NotFoundError, ValidationError } from "../../shared/errors.js";
import { buildPaginationMeta } from "../../shared/utils/pagination.js";
import type { PaginatedResponse } from "../../shared/types.js";
import {
  getCategoryAncestors,
  resolveDescendantCategoryIds,
} from "../categories/categories.service.js";
import { destroyImage } from "../uploads/uploads.service.js";
import {
  LOW_STOCK_THRESHOLD,
  type CatalogQuery,
  type ProductPrimaryImage,
  type PublicProductAttribute,
  type PublicProductDetail,
  type PublicProductListItem,
  type PublicPricing,
  type PublicSpecification,
  type PublicVariantDto,
  type RelatedProduct,
  type StockStatus,
  type VariantAttributeValue,
} from "./products.types.js";
import type {
  AddProductImageInput,
  CreateProductInput,
  CreateVariantInput,
  ReplaceSpecificationsInput,
  UpdateProductInput,
  UpdateVariantInput,
} from "./products.schemas.js";

/** How many same-category neighbours the product page offers (FR-008). */
const RELATED_PRODUCT_LIMIT = 8;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function looksLikeUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

// ─── Prisma selections ───────────────────────────────────────────────────────

const brandSelect = { id: true, nameAr: true, nameEn: true, slug: true, logo: true } satisfies Prisma.BrandSelect;
const categorySelect = { id: true, nameAr: true, nameEn: true, slug: true } satisfies Prisma.CategorySelect;

/**
 * The listing row shape.
 *
 * Active variants ride along because every card needs the "from" price, the
 * discount, and the aggregate stock status — all three are variant aggregations
 * (research.md D-3), and a product carries one to roughly twenty variants, so
 * fetching them costs less than a second aggregation round trip per row.
 */
const listItemInclude = {
  brand: { select: brandSelect },
  category: { select: categorySelect },
  images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
  variants: {
    where: { isActive: true },
    select: { id: true, isDefault: true, price: true, compareAtPrice: true, stockQuantity: true, reservedQuantity: true },
  },
} satisfies Prisma.ProductInclude;

type ListItemRecord = Prisma.ProductGetPayload<{ include: typeof listItemInclude }>;

const detailInclude = {
  brand: { select: brandSelect },
  category: { select: categorySelect },
  images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
  specifications: { orderBy: { sortOrder: "asc" } },
  variants: {
    where: { isActive: true },
    orderBy: [{ isDefault: "desc" }, { price: "asc" }],
    // Written out rather than spread from a shared constant: Prisma resolves an
    // `include` through `satisfies` on the object literal, and a spread loses the
    // nested-relation types.
    include: {
      attributeValues: {
        include: { attribute: { select: { id: true, nameAr: true, nameEn: true, slug: true } } },
      },
    },
  },
} satisfies Prisma.ProductInclude;

type DetailRecord = Prisma.ProductGetPayload<{ include: typeof detailInclude }>;

/** The two inventory numbers the public stock rules read. */
interface StockBearingVariant {
  stockQuantity: number;
  reservedQuantity: number;
}

// ─── Stock presentation (research.md D-4) ─────────────────────────────────────

export interface PublicStock {
  stockStatus: StockStatus;
  availableQuantity: number | null;
}

/**
 * Map raw variant inventory onto what the storefront is allowed to show.
 *
 * Above {@link LOW_STOCK_THRESHOLD} the count is suppressed entirely and only the
 * status bucket leaves the server. Between one and the threshold the number is
 * shown, because "only 3 left" is what moves a shopper to act and reveals nothing
 * commercially useful. At or below zero nothing is purchasable.
 */
export function toPublicStock(stockQuantity: number, reservedQuantity: number): PublicStock {
  const available = stockQuantity - reservedQuantity;

  if (available <= 0) return { stockStatus: "OUT_OF_STOCK", availableQuantity: 0 };
  if (available <= LOW_STOCK_THRESHOLD) return { stockStatus: "LOW_STOCK", availableQuantity: available };
  return { stockStatus: "IN_STOCK", availableQuantity: null };
}

/**
 * Roll variant statuses up to a product.
 *
 * `IN_STOCK` wins outright — a shopper can buy something from this card, which is
 * the only question the aggregate badge answers. `LOW_STOCK` surfaces only when
 * every purchasable variant is nearly gone.
 */
function aggregateStockStatus(variants: StockBearingVariant[]): StockStatus {
  let sawLow = false;

  for (const variant of variants) {
    const { stockStatus } = toPublicStock(variant.stockQuantity, variant.reservedQuantity);
    if (stockStatus === "IN_STOCK") return "IN_STOCK";
    if (stockStatus === "LOW_STOCK") sawLow = true;
  }

  return sawLow ? "LOW_STOCK" : "OUT_OF_STOCK";
}

/**
 * Server-resolved pricing across a product's active variants (research.md D-3).
 *
 * The "from" price is `MIN(price)`, recomputed on every request — a denormalised
 * `minPrice` column would drift the moment a variant price changed or a variant
 * was deactivated. A compare-at price only counts when it exceeds the from price;
 * otherwise it is not a discount and striking it through would misrepresent the
 * offer.
 */
function resolvePricing(
  variants: Array<{ price: Prisma.Decimal; compareAtPrice: Prisma.Decimal | null }>,
): PublicPricing {
  if (variants.length === 0) {
    return { fromPrice: 0, compareAtPrice: null, hasDiscount: false, discountPercentage: 0 };
  }

  const fromPrice = variants.reduce(
    (lowest, variant) => (variant.price.lte(lowest) ? variant.price : lowest),
    variants[0].price,
  );

  const compareCandidates = variants
    .map((variant) => variant.compareAtPrice)
    .filter((value): value is Prisma.Decimal => value !== null && value.gt(fromPrice));

  if (compareCandidates.length === 0) {
    return { fromPrice: fromPrice.toNumber(), compareAtPrice: null, hasDiscount: false, discountPercentage: 0 };
  }

  const compareAtPrice = compareCandidates.reduce((highest, value) => (value.gt(highest) ? value : highest));
  const compareNumber = compareAtPrice.toNumber();
  const fromNumber = fromPrice.toNumber();

  return {
    fromPrice: fromNumber,
    compareAtPrice: compareNumber,
    hasDiscount: true,
    discountPercentage: Math.round(((compareNumber - fromNumber) / compareNumber) * 100),
  };
}

function toDecimal(value: number | null | undefined): Prisma.Decimal | null {
  return value === null || value === undefined ? null : new Prisma.Decimal(value);
}

// ─── Raw helpers: the three things Prisma's filter DSL cannot express ──────────

/**
 * Product ids matching a bilingual fuzzy search term (research.md D-1).
 *
 * `%` is the trigram similarity operator and is what makes typing `sam` match
 * "Samsung"; the `ILIKE` half is the fallback for Arabic inflections the
 * similarity score rates too low. Both route through the GIN trigram indexes
 * added by the `add_trigram_indexes` migration.
 */
async function findSearchMatchIds(term: string): Promise<string[]> {
  // `%`, `_` and `\` are LIKE wildcards. A shopper typing them means those
  // characters, not "any run of text", so they are escaped before the pattern
  // reaches the database.
  const pattern = `%${term.replace(/[%_\\]/g, (char) => `\\${char}`)}%`;

  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "Product"
    WHERE "nameAr" % ${term}
       OR "nameEn" % ${term}
       OR "nameAr" ILIKE ${pattern} ESCAPE '\'
       OR "nameEn" ILIKE ${pattern} ESCAPE '\'
  `);

  return rows.map((row) => row.id);
}

/**
 * Product ids with at least one purchasable variant in stock.
 *
 * `availableStock` is `stockQuantity - reservedQuantity`, a difference Prisma's
 * filter DSL cannot express, so the EXISTS is written out. This is the one query
 * that would want a materialised availability column or view at catalogue scale;
 * for the current volume the id set is small enough to hand straight back.
 */
async function findInStockProductIds(): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT DISTINCT p."id"
    FROM "Product" p
    INNER JOIN "ProductVariant" v ON v."productId" = p."id"
    WHERE p."isActive" = true
      AND v."isActive" = true
      AND (v."stockQuantity" - v."reservedQuantity") > 0
  `);

  return rows.map((row) => row.id);
}

/**
 * Candidate product ids ranked by their cheapest active variant (research.md D-3).
 *
 * Prisma can order by a relation `_count` but not by an aggregate over a relation
 * *field*, so price sorting is the one ordering that needs SQL. The filter is
 * applied by Prisma first and only the surviving ids are ranked here, which keeps
 * the filter logic in one place instead of translating it into SQL twice.
 */
async function orderIdsByMinVariantPrice(
  candidateIds: string[],
  direction: "asc" | "desc",
  skip: number,
  take: number,
): Promise<string[]> {
  if (candidateIds.length === 0) return [];

  const directionSql = direction === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;

  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "productId" AS id
    FROM "ProductVariant"
    WHERE "productId" = ANY(${candidateIds}::text[]) AND "isActive" = true
    GROUP BY "productId"
    ORDER BY MIN("price") ${directionSql}, "productId" ASC
    OFFSET ${skip} LIMIT ${take}
  `);

  return rows.map((row) => row.id);
}

// ─── Public listing ──────────────────────────────────────────────────────────

/** Translate validated query parameters into a Prisma filter. */
async function buildListingWhere(query: CatalogQuery): Promise<Prisma.ProductWhereInput> {
  // A product needs at least one active variant to be listable at all (FR-020):
  // a master product with nothing purchasable is not something to show a shopper.
  const where: Prisma.ProductWhereInput = { isActive: true, variants: { some: { isActive: true } } };
  const and: Prisma.ProductWhereInput[] = [];

  if (query.search) {
    and.push({ id: { in: await findSearchMatchIds(query.search) } });
  }

  if (query.category) {
    const root = await prisma.category.findFirst({
      where: {
        OR: looksLikeUuid(query.category)
          ? [{ id: query.category }, { slug: query.category }]
          : [{ slug: query.category }],
      },
      select: { id: true },
    });
    // A category that no longer exists narrows to nothing rather than being
    // ignored, so a stale bookmark shows an empty result instead of everything.
    if (!root) return { id: NO_MATCH_ID };

    and.push({ categoryId: { in: await resolveDescendantCategoryIds(root.id) } });
  }

  if (query.brands?.length) {
    // The one OR group in the filter, which is exactly what multi-brand selection
    // asks for (FR-010).
    and.push({ brandId: { in: await resolveBrandIds(query.brands) } });
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    // Built as one object, not two spreads: a second `price:` key in the same
    // literal would replace the first rather than merging with it, and `minPrice`
    // would be silently dropped whenever both bounds were supplied.
    const priceBounds: Prisma.DecimalFilter = {};
    if (query.minPrice !== undefined) priceBounds.gte = new Prisma.Decimal(query.minPrice);
    if (query.maxPrice !== undefined) priceBounds.lte = new Prisma.Decimal(query.maxPrice);

    and.push({ variants: { some: { isActive: true, price: priceBounds } } });
  }

  if (query.inStock) {
    and.push({ id: { in: await findInStockProductIds() } });
  }

  if (query.isFeatured) and.push({ isFeatured: true });
  if (query.isNew) and.push({ isNew: true });
  if (query.isBestSeller) and.push({ isBestSeller: true });

  if (and.length > 0) where.AND = and;
  return where;
}

/** Sentinel that cannot collide with a generated uuid, used to force an empty match. */
const NO_MATCH_ID = "00000000-0000-0000-0000-000000000000";

/** Resolve brand references (slugs or ids) to ids, dropping ones that no longer exist. */
async function resolveBrandIds(references: string[]): Promise<string[]> {
  const brands = await prisma.brand.findMany({
    where: {
      OR: references.flatMap((reference) =>
        looksLikeUuid(reference) ? [{ id: reference }, { slug: reference }] : [{ slug: reference }],
      ),
    },
    select: { id: true },
  });
  return brands.map((brand) => brand.id);
}

function toPrimaryImage(images: ListItemRecord["images"]): ProductPrimaryImage | null {
  const image = images[0];
  return image ? { url: image.url, alt: image.alt } : null;
}

function resolveDefaultVariantId(variants: ListItemRecord["variants"]): string | null {
  if (variants.length === 0) return null;

  const inStockVariants = variants.filter(
    (v) => v.stockQuantity - v.reservedQuantity > 0
  );

  const defaultInStock = inStockVariants.find((v) => v.isDefault);
  if (defaultInStock) return defaultInStock.id;

  if (inStockVariants.length > 0) {
    const lowest = inStockVariants.reduce((prev, curr) =>
      curr.price.lt(prev.price) ? curr : prev
    );
    return lowest.id;
  }

  const defaultAny = variants.find((v) => v.isDefault);
  if (defaultAny) return defaultAny.id;

  return variants[0]?.id ?? null;
}

function toPublicListItem(product: ListItemRecord): PublicProductListItem {
  return {
    id: product.id,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
    slug: product.slug,
    sku: product.sku,
    shortDescriptionAr: product.shortDescriptionAr,
    shortDescriptionEn: product.shortDescriptionEn,
    currency: product.currency,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    brand: {
      id: product.brand.id,
      nameAr: product.brand.nameAr,
      nameEn: product.brand.nameEn,
      slug: product.brand.slug,
    },
    category: {
      id: product.category.id,
      nameAr: product.category.nameAr,
      nameEn: product.category.nameEn,
      slug: product.category.slug,
    },
    primaryImage: toPrimaryImage(product.images),
    pricing: resolvePricing(product.variants),
    stockStatus: aggregateStockStatus(product.variants),
    activeVariantCount: product.variants.length,
    defaultVariantId: resolveDefaultVariantId(product.variants),
  };
}

function toRelatedProduct(product: ListItemRecord): RelatedProduct {
  return {
    id: product.id,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
    slug: product.slug,
    currency: product.currency,
    brand: {
      id: product.brand.id,
      nameAr: product.brand.nameAr,
      nameEn: product.brand.nameEn,
      slug: product.brand.slug,
    },
    category: {
      id: product.category.id,
      nameAr: product.category.nameAr,
      nameEn: product.category.nameEn,
      slug: product.category.slug,
    },
    primaryImage: toPrimaryImage(product.images),
    pricing: resolvePricing(product.variants),
    stockStatus: aggregateStockStatus(product.variants),
    defaultVariantId: resolveDefaultVariantId(product.variants),
  };
}

function toColumnOrderBy(sort: CatalogQuery["sort"]): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "name_asc":
      return [{ nameEn: "asc" }, { id: "asc" }];
    case "name_desc":
      return [{ nameEn: "desc" }, { id: "asc" }];
    case "bestseller":
      return [{ isBestSeller: "desc" }, { createdAt: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }, { id: "asc" }];
  }
}

/**
 * Paginated, filtered, sorted product listing.
 *
 * Ordering resolves one of two ways. Everything except price sorts on a plain
 * product column, which Prisma does directly alongside the count. Price sorting
 * needs `MIN(variant.price)`, so the filtered id set is ranked in SQL first and
 * that page is then hydrated in the ranked order.
 */
export async function listProducts(query: CatalogQuery): Promise<PaginatedResponse<PublicProductListItem>> {
  const where = await buildListingWhere(query);
  const skip = (query.page - 1) * query.limit;

  if (query.sort !== "price_asc" && query.sort !== "price_desc") {
    const [records, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: listItemInclude,
        orderBy: toColumnOrderBy(query.sort),
        skip,
        take: query.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      success: true,
      data: records.map(toPublicListItem),
      meta: buildPaginationMeta(query.page, query.limit, totalCount),
    };
  }

  const candidates = await prisma.product.findMany({ where, select: { id: true } });
  const orderedIds = await orderIdsByMinVariantPrice(
    candidates.map((candidate) => candidate.id),
    query.sort === "price_asc" ? "asc" : "desc",
    skip,
    query.limit,
  );

  const hydrated = await prisma.product.findMany({ where: { id: { in: orderedIds } }, include: listItemInclude });
  // `findMany` does not honour an arbitrary id order, so the SQL ranking is
  // re-applied. `orderedIds` comes from a GROUP BY, so every id is present.
  const byId = new Map(hydrated.map((product) => [product.id, product]));

  return {
    success: true,
    data: orderedIds
      .map((id) => byId.get(id))
      .filter((product): product is ListItemRecord => product !== undefined)
      .map(toPublicListItem),
    meta: buildPaginationMeta(query.page, query.limit, candidates.length),
  };
}

// ─── Public detail ───────────────────────────────────────────────────────────

/**
 * Group variant attribute assignments into one selectable axis per dimension.
 *
 * Values appear in the order the variants list them, and the variants are sorted
 * default-then-price, so selector options come out in a stable, meaningful order
 * rather than an alphabetical shuffle.
 */
function buildAttributeAxes(variants: DetailRecord["variants"]): PublicProductAttribute[] {
  const axes = new Map<string, PublicProductAttribute>();

  for (const variant of variants) {
    for (const assignment of variant.attributeValues) {
      const { attribute } = assignment;
      const existing = axes.get(attribute.id);

      if (existing) {
        const alreadyListed = existing.values.some((value) => value.valueEn === assignment.valueEn);
        if (!alreadyListed) existing.values.push({ valueAr: assignment.valueAr, valueEn: assignment.valueEn });
        continue;
      }

      axes.set(attribute.id, {
        id: attribute.id,
        slug: attribute.slug,
        nameAr: attribute.nameAr,
        nameEn: attribute.nameEn,
        values: [{ valueAr: assignment.valueAr, valueEn: assignment.valueEn }],
      });
    }
  }

  return [...axes.values()].sort((left, right) => left.nameEn.localeCompare(right.nameEn));
}

function toPublicVariant(variant: DetailRecord["variants"][number]): PublicVariantDto {
  const attributes: Record<string, VariantAttributeValue> = {};
  for (const assignment of variant.attributeValues) {
    attributes[assignment.attribute.slug] = { nameAr: assignment.valueAr, nameEn: assignment.valueEn };
  }

  const { stockStatus, availableQuantity } = toPublicStock(variant.stockQuantity, variant.reservedQuantity);

  return {
    id: variant.id,
    sku: variant.sku,
    price: variant.price.toNumber(),
    compareAtPrice: variant.compareAtPrice ? variant.compareAtPrice.toNumber() : null,
    isDefault: variant.isDefault,
    stockStatus,
    availableQuantity,
    attributes,
  };
}

export async function getProductDetail(slug: string): Promise<PublicProductDetail> {
  const product = await prisma.product.findUnique({ where: { slug }, include: detailInclude });
  if (!product) throw new NotFoundError("Product not found");

  // An inactive product 404s rather than rendering: an unpublished product reached
  // by direct URL should be indistinguishable from one that does not exist.
  if (!product.isActive) throw new NotFoundError("Product not found");

  const ancestors = await getCategoryAncestors(product.categoryId);

  const specifications: PublicSpecification[] = product.specifications.map((spec) => ({
    id: spec.id,
    keyAr: spec.keyAr,
    keyEn: spec.keyEn,
    valueAr: spec.valueAr,
    valueEn: spec.valueEn,
    sortOrder: spec.sortOrder,
  }));

  return {
    id: product.id,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
    slug: product.slug,
    sku: product.sku,
    shortDescriptionAr: product.shortDescriptionAr,
    shortDescriptionEn: product.shortDescriptionEn,
    descriptionAr: product.descriptionAr,
    descriptionEn: product.descriptionEn,
    currency: product.currency,
    warranty: product.warranty,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    brand: {
      id: product.brand.id,
      nameAr: product.brand.nameAr,
      nameEn: product.brand.nameEn,
      slug: product.brand.slug,
      logo: product.brand.logo,
    },
    category: {
      ...product.category,
      breadcrumbs: [
        ...ancestors,
        { nameAr: product.category.nameAr, nameEn: product.category.nameEn, slug: product.category.slug },
      ],
    },
    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder,
    })),
    specifications,
    attributes: buildAttributeAxes(product.variants),
    variants: product.variants.map(toPublicVariant),
  };
}

/**
 * Up to {@link RELATED_PRODUCT_LIMIT} active products from the same category.
 *
 * Brand is deliberately not part of the filter: a shopper comparing a phone wants
 * the other phones, including the ones from competing brands.
 */
export async function getRelatedProducts(slug: string): Promise<RelatedProduct[]> {
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true, categoryId: true, isActive: true },
  });
  if (!product || !product.isActive) throw new NotFoundError("Product not found");

  const related = await prisma.product.findMany({
    where: { isActive: true, categoryId: product.categoryId, id: { not: product.id } },
    include: listItemInclude,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: RELATED_PRODUCT_LIMIT,
  });

  return related.map(toRelatedProduct);
}

// ─── Admin: master product ───────────────────────────────────────────────────

/**
 * Admin product representation.
 *
 * Unlike the public DTO this carries `costPrice`, `stockQuantity` and
 * `reservedQuantity` in full: the information-hiding rule in research.md D-4 is a
 * storefront rule, and an administrator managing stock needs the real numbers.
 */
const adminProductInclude = {
  brand: { select: brandSelect },
  category: { select: categorySelect },
  images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
  specifications: { orderBy: { sortOrder: "asc" } },
  variants: {
    orderBy: [{ isDefault: "desc" }, { price: "asc" }],
    include: {
      attributeValues: {
        include: { attribute: { select: { id: true, nameAr: true, nameEn: true, slug: true } } },
      },
    },
  },
} satisfies Prisma.ProductInclude;

type AdminProductRecord = Prisma.ProductGetPayload<{ include: typeof adminProductInclude }>;

/** Prisma `Decimal` serialises as a string; every admin consumer wants a number. */
function serializeAdminProduct(product: AdminProductRecord) {
  return {
    ...product,
    variants: product.variants.map((variant) => ({
      ...variant,
      price: variant.price.toNumber(),
      compareAtPrice: variant.compareAtPrice?.toNumber() ?? null,
      costPrice: variant.costPrice?.toNumber() ?? null,
    })),
  };
}

/** Existence check without dragging the whole include graph along for it. */
async function assertProductExists(id: string): Promise<void> {
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new NotFoundError("Product not found");
}

async function getAdminProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, include: adminProductInclude });
  if (!product) throw new NotFoundError("Product not found");
  return serializeAdminProduct(product);
}

export async function listAdminProducts() {
  const products = await prisma.product.findMany({ include: adminProductInclude, orderBy: { createdAt: "desc" } });
  return products.map(serializeAdminProduct);
}

export async function getAdminProductById(id: string) {
  return getAdminProduct(id);
}

export async function createProduct(input: CreateProductInput) {
  const product = await prisma.product.create({
    data: {
      nameAr: input.nameAr,
      nameEn: input.nameEn,
      slug: input.slug,
      sku: input.sku,
      brandId: input.brandId,
      categoryId: input.categoryId,
      shortDescriptionAr: input.shortDescriptionAr ?? null,
      shortDescriptionEn: input.shortDescriptionEn ?? null,
      descriptionAr: input.descriptionAr ?? null,
      descriptionEn: input.descriptionEn ?? null,
      warranty: input.warranty ?? null,
      currency: input.currency,
      isActive: input.isActive ?? true,
      isFeatured: input.isFeatured ?? false,
      isNew: input.isNew ?? false,
      isBestSeller: input.isBestSeller ?? false,
    },
    select: { id: true },
  });
  return getAdminProduct(product.id);
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  await assertProductExists(id);

  await prisma.product.update({
    where: { id },
    data: {
      ...(input.nameAr !== undefined ? { nameAr: input.nameAr } : {}),
      ...(input.nameEn !== undefined ? { nameEn: input.nameEn } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.sku !== undefined ? { sku: input.sku } : {}),
      ...(input.brandId !== undefined ? { brandId: input.brandId } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.shortDescriptionAr !== undefined ? { shortDescriptionAr: input.shortDescriptionAr } : {}),
      ...(input.shortDescriptionEn !== undefined ? { shortDescriptionEn: input.shortDescriptionEn } : {}),
      ...(input.descriptionAr !== undefined ? { descriptionAr: input.descriptionAr } : {}),
      ...(input.descriptionEn !== undefined ? { descriptionEn: input.descriptionEn } : {}),
      ...(input.warranty !== undefined ? { warranty: input.warranty } : {}),
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
      ...(input.isNew !== undefined ? { isNew: input.isNew } : {}),
      ...(input.isBestSeller !== undefined ? { isBestSeller: input.isBestSeller } : {}),
    },
    select: { id: true },
  });

  return getAdminProduct(id);
}

export async function setProductActiveStatus(id: string, isActive: boolean) {
  await assertProductExists(id);
  await prisma.product.update({ where: { id }, data: { isActive } });
  return { id, isActive };
}

/**
 * Delete a product and its Cloudinary assets.
 *
 * The remote destroy runs first, and a failure there is logged rather than
 * propagated: an orphaned CDN asset is recoverable, whereas a product an
 * administrator cannot delete because a transient network fault aborted the call
 * is not. Rows carrying no `publicId` (seeded rows) have nothing remote to clean
 * up and are skipped.
 */
export async function deleteProduct(id: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { images: { select: { publicId: true } } },
  });
  if (!product) throw new NotFoundError("Product not found");

  await Promise.all(
    product.images.map((image) =>
      image.publicId
        ? destroyImage(image.publicId).catch(() => undefined)
        : Promise.resolve(),
    ),
  );

  await prisma.product.delete({ where: { id } });
}

// ─── Admin: variants ─────────────────────────────────────────────────────────

/**
 * Ensure a dimension exists, seeding it from the first assignment seen.
 *
 * Variants reference attributes by slug (contracts/admin-catalog-api.md §3.4) so an
 * administrator does not have to look up a UUID before adding a SKU. The first
 * writer sets the dimension's bilingual label; later ones reuse the row, so a
 * mistranslated duplicate cannot fork the taxonomy.
 */
async function resolveAttributeId(
  attributeSlug: string,
  seed: { valueAr: string; valueEn: string },
): Promise<string> {
  const existing = await prisma.productAttribute.findUnique({
    where: { slug: attributeSlug },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.productAttribute.create({
    data: { slug: attributeSlug, nameAr: seed.valueAr, nameEn: seed.valueEn },
    select: { id: true },
  });
  return created.id;
}

/** Exactly one variant per product may be the default (data-model.md §2.5). */
async function demoteOtherDefaults(productId: string, keepVariantId: string): Promise<void> {
  await prisma.productVariant.updateMany({
    where: { productId, isDefault: true, id: { not: keepVariantId } },
    data: { isDefault: false },
  });
}

export async function createVariant(productId: string, input: CreateVariantInput) {
  await assertProductExists(productId);

  const attributeIds: string[] = [];
  for (const assignment of input.attributeValues) {
    attributeIds.push(await resolveAttributeId(assignment.attributeSlug, assignment));
  }

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      sku: input.sku,
      price: new Prisma.Decimal(input.price),
      compareAtPrice: toDecimal(input.compareAtPrice),
      costPrice: toDecimal(input.costPrice),
      stockQuantity: input.stockQuantity,
      reservedQuantity: 0,
      isDefault: input.isDefault ?? false,
      isActive: input.isActive ?? true,
      attributeValues: {
        create: input.attributeValues.map((assignment, index) => ({
          attributeId: attributeIds[index],
          valueAr: assignment.valueAr,
          valueEn: assignment.valueEn,
        })),
      },
    },
    select: { id: true, isDefault: true },
  });

  // Promoting a variant must demote the rest, or "default" stops being unique and
  // the storefront has no single SKU to preselect.
  if (variant.isDefault) await demoteOtherDefaults(productId, variant.id);

  return getAdminProduct(productId);
}

export async function updateVariant(productId: string, variantId: string, input: UpdateVariantInput) {
  await assertProductExists(productId);

  const existing = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
    select: { id: true },
  });
  if (!existing) throw new NotFoundError("Variant not found for this product");

  let attributeData: Prisma.ProductAttributeValueCreateManyVariantInput[] | undefined;
  if (input.attributeValues) {
    const attributeIds: string[] = [];
    for (const assignment of input.attributeValues) {
      attributeIds.push(await resolveAttributeId(assignment.attributeSlug, assignment));
    }
    attributeData = input.attributeValues.map((assignment, index) => ({
      attributeId: attributeIds[index],
      valueAr: assignment.valueAr,
      valueEn: assignment.valueEn,
    }));
  }

  const updated = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      ...(input.sku !== undefined ? { sku: input.sku } : {}),
      ...(input.price !== undefined ? { price: new Prisma.Decimal(input.price) } : {}),
      ...(input.compareAtPrice !== undefined ? { compareAtPrice: toDecimal(input.compareAtPrice) } : {}),
      ...(input.costPrice !== undefined ? { costPrice: toDecimal(input.costPrice) } : {}),
      ...(input.stockQuantity !== undefined ? { stockQuantity: input.stockQuantity } : {}),
      ...(input.reservedQuantity !== undefined ? { reservedQuantity: input.reservedQuantity } : {}),
      ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      // Replaced wholesale: the submitted list *is* the variant's attribute set,
      // so a value the administrator removed must not linger.
      ...(attributeData
        ? { attributeValues: { deleteMany: {}, create: attributeData } }
        : {}),
    },
    select: { isDefault: true },
  });

  if (updated.isDefault) await demoteOtherDefaults(productId, variantId);

  return getAdminProduct(productId);
}

/**
 * Remove a variant, refusing to remove the last one.
 *
 * A product with no variants is unlistable by FR-020, so deleting the final
 * variant would silently take the product off the storefront without anyone
 * asking for that.
 */
export async function deleteVariant(productId: string, variantId: string): Promise<void> {
  await assertProductExists(productId);

  const existing = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
    select: { id: true },
  });
  if (!existing) throw new NotFoundError("Variant not found for this product");

  const remaining = await prisma.productVariant.count({ where: { productId, id: { not: variantId } } });
  if (remaining === 0) {
    throw new ValidationError("A product must keep at least one variant", { code: "LAST_VARIANT" });
  }

  await prisma.productVariant.delete({ where: { id: variantId } });
}

// ─── Admin: specifications ───────────────────────────────────────────────────

/**
 * Replace a product's specification set.
 *
 * A transaction, because a half-applied table is worse than none: the shopper
 * would see some rows from the old product and some from the new one. `sortOrder`
 * comes from array position unless supplied explicitly, so the order an
 * administrator arranged is the order the storefront renders.
 */
export async function replaceSpecifications(productId: string, input: ReplaceSpecificationsInput) {
  await assertProductExists(productId);

  await prisma.$transaction([
    prisma.productSpecification.deleteMany({ where: { productId } }),
    prisma.productSpecification.createMany({
      data: input.specifications.map((spec, index) => ({
        productId,
        keyAr: spec.keyAr,
        keyEn: spec.keyEn,
        valueAr: spec.valueAr,
        valueEn: spec.valueEn,
        sortOrder: spec.sortOrder ?? index,
      })),
    }),
  ]);

  return getAdminProduct(productId);
}

// ─── Admin: images ───────────────────────────────────────────────────────────

/**
 * Attach a stored image to a product.
 *
 * Promoting one image clears the flag on every sibling inside the same
 * transaction, because "exactly one primary per product" is an invariant the
 * schema cannot express (data-model.md §2.4).
 */
export async function addProductImage(productId: string, input: AddProductImageInput) {
  await assertProductExists(productId);
  const makePrimary = input.isPrimary ?? false;

  const imageId = await prisma.$transaction(async (tx) => {
    if (makePrimary) {
      await tx.productImage.updateMany({ where: { productId, isPrimary: true }, data: { isPrimary: false } });
    }

    const highest = await tx.productImage.aggregate({
      where: { productId },
      _max: { sortOrder: true },
    });

    const created = await tx.productImage.create({
      data: {
        productId,
        url: input.url,
        publicId: input.publicId ?? null,
        alt: input.alt ?? null,
        sortOrder: input.sortOrder ?? (highest._max.sortOrder ?? -1) + 1,
        isPrimary: makePrimary,
      },
      select: { id: true },
    });

    return created.id;
  });

  const image = await prisma.productImage.findUniqueOrThrow({
    where: { id: imageId },
    select: { id: true, productId: true, url: true, publicId: true, alt: true, sortOrder: true, isPrimary: true },
  });

  return image;
}

/**
 * Remove an image row and destroy the remote asset.
 *
 * The remote destroy runs *before* the row is deleted, the opposite of
 * `deleteProduct`: this row carries the `publicId` needed to clean up, and a
 * destroy attempted after the row is gone has nothing left to reference.
 */
export async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
    select: { id: true, publicId: true, isPrimary: true },
  });
  if (!image) throw new NotFoundError("Image not found for this product");

  if (image.publicId) await destroyImage(image.publicId);

  await prisma.productImage.delete({ where: { id: image.id } });

  // A product keeps one primary image, so deleting the current one promotes the
  // lowest-sortOrder survivor rather than leaving the card with no image.
  if (image.isPrimary) {
    const successor = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });
    if (successor) {
      await prisma.productImage.update({ where: { id: successor.id }, data: { isPrimary: true } });
    }
  }
}

/**
 * Reorder images to match the submitted id list.
 *
 * The primary flag follows position zero: whatever the administrator put first is
 * the image the product card shows.
 */
export async function reorderProductImages(productId: string, imageIds: string[]): Promise<void> {
  await assertProductExists(productId);

  const owned = await prisma.productImage.findMany({ where: { productId }, select: { id: true } });
  const ownedIds = new Set(owned.map((image) => image.id));

  const unknown = imageIds.filter((id) => !ownedIds.has(id));
  if (unknown.length > 0) {
    throw new NotFoundError(`Image not found for this product: ${unknown.join(", ")}`);
  }

  await prisma.$transaction([
    prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
    ...imageIds.map((id, index) =>
      prisma.productImage.update({ where: { id }, data: { sortOrder: index, isPrimary: index === 0 } }),
    ),
  ]);
}