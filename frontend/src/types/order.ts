export interface OrderListParams {
  filter?: string; //you can filter with ["status", "user", "total_price", "created_at", "subtotal", "discount_total", "coupon_code"]
  page?: number;
  page_size?: number;
  search?: string; //you can search with (full_name or username or email) of users
}

export interface OrderBuyNowPayload {
  product_slug: string;
  quantity: number;
  coupon_code?: string;
}

export interface OrderUpdatePayload {
  status: string;
}
