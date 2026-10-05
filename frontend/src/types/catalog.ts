/**
 * Catalog domain types (Phase 6 — Product Catalog).
 *
 * Mirrors `backend/prisma/schema.prisma` and the public DTOs in
 * `backend/src/modules/products/products.types.ts`. Keep the two in sync.
 *
 * The split between the *entity* types (`Product`, `ProductVariant`, …) and the
 * `Public*` DTOs is deliberate. Entities mirror database rows and are what admin
 * tooling works with. The `Public*` DTOs are what the storefront receives, and they
 * are the only ones that carry resolved pricing and threshold-masked stock — the
 * storefront must never compute either itself (Constitution Principle II).
 */

// ─── Bilingual primitives ────────────────────────────────────────────────────

/** Both scripts always travel together, so switching locale costs no round trip. */
export interface LocalizedText {
  nameAr: string;
  nameEn: string;
}

/**
 * Read the active locale's field from a bilingual pair, falling back to the other
 * script rather than rendering an empty label when one translation is missing.
 *
 * `locale` is a plain `string` because that is how `next-intl` types the active
 * locale; narrowing it here would only push a cast into every call site.
 */
export function localized(item: LocalizedText, locale: string): string {
  const primary = locale === 'ar' ? item.nameAr : item.nameEn;
  const fallback = locale === 'ar' ? item.nameEn : item.nameAr;
  return primary?.trim() || fallback?.trim() || '';
}

/**
 * Read an arbitrary bilingual field pair (`descriptionAr` / `descriptionEn`, …).
 *
 * Generic rather than `Record<string, string | null>` because a declared interface
 * has no index signature and would not satisfy that constraint — forcing every
 * caller into a cast to read one field would be worse than the generic.
 */
export function localizedField<T extends object>(item: T, base: string, locale: string): string | null {
  const fields = item as Record<string, string | null | undefined>;
  const primary = locale === 'ar' ? fields[`${base}Ar`] : fields[`${base}En`];
  const fallback = locale === 'ar' ? fields[`${base}En`] : fields[`${base}Ar`];
  return primary?.trim() || fallback?.trim() || null;
}

// ─── Inventory presentation (research.md D-4) ────────────────────────────────

/**
 * Above this many available units the server suppresses the count and reports
 * `IN_STOCK`. Only 1–5 exposes a number. Keep in sync with
 * `LOW_STOCK_THRESHOLD` in `backend/src/modules/products/products.types.ts`.
 */
export const LOW_STOCK_THRESHOLD = 5;

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

// ─── Entities (mirror the Prisma models) ─────────────────────────────────────

export interface Brand extends LocalizedText {
  id: string;
  slug: string;
  logo: string | null;
  isActive: boolean;
}

export interface ProductCategory extends LocalizedText {
  id: string;
  slug: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  parentId: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  publicId: string | null;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductAttribute extends LocalizedText {
  id: string;
  slug: string;
}

export interface ProductAttributeValue {
  id: string;
  attributeId: string;
  variantId: string;
  valueAr: string;
  valueEn: string;
}

/**
 * A purchasable SKU. Everything physical about a product hangs off this: the
 * storefront never prices a product itself, it reads the price of a variant.
 */
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  stockQuantity: number;
  reservedQuantity: number;
  isDefault: boolean;
  isActive: boolean;
  attributeValues?: ProductAttributeValue[];
}

export interface ProductSpecification {
  id: string;
  productId: string;
  keyAr: string;
  keyEn: string;
  valueAr: string;
  valueEn: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  sku: string;
  shortDescriptionAr: string | null;
  shortDescriptionEn: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  brandId: string;
  categoryId: string;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  warranty: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Public DTOs ─────────────────────────────────────────────────────────────

export interface CategorySummary extends LocalizedText {
  id: string;
  slug: string;
}

export interface CategoryBreadcrumb extends LocalizedText {
  slug: string;
}

/** One node of the store filter's category tree. */
export interface PublicCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  productCount: number;
  children: PublicCategory[];
}

export interface PublicCategoryDetail extends Omit<PublicCategory, 'children'> {
  breadcrumbs: CategoryBreadcrumb[];
  children: PublicCategory[];
}

export interface PublicBrand extends LocalizedText {
  id: string;
  slug: string;
  logo: string | null;
  productCount: number;
}

export interface BrandSummary extends LocalizedText {
  id: string;
  slug: string;
  logo?: string | null;
}

export interface ProductPrimaryImage {
  url: string;
  alt: string | null;
}

/**
 * Server-resolved pricing. `fromPrice` is `MIN(price)` across active variants;
 * `compareAtPrice` is only set when it genuinely exceeds `fromPrice`.
 */
export interface PublicPricing {
  fromPrice: number;
  compareAtPrice: number | null;
  hasDiscount: boolean;
  discountPercentage: number;
}

export interface VariantAttributeValue {
  nameAr: string;
  nameEn: string;
}

export interface PublicVariantDto {
  id: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  isDefault: boolean;
  stockStatus: StockStatus;
  /** `null` unless the status is `LOW_STOCK`; never above the threshold. */
  availableQuantity: number | null;
  /** Keyed by attribute slug, e.g. `{ color: { nameAr, nameEn } }`. */
  attributes: Record<string, VariantAttributeValue>;
}

export interface PublicProductAttribute extends LocalizedText {
  id: string;
  slug: string;
  values: Array<{ valueAr: string; valueEn: string }>;
}

export interface PublicSpecification {
  id: string;
  keyAr: string;
  keyEn: string;
  valueAr: string;
  valueEn: string;
  sortOrder: number;
}

/** A product card in the store listing. */
export interface PublicProductListItem {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  sku: string;
  shortDescriptionAr: string | null;
  shortDescriptionEn: string | null;
  currency: string;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  brand: CategorySummary;
  category: CategorySummary;
  primaryImage: ProductPrimaryImage | null;
  pricing: PublicPricing;
  stockStatus: StockStatus;
  activeVariantCount: number;
}

export interface PublicProductDetail {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  sku: string;
  shortDescriptionAr: string | null;
  shortDescriptionEn: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  currency: string;
  warranty: string | null;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  brand: BrandSummary;
  category: CategorySummary & { breadcrumbs: CategoryBreadcrumb[] };
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  specifications: PublicSpecification[];
  attributes: PublicProductAttribute[];
  variants: PublicVariantDto[];
}

/**
 * Trimmed card used by the related-products strip.
 *
 * Aliasing rather than a fresh `Pick` keeps the two provably the same shape when
 * the DTO changes.
 */
export type RelatedProduct = Pick<
  PublicProductListItem,
  | 'id'
  | 'nameAr'
  | 'nameEn'
  | 'slug'
  | 'currency'
  | 'brand'
  | 'category'
  | 'primaryImage'
  | 'pricing'
  | 'stockStatus'
>;

/**
 * The fields a card actually renders.
 *
 * A listing row satisfies it and so does a related-product row, so one card
 * component serves both. `isNew` / `isBestSeller` and the short description are
 * optional because the related-products endpoint omits them (FR-008) and a card
 * without a "New" ribbon is still a correct card.
 */
export type ProductCardData = Pick<
  PublicProductListItem,
  'id' | 'nameAr' | 'nameEn' | 'slug' | 'currency' | 'brand' | 'category' | 'primaryImage' | 'pricing' | 'stockStatus'
> & {
  isNew?: boolean;
  isBestSeller?: boolean;
  shortDescriptionAr?: string | null;
  shortDescriptionEn?: string | null;
};

// ─── Query + pagination ──────────────────────────────────────────────────────

export const CATALOG_SORT_OPTIONS = [
  'newest',
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
  'bestseller',
] as const;

export type CatalogSort = (typeof CATALOG_SORT_OPTIONS)[number];

export const DEFAULT_CATALOG_SORT: CatalogSort = 'newest';

/** The store listing is 20 per page; the backend caps this at 50. */
export const CATALOG_PAGE_SIZE = 20;

/** Search input is debounced this long before it reaches the URL (research.md D-6). */
export const SEARCH_DEBOUNCE_MS = 350;

export interface CatalogSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  /** Category slug or id; the backend expands it to include every descendant. */
  category?: string;
  /** Brand slugs or ids, OR-ed together. */
  brands?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  sort?: CatalogSort;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

/**
 * The `{ success, data, meta }` envelope every catalog endpoint returns.
 *
 * Named distinctly from the Django-shaped `PaginatedResponse` in `common.ts`,
 * which is still consumed by the not-yet-migrated admin screens. Two different
 * pagination shapes are in flight during the migration and conflating them would
 * make every call site ambiguous.
 */
export interface CatalogPaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

// ─── Admin payloads ──────────────────────────────────────────────────────────

export interface CreateProductPayload {
  nameAr: string;
  nameEn: string;
  slug: string;
  sku: string;
  brandId: string;
  categoryId: string;
  shortDescriptionAr?: string;
  shortDescriptionEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  warranty?: string;
  currency?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
}

export interface CreateVariantPayload {
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  stockQuantity: number;
  isDefault?: boolean;
  attributeValues: Array<{ attributeSlug: string; valueAr: string; valueEn: string }>;
}

export interface CreateCategoryPayload {
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  parentId?: string | null;
  image?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateBrandPayload {
  nameAr: string;
  nameEn: string;
  slug: string;
  logo?: string | null;
  isActive?: boolean;
}

export interface UploadedAsset {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}