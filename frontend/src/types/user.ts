export type RoleEnum = 'user' | 'admin' | 'seller' | 'developer';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  full_name?: string | null;
  role?: RoleEnum;
  avatar?: string | null;
  provider?: string;
  settings?: {
    language_preference: string;
    mode: string;
    location: string | null;
    currency: string;
  };
}

export interface UpdateProfilePayload {
  full_name?: string;
  username?: string;
  email?: string;
  avatar?: File | string;
  profile?: {
    phone?: string;
    country?: string;
    city?: string;
  };
  settings?: {
    language_preference?: string;
    mode?: string;
    location?: string | null;
    currency?: string;
  };
}

export interface AdminAddUserPayload {
  email: string;
  username: string;
  password?: string;
  role?: string;
}

export interface AdminUpdateUserPayload extends UpdateProfilePayload {
  role?: string;
  is_active?: boolean;
}

export interface UserListParams {
  search?: string; // you can search with (full_name or username or email)
  role?: string;
  filter?: string; // you can filter with ["role", "is_active", "provider", "is_verified"]
  page?: number;
  page_size?: number;
}
