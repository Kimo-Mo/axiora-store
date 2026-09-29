// Admin-scoped order types, sourced from OrderListSerializer & OrderDetailSerializer

export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'paid' | 'processing' | 'failed';

export interface OrderPaymentDetails {
  gateway_id: number;
  gateway_name: string;
  status: string;
  amount: string;
  currency: string;
}

export interface AdminOrder {
  id: number;
  order_number: string;
  status: OrderStatus;
  total_price: string;
  subtotal: string;
  tax: string;
  currency: string;
  discount_total: string;
  coupon_code: string | null;
  created_at: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    username: string;
  };
  items_count: number;
  payment_details: OrderPaymentDetails | null;
}

export interface AdminOrderItem {
  id: number;
  product_name: string;
  product_slug: string;
  quantity: number;
  price: string;
  currency: string;
  created_at: string;
}

export interface AdminOrderDetail {
  id: number;
  order_number: string;
  user: string;
  status: OrderStatus;
  subtotal: string;
  tax: string;
  currency: string;
  coupon_code: string | null;
  discount_total: string;
  total_price: string;
  created_at: string;
  items: AdminOrderItem[];
  payment_details: OrderPaymentDetails | null;
}

export interface AdminOrderListParams {
  filter?: string;
  page?: number;
  page_size?: number;
  search?: string;
}

export interface AdminOrderUpdatePayload {
  status: OrderStatus;
  send_notification?: boolean;
  notification_data?: {
    subject: string;
    message: string;
    email_type: string; // default: 'default'
  };
}
