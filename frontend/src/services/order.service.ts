import api from '../lib/api/axios';
import { OrderListParams, OrderBuyNowPayload } from '@/types';
import type { AdminOrderUpdatePayload } from '@/types/admin/orders';

export const orderService = {
  // Public
  getOrdersList: async (params?: OrderListParams) => {
    const { data } = await api.get('/orders/all', { params });
    return data;
  },
  getOrderDetail: async (id: string) => {
    const { data } = await api.get(`/orders/order/${id}`);
    return data;
  },
  cancelOrder: async (id: string) => {
    const { data } = await api.post(`/orders/order/${id}/cancel/`);
    return data;
  },
  checkout: async () => {
    const { data } = await api.post('/orders/checkout/');
    return data;
  },
  buyNow: async (payload: OrderBuyNowPayload) => {
    const { data } = await api.post('/orders/buy-now/', payload);
    return data;
  },

  // Admin
  adminOrdersList: async (params?: OrderListParams) => {
    const { data } = await api.get('/orders/admin/all', { params });
    return data;
  },
  adminOrdersStats: async () => {
    const { data } = await api.get('/orders/admin/stats/');
    return data;
  },
  adminOrderDetails: async (id: string) => {
    const { data } = await api.get(`/orders/admin/${id}`);
    return data;
  },
  adminUpdateOrder: async (id: string, payload: AdminOrderUpdatePayload) => {
    const { data } = await api.patch(`/orders/admin/${id}/`, payload);
    return data;
  },
  adminDeleteOrder: async (id: string) => {
    const { data } = await api.delete(`/orders/admin/${id}/`);
    return data;
  },
};
