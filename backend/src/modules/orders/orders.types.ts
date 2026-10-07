/**
 * Order domain DTOs (data-model.md §6, contracts/checkout-api.md §4).
 *
 * All monetary values are `number` (2-decimal) — Prisma `Decimal` is converted
 * at the hydration boundary (research.md D-10). Keep in sync with
 * `frontend/src/types/order.ts` and `frontend/src/types/checkout.ts`.
 */

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED"
  | "RETURNED";

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

/** Immutable flattened copy of the shipping address at purchase time (§3.1). */
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
  note: string | null;
  createdAt: string;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: "COD";
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
  paymentMethod: "COD";
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

export interface UnavailableItemDto {
  variantId: string;
  productNameAr: string;
  productNameEn: string;
}

/** Server-computed pre-order totals (research.md D-4). */
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

export interface NewAddressInput {
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

export interface CreateOrderInput {
  idempotencyKey: string;
  paymentMethod: "COD";
  customerPhone: string;
  notes?: string | null;
  shippingAddressId?: string;
  newAddress?: NewAddressInput;
  saveNewAddress?: boolean;
}

export const DEFAULT_CURRENCY = "EGP";
