export type PaymentStatus =
  | 'pending'
  | 'intended'
  | 'success'
  | 'failed'
  | 'refunded'
  | 'cancelled'
  | 'processing';

export interface AdminPayment {
  id: number;
  order: number;
  order_number: string;
  full_name: string;
  username: string;
  user_email: string;
  amount: string;
  currency: string;
  gateway_name: string;
  transaction_id: string | null;
  status: PaymentStatus;
  created_at: string;
}

export interface AdminPaymentDetail extends AdminPayment {
  order_status?: string;
  order_details: {
    id: number;
    order_number: string;
    coupon_code: string;
    created_at: string;
    currency: string;
    discount_total: string;
    items: {
      created_at: string;
      currency: string;
      id: number;
      price: string;
      product_name: string;
      product_slug: string;
      quantity: number;
    }[];
  };
}

export interface AdminPaymentListParams {
  page?: number;
  page_size?: number;
  user?: string;
  status?: PaymentStatus | '';
  ordering?: string;
}

export interface AdminUpdatePaymentStatusPayload {
  status: PaymentStatus;
}

export interface PaymentsPaginatedResponse {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: AdminPayment[];
}
