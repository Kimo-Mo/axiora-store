// Admin-scoped product types

export type StockModeEnum = 'automatic' | 'manual';

export interface AdminProductAttribute {
  id?: number;
  name: string;
  value: string;
}

export interface AdminProductImage {
  id?: number;
  image: File | string;
  is_main: boolean;
}

/** Payload for POST /dashboard/admin/products/create/ (multipart/form-data) */
export interface AdminProductCreatePayload {
  name: string;
  price?: number | null;
  stock_mode?: StockModeEnum;
  manual_fulfillment_time?: number | null;
  short_description?: string;
  description?: string;
  info?: object | null;
  logo?: File | null;
  is_active?: boolean;
  is_available?: boolean;
  is_popular?: boolean;
  category?: number[]; // category IDs
  tags?: number[]; // tag IDs
  codes?: string; // JSON array string
  images?: AdminProductImage[];
  attributes?: AdminProductAttribute[];
}

export interface AdminProductListParams {
  search?: string;
  category?: string;
  page?: number;
  page_size?: number;
  is_available?: boolean;
}
