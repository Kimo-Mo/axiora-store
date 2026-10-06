/**
 * Cart domain DTOs and interfaces (research.md D-3, data-model.md §3.2, contracts/cart-api.md).
 *
 * Defines the authoritative response structures returned by the Express cart module
 * and consumed by the storefront client.
 */

import { StockStatus } from "../products/products.types";

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

export interface AddToCartInput {
  variantId: string;
  quantity?: number;
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

export const DEFAULT_CURRENCY = "EGP";
export const MAX_CART_ITEM_QUANTITY = 99;
