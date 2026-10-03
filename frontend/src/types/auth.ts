/**
 * The single user representation returned by every auth and profile endpoint.
 *
 * Mirrors `backend/src/shared/types.ts` → `AuthUser`. `passwordHash` is
 * deliberately absent: no credential crosses the API boundary.
 */
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string | null;
  phoneVerified: boolean;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  defaultAddress: AddressSummary | null;
}

/** Condensed address embedded in the user payload. */
export interface AddressSummary {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  street: string;
}

export type UserRole = AuthUser["role"];

export interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, string[] | string> | unknown;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type AuthResponse = ApiEnvelope<{ user: AuthUser }>;

/** Error codes the client branches on. Anything else is treated as unexpected. */
export type AuthErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "DATABASE_ERROR";
