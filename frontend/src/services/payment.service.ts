import api from '../lib/api/axios';
import { OrderListParams } from '@/types';
import type { InitiatePaymentResponse, PaymentMethodsDto } from '@/types/payment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: { message?: string; code?: string };
}

/**
 * @deprecated Shape of the legacy Django-era initiation body. Kept only for the
 * legacy order-details modal, which is rebuilt in Phase 11.
 */
export interface InitPaymentPayload {
  order_id: string;
  gateway_code: string;
  redirection_url?: string;
}

/**
 * Storefront payment access (FR-020).
 *
 * Every payment capability the storefront needs — listing available methods and
 * starting a payment session — goes through this service and the Express backend.
 * Nothing here talks to a payment provider directly: the legacy browser-side
 * `accept.paymob.com` calls that this file used to contain sent an API key from
 * the client, which is precisely what NFR-003 forbids, so they are gone rather
 * than reimplemented server-side-once-per-tab.
 *
 * All provider knowledge (credentials, endpoints, signatures) is confined to the
 * backend `payments` module.
 */
export const paymentService = {
  /** Methods the store currently offers; drives the checkout payment step. */
  getPaymentMethods: async (): Promise<PaymentMethodsDto> => {
    const response = await api.get<ApiResponse<PaymentMethodsDto>>('/payment-methods');
    return response.data.data;
  },

  /**
   * Create (or re-return) the payment session for an awaiting-payment online
   * order. `reused: true` means an active session was returned rather than a new
   * one, so calling this twice never produces two charges.
   */
  initiate: async (orderNumber: string, locale: 'ar' | 'en'): Promise<InitiatePaymentResponse> => {
    const response = await api.post<ApiResponse<InitiatePaymentResponse>>('/payments/create', {
      orderNumber,
      locale,
    });
    return response.data.data;
  },

  // --- Legacy compatibility shims below (rebuilt in Phases 12 & 13) ---
  // These target the pre-Phase-8 Django API and are still referenced by the
  // admin payments dashboard and the legacy order-details modal, both of which
  // are rebuilt in later phases. No storefront payment capability uses them.

  /** @deprecated Legacy Django-era endpoint. Rebuilt with the admin payments module in Phase 13. */
  initPayment: async (payload: InitPaymentPayload) => {
    const { data } = await api.post('/payments/init-payment/', payload);
    return data;
  },
  /** @deprecated Legacy Django-era endpoint. Rebuilt with the admin payments module in Phase 13. */
  getUserPayments: async (userId: string) => {
    const { data } = await api.get(`/payments/user/${userId}/`);
    return data;
  },
  /** @deprecated Legacy Django-era endpoint. Rebuilt with the admin payments module in Phase 13. */
  getOrderPayments: async (orderId: string) => {
    const { data } = await api.get(`/payments/order/${orderId}/`);
    return data;
  },
  /** @deprecated Legacy Django-era endpoint. Rebuilt with the admin payments module in Phase 13. */
  adminPaymentsList: async (params?: OrderListParams) => {
    const { data } = await api.get('/payments/admin/list/', { params });
    return data;
  },
  /** @deprecated Legacy Django-era endpoint. Rebuilt with the admin payments module in Phase 13. */
  adminUpdatePaymentStatus: async (paymentId: number | string, payload: { status: string }) => {
    const { data } = await api.patch(`/payments/admin/update-status/${paymentId}/`, payload);
    return data;
  },
  /** @deprecated Legacy Django-era endpoint. Rebuilt with the admin payments module in Phase 13. */
  adminPaymentDetail: async (paymentId: number | string) => {
    const { data } = await api.get(`/payments/admin/detail/${paymentId}/`);
    return data;
  },
};