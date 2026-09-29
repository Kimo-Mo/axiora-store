// Admin-scoped user types, sourced from UserAdminListSerializer & AdminCreateUserSerializer
import type { OrderStatus } from './orders';

export type RoleEnum = 'user' | 'admin' | 'seller' | 'developer';
export type ProviderEnum = 'email' | 'google' | 'facebook' | string;

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  role: RoleEnum;
  avatar: string | null;
  is_verified: boolean;
  provider: ProviderEnum;
  last_login: string | null;
  date_joined: string;
  last_updated: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_hidden: boolean;
}

export interface AdminCreateUserPayload {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
  full_name?: string;
  role?: RoleEnum;
  is_superuser?: boolean;
  is_staff?: boolean;
  is_verified?: boolean;
  is_active?: boolean;
}

export interface AdminUpdateUserPayload {
  username?: string;
  email?: string;
  full_name?: string;
  role?: RoleEnum;
  is_active?: boolean;
  is_staff?: boolean;
}

export interface UserListParams {
  search?: string; //you can search with (full_name or username or email) of users
  filter?: string; //you can filter with ["role", "is_active", "provider", "is_verified"]
  role?: string;
  is_active?: boolean;
  provider?: string;
  is_verified?: boolean;
  page?: number;
  page_size?: number;
}

export interface UserOrderSummary {
  id: string;
  order_number: string;
  created_at: string;
  status: OrderStatus;
  total_price: string;
  items_count: number;
}

export interface UserProfileResponse {
  user: AdminUser;
  orders: UserOrderSummary[];
}
