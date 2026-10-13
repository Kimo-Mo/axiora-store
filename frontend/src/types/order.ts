/**
 * Order domain types (Phase 8 — Checkout & Shipping).
 *
 * Aligns frontend order types with `backend/src/modules/orders/orders.types.ts`
 * and contracts/checkout-api.md. All monetary values are 2-decimal numbers.
 *
 * `OrderListParams` is retained only for the legacy orders page and admin hooks
 * that still consume the pre-Phase-8 service surface (rewritten in Phases 11/12).
 */

import type { StorePaymentMethod } from './payment';

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED"
  | "RETURNED";

export type OrderStatusFilter = "ALL" | OrderStatus;

export const ORDER_STATUS_FILTERS: OrderStatusFilter[] = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
  "RETURNED",
];

export interface VariantSnapshotAttributes {
  nameAr: string;
  nameEn: string;
}

/** Bilingual purchase-time snapshot of one purchased variant. */
export interface VariantSnapshot {
  variantId: string;
  nameAr: string;
  nameEn: string;
  sku: string;
  attributes: Record<string, VariantSnapshotAttributes>;
}

/** Immutable flattened copy of the shipping address at purchase time. */
export interface ShippingAddressSnapshot {
  label: string | null;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  area: string | null;
  street: string;
  building: string | null;
  floor: string | null;
  apartment: string | null;
  landmark: string | null;
  notes: string | null;
  estimatedDeliveryDays: number;
}

export interface OrderItemDto {
  id: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  variantSnapshot: VariantSnapshot;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageSnapshot: string | null;
}

export interface OrderStatusHistoryDto {
  id: string;
  status: OrderStatus;
  actor: "CUSTOMER" | "ADMIN" | "SYSTEM";
  note: string | null;
  createdAt: string;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: StorePaymentMethod;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  codFee: number;
  total: number;
  currency: string;
  shippingAddressSnapshot: ShippingAddressSnapshot;
  customerPhoneSnapshot: string;
  notes: string | null;
  /** Hydrated from the address snapshot for the confirmation UI. */
  estimatedDeliveryDays: number | null;
  items: OrderItemDto[];
  statusHistory: OrderStatusHistoryDto[];
  createdAt: string;
}

/** Summary projection for the paginated customer order list. */
export interface OrderSummaryDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: StorePaymentMethod;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
}

export interface OrderPaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderListResultDto {
  orders: OrderSummaryDto[];
  pagination: OrderPaginationDto;
}

/** Admin list projection (Phase 11 admin Orders API; admin UI ships in Phase 13). */
export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: StorePaymentMethod;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface AdminOrderListResultDto {
  orders: AdminOrderListItem[];
  pagination: OrderPaginationDto;
}

/** Body for PATCH /api/v1/admin/orders/:orderNumber/status. */
export interface OrderStatusChangeRequest {
  status: OrderStatus;
  note?: string;
}

/** Legacy filter/query params for the pre-Phase-8 orders surface. */
export interface OrderListParams {
  filter?: string;
  page?: number;
  page_size?: number;
  search?: string;
}
