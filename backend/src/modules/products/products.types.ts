/**
 * Public catalog DTOs (research.md D-4, contracts/catalog-api.md).
 *
 * These are the shapes `/api/v1/categories`, `/api/v1/brands` and
 * `/api/v1/products` return. They are deliberately *not* the Prisma rows:
 *
 *  - Prices are resolved server-side into a single `pricing` block, so a client
 *    can never disagree with the server about what a product costs.
 *  - `availableQuantity` is `null` whenever the raw count exceeds
 *    {@link LOW_STOCK_THRESHOLD}. A public client never receives an inventory
 *    count above that threshold — only the status bucket, and for the thin band
 *    below it, the exact number.
 */

/**
 * Above this many available units the exact count is suppressed and reported as
 * `IN_STOCK`. Only `1..LOW_STOCK_THRESHOLD` exposes a number.
 */
export const LOW_STOCK_THRESHOLD = 5;

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type CatalogSort =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc"
  | "bestseller";

/** Bilingual value. Both scripts always travel together so switching locale costs no round trip (research.md D-7). */
export interface LocalizedText {
  nameAr: string;
  nameEn: string;
}

export interface CategorySummary extends LocalizedText {
  id: string;
  slug: string;
}

/** One step of the breadcrumb trail, root first. */
export interface CategoryBreadcrumb extends LocalizedText {
  slug: string;
}

export interface PublicCategory extends LocalizedText {
  id: string;
  slug: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  /** Active products in this category only, excluding descendants. */
  productCount: number;
  children: PublicCategory[];
}

export interface PublicCategoryDetail extends Omit<PublicCategory, "children"> {
  breadcrumbs: CategoryBreadcrumb[];
  children: PublicCategory[];
}

export interface PublicBrand extends LocalizedText {
  id: string;
  slug: string;
  logo: string | null;
  /** Active products across every category this brand appears in. */
  productCount: number;
}

export interface BrandSummary extends LocalizedText {
  id: string;
  slug: string;
  logo?: string | null;
}

export interface PublicProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductPrimaryImage {
  url: string;
  alt: string | null;
}

/**
 * Server-resolved pricing for a product.
 *
 * `fromPrice` is `MIN(price)` across active variants. `compareAtPrice` is the
 * highest active `compareAtPrice`, and only when it exceeds `fromPrice` — a
 * "was" price below the current one is not a discount.
 */
export interface PublicPricing {
  fromPrice: number;
  compareAtPrice: number | null;
  hasDiscount: boolean;
  discountPercentage: number;
}

/** Attribute assignment on one variant, keyed by attribute slug. */
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
  /** `null` unless {@link StockStatus} is `LOW_STOCK`; never above the threshold. */
  availableQuantity: number | null;
  attributes: Record<string, VariantAttributeValue>;
}

/** One selectable dimension of a product (Color, Storage, …) with its observed values. */
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
  /** Aggregate over active variants: `IN_STOCK` wins, then `LOW_STOCK`, then `OUT_OF_STOCK`. */
  stockStatus: StockStatus;
  activeVariantCount: number;
  /** Lowest-priced or default active in-stock variant ID for one-click adds (research.md D-5). */
  defaultVariantId: string | null;
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
  images: PublicProductImage[];
  specifications: PublicSpecification[];
  attributes: PublicProductAttribute[];
  variants: PublicVariantDto[];
}

/** Trimmed card used by the related-products strip. */
export type RelatedProduct = Omit<
  PublicProductListItem,
  "sku" | "shortDescriptionAr" | "shortDescriptionEn" | "isFeatured" | "isNew" | "isBestSeller" | "activeVariantCount"
>;

/** Validated query parameters for `GET /api/v1/products`. */
export interface CatalogQuery {
  page: number;
  limit: number;
  search?: string;
  /** Category slug or id; expanded to include every descendant (research.md D-2). */
  category?: string;
  /** Brand slugs or ids, OR-ed together. */
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  sort: CatalogSort;
}

/** Payload accepted by the Multer middleware, carried on the request for the controller. */
export interface UploadedImageFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
}