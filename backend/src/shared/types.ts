export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorDetails {
  message: string;
  code: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetails;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export type UserRole = "CUSTOMER" | "ADMIN";

/** Condensed address embedded in `AuthUser` so the client need not fetch the list. */
export interface AddressSummary {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  street: string;
}

/**
 * The single user representation returned by every auth and profile endpoint.
 *
 * `passwordHash` is deliberately absent: no credential may cross the API boundary
 * (FR-006). Keep this in sync with `frontend/src/types/user.ts`.
 */
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string | null;
  phoneVerified: boolean;
  role: UserRole;
  createdAt: string;
  defaultAddress: AddressSummary | null;
}

/** The cookie pair issued on registration, sign-in, and every rotation. */
export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
}
