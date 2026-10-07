/**
 * Checkout domain types (Phase 8 — Checkout & Shipping).
 *
 * Aligns with `backend/src/modules/orders/orders.types.ts` and
 * contracts/checkout-api.md. Quote and rate amounts are server-computed;
 * client values are never accepted by the order API.
 */

import type { ShippingAddressSnapshot } from "./order";

export interface ShippingRateDto {
  id: string;
  governorate: string;
  zone: string | null;
  deliveryFee: number;
  estimatedDays: number;
}

export interface CheckoutQuoteDto {
  subtotal: number;
  shippingFee: number;
  codFee: number;
  discountTotal: number;
  total: number;
  currency: string;
  estimatedDays: number | null;
  isOrderable: boolean;
  unavailableItems: UnavailableItemDto[];
}

export interface UnavailableItemDto {
  variantId: string;
  productNameAr: string;
  productNameEn: string;
}

/** A new address entered during checkout (applies to this order only). */
export interface CheckoutNewAddress {
  label?: string | null;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  area?: string | null;
  street: string;
  building?: string | null;
  floor?: string | null;
  apartment?: string | null;
  landmark?: string | null;
  notes?: string | null;
  isDefault?: boolean;
}

export interface CreateOrderPayload {
  idempotencyKey: string;
  paymentMethod: "COD";
  customerPhone: string;
  notes?: string | null;
  shippingAddressId?: string;
  newAddress?: CheckoutNewAddress;
  saveNewAddress?: boolean;
}

export type ShippingAddressSnapshotDto = ShippingAddressSnapshot;
