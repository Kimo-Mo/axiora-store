import api from '../lib/api/axios';

export interface PaymentListParams {
  page?: number;
  page_size?: number;
  user?: string; //you can search with: ['username', 'user_email','full_name']
  status?: string;
  ordering?: string | string[]; // amount | -amount , created_at | -created_at
}

export interface InitPaymentPayload {
  order_id: string;
  gateway_code: string;
  redirection_url?: string;
}

type PaymentGenericPayload = Record<string, string | number | boolean | null | object>;

export const paymentService = {
  // Public methods
  getGateways: async () => {
    const { data } = await api.get('/payments/gateways/');
    return data;
  },
  initPayment: async (payload: InitPaymentPayload) => {
    const { data } = await api.post('/payments/init-payment/', payload);
    return data;
  },
  getPaymobToken: async (payload: PaymentGenericPayload) => {
    const { data } = await api.post('https://accept.paymob.com/api/auth/tokens', payload);
    return data;
  },
  createPaymobIntention: async (payload: PaymentGenericPayload) => {
    const { data } = await api.post('https://accept.paymob.com/v1/intention', payload);
    return data;
  },
  getUserPayments: async (userId: string) => {
    const { data } = await api.get(`/payments/user/${userId}/`);
    return data;
  },
  getOrderPayments: async (orderId: string) => {
    const { data } = await api.get(`/payments/order/${orderId}/`);
    return data;
  },

  // Admin methods
  adminPaymentsList: async (params?: PaymentListParams) => {
    const { data } = await api.get('/payments/admin/list/', { params });
    return data;
  },
  adminUpdatePaymentStatus: async (paymentId: number | string, payload: { status: string }) => {
    const { data } = await api.patch(`/payments/admin/update-status/${paymentId}/`, payload);
    return data;
  },
  adminPaymentDetail: async (paymentId: number | string) => {
    const { data } = await api.get(`/payments/admin/detail/${paymentId}/`);
    return data;
  },
};
