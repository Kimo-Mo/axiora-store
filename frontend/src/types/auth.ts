import { AuthUser } from './user';
import { ApiResponse } from './common';

export interface LoginResponseData {
  user: AuthUser;
}

export type LoginResponse = ApiResponse<LoginResponseData>;
export type UserPublic = AuthUser;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  full_name?: string | null;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export type VerifyEmailResponse = ApiResponse<{ user: AuthUser }>;
export type AuthApiResponse = ApiResponse<{ user: AuthUser }>;

export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  old_password?: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordRequest {
  uidb64: string;
  token: string;
  password?: string;
}

export interface ResetPasswordConfirmBody {
  new_password: string;
  confirm_password: string;
}

export interface GoogleOauthPayload {
  auth_token: string;
}
