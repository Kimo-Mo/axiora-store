import type { AxiosError } from 'axios';

export type KnownOrderStatus = 'pending' | 'paid' | 'cancelled' | 'processing' | 'failed';
export type OrderStatus = KnownOrderStatus | (string & {});
export type OrderStatusFilter = 'all' | KnownOrderStatus;

export interface OrderPaymentDetails {
  gateway_id: number;
  gateway_name: string;
  status: string;
  amount: string;
  currency: string;
}

export interface OrderListItem {
  id: number;
  order_number: string;
  status: OrderStatus;
  total_price: string;
  created_at: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    username: string;
  };
  tax: string;
  currency: string;
  discount_total: string;
  subtotal: string;
  coupon_code: string | null;
  items_count: number;
  payment_details: OrderPaymentDetails | null;
}

export interface OrderDetailItem {
  id: number;
  product_name: string;
  product_slug: string;
  quantity: number;
  currency: string;
  price: string;
  created_at: string;
}

export interface OrderDetails {
  id: number;
  order_number: string;
  status: OrderStatus;
  subtotal: string;
  tax: string;
  currency: string;
  coupon_code: string | null;
  discount_total: string;
  total_price: string;
  created_at: string;
  items: OrderDetailItem[];
  payment_details: OrderPaymentDetails | null;
}

export interface CancelOrderResponse {
  data: null;
  message?: string;
  success?: boolean;
}

export const ORDER_STATUS_FILTERS: OrderStatusFilter[] = [
  'all',
  'paid',
  'pending',
  'processing',
  'cancelled',
  'failed',
];

export const formatOrderStatus = (status: OrderStatus): string => {
  if (!status) return 'Unknown';
  return status
    .toString()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    (error instanceof Error ? error.message : null) ||
    fallback
  );
};
