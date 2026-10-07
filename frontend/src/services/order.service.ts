import api from '../lib/api/axios';
import { OrderListParams } from '@/types';
import type { AdminOrderUpdatePayload } from '@/types/admin/orders';
import type { CreateOrderPayload } from '@/types/checkout';
import type { CheckoutQuoteDto } from '@/types/checkout';
import type { OrderDto, OrderListResultDto } from '@/types/order';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: { message?: string; code?: string };
}

export const orderService = {
  /**
   * Server-computed pre-order totals for the current cart + selected governorate.
   * Creates nothing; amounts are recomputed at order creation (FR-005/FR-006).
   */
  quote: async (payload: { governorate: string; paymentMethod: 'COD' }): Promise<CheckoutQuoteDto> => {
    const response = await api.post<ApiResponse<CheckoutQuoteDto>>('/checkout/quote', payload);
    return response.data.data;
  },

  /**
   * Create a COD order (transactional, idempotent via `idempotencyKey`).
   * A 200 replay response returns the already-created order.
   */
  create: async (payload: CreateOrderPayload): Promise<OrderDto> => {
    const response = await api.post<ApiResponse<OrderDto>>('/orders', payload);
    return response.data.data;
  },

  /** Paginated list of the requesting customer's orders (newest first). */
  list: async (params?: { page?: number; limit?: number; status?: string }): Promise<OrderListResultDto> => {
    const response = await api.get<ApiResponse<OrderListResultDto>>('/orders', { params });
    return response.data.data;
  },

  /** Full detail for an order owned by the caller. */
  detail: async (orderNumber: string): Promise<OrderDto> => {
    const response = await api.get<ApiResponse<OrderDto>>(
      `/orders/${encodeURIComponent(orderNumber)}`
    );
    return response.data.data;
  },

  /** Cancel a PENDING/CONFIRMED order; reserved stock is released. */
  cancel: async (orderNumber: string): Promise<OrderDto> => {
    const response = await api.post<ApiResponse<OrderDto>>(
      `/orders/${encodeURIComponent(orderNumber)}/cancel`
    );
    return response.data.data;
  },

  // --- Legacy compatibility shims below (rebuilt in Phases 11 & 12) ---

  /** @deprecated Legacy Django-era endpoint. Will be replaced by customer order tracking in Phase 11. */
  getOrdersList: async (params?: OrderListParams) => {
    const { data } = await api.get('/orders/all', { params });
    return data;
  },
  /** @deprecated Legacy Django-era endpoint. Will be replaced by customer order tracking in Phase 11. */
  getOrderDetail: async (id: string) => {
    const { data } = await api.get(`/orders/order/${id}`);
    return data;
  },
  /** @deprecated Legacy Django-era endpoint. Will be replaced by customer order tracking in Phase 11. */
  cancelOrder: async (id: string) => {
    const { data } = await api.post(`/orders/order/${id}/cancel/`);
    return data;
  },

  /** @deprecated Legacy admin endpoint. Will be migrated to Express admin orders module in Phase 12. */
  adminOrdersList: async (params?: OrderListParams) => {
    const { data } = await api.get('/orders/admin/all', { params });
    return data;
  },
  /** @deprecated Legacy admin endpoint. Will be migrated to Express admin orders module in Phase 12. */
  adminOrdersStats: async () => {
    const { data } = await api.get('/orders/admin/stats/');
    return data;
  },
  /** @deprecated Legacy admin endpoint. Will be migrated to Express admin orders module in Phase 12. */
  adminOrderDetails: async (id: string) => {
    const { data } = await api.get(`/orders/admin/${id}`);
    return data;
  },
  /** @deprecated Legacy admin endpoint. Will be migrated to Express admin orders module in Phase 12. */
  adminUpdateOrder: async (id: string, payload: AdminOrderUpdatePayload) => {
    const { data } = await api.patch(`/orders/admin/${id}/`, payload);
    return data;
  },
  /** @deprecated Legacy admin endpoint. Will be migrated to Express admin orders module in Phase 12. */
  adminDeleteOrder: async (id: string) => {
    const { data } = await api.delete(`/orders/admin/${id}/`);
    return data;
  },
};
