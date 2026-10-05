/**
 * Legacy Django-era catalog shapes.
 *
 * These are **not** the current catalog contract. `types/catalog.ts` holds the
 * Prisma-aligned types the storefront uses; this file quarantines the shapes that
 * the not-yet-migrated screens still expect, so that migrating one screen at a
 * time does not mean breaking every screen at once.
 *
 * Still consumed by:
 *  - the cart store and cart rows (cart phases)
 *  - the admin dashboard product/tag screens (admin phases)
 *  - the navbar search box and its tag chips
 *
 * Nothing new should import from here. When a consumer is migrated, delete its
 * entry from this list — and delete the file once the list is empty.
 *
 * The shapes are kept byte-for-byte equivalent to what `@/types` used to export,
 * which is why the field names are snake_case and the ids are numbers.
 */

/**
 * Retired Django image shape.
 *
 * Named `Legacy*` because `types/catalog.ts` exports the Prisma-aligned
 * `ProductImage` under the plain name, and the `@/types` barrel re-exports both.
 */
export interface LegacyProductImage {
  id: number;
  image: string;
  is_main: boolean;
}

export interface LegacyProductTag {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface LegacyProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number | null;
  level?: number;
  order?: number;
  is_active?: boolean;
  image?: string | null;
  logo?: string | null;
  children?: LegacyProductCategory[];
}

export interface LegacyProduct {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  price_before_offer?: number | null;
  offer_value?: number | null;
  discount_percent?: number;
  main_image: LegacyProductImage | string | null;
  categories: LegacyProductCategory[];
  tags: LegacyProductTag[];

  // Optional/detail fields
  stock_mode?: string;
  manual_fulfillment_time?: string | null;
  description?: string;
  short_description?: string;
  is_active?: boolean;
  is_available?: boolean;
  is_popular?: boolean;
  is_featured?: boolean;
  help?: string | null;
  logo?: string | null;
  info?: string | null;
  currency?: string;
  images?: LegacyProductImage[];
  attributes?: { id: number; name: string; value: string }[];
  product?: LegacyProduct;
}

/** Request shape the retired Django admin catalog endpoints accepted. */
export interface LegacyCatalogSearchParams {
  search?: string;
  category?: string;
  categories?: string | string[];
  is_popular?: boolean;
  tags?: string | string[];
  price_min?: number;
  price_max?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
  is_available?: boolean;
  is_featured?: boolean;
  filter?: string;
}

export interface LegacyCategoryPayload {
  name: string;
  description?: string;
  image?: File | string;
}

export interface LegacyProductPayload {
  name: string;
  category_id: string;
  description?: string;
  price?: number;
}

export interface LegacyTagPayload {
  name: string;
}