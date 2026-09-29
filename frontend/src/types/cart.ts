import { Product } from './catalog';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  formData?: Record<string, string>;
  unit_price?: string;
}

export interface CartPayload {
  product_slug: string;
  quantity: number;
}

export interface CartResponse {
  id: string;
  items: CartItem[];
  coupon: string | null;
  subtotal: string;
  discount: string;
  total_after_discount: string;
  exchange_rate: string;
}