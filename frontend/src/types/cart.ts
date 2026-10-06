/**
 * Cart domain types (Phase 7 — Cart System).
 *
 * Aligns frontend cart types with `backend/src/modules/carts/carts.types.ts`
 * and contracts/cart-api.md.
 */

import type { StockStatus } from "./catalog";

export interface CartItemProductSummary {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  primaryImage: string | null;
}

export interface CartItemVariantSummary {
  id: string;
  sku: string;
  attributes: Record<string, { nameAr: string; nameEn: string }>;
}

export interface CartItemDto {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  compareAtPrice: number | null;
  lineTotal: number;
  availableStock: number;
  stockStatus: StockStatus;
  isAvailable: boolean;
  product: CartItemProductSummary;
  variant: CartItemVariantSummary;
}

export type CartNoticeType = "STOCK_CAPPED" | "OUT_OF_STOCK" | "PRICE_CHANGED";

export interface CartNotice {
  type: CartNoticeType;
  variantId: string;
  productNameAr: string;
  productNameEn: string;
  oldValue?: number;
  newValue?: number;
  messageAr: string;
  messageEn: string;
}

export interface CartResponseDto {
  id: string;
  items: CartItemDto[];
  subtotal: number;
  itemCount: number;
  currency: string;
  hasUnavailableItems: boolean;
  notices: CartNotice[];
}

export const DEFAULT_CURRENCY = 'EGP';
export const MAX_CART_ITEM_QUANTITY = 99;

export interface AddToCartInput {
  variantId: string;
  quantity?: number;
  // Optional client snapshot for guest carts
  product?: {
    id: string;
    slug: string;
    nameAr: string;
    nameEn: string;
    primaryImage: string | null;
  };
  variant?: {
    id: string;
    sku: string;
    price: number;
    compareAtPrice: number | null;
    attributes: Record<string, { nameAr: string; nameEn: string }>;
    availableStock?: number | null;
    stockStatus?: StockStatus;
  };
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface MergeCartItemInput {
  variantId: string;
  quantity: number;
}

export interface MergeCartInput {
  items: MergeCartItemInput[];
}

/** Client-side offline snapshot stored in localStorage for unauthenticated guests. */
export interface GuestCartItem {
  id: string; // `${variantId}`
  variantId: string;
  productId: string;
  productSlug: string;
  nameAr: string;
  nameEn: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  attributes: Record<string, { nameAr: string; nameEn: string }>;
  stockStatus: StockStatus;
  availableStock: number | null;
}