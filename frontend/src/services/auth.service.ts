import api from '@/lib/api/axios';
import type {
  ApiEnvelope,
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
} from '@/types/auth';

/**
 * The session itself is never returned to JavaScript: both tokens are set as
 * HttpOnly cookies by the backend and are unreadable from here (FR-027, FR-028).
 * These calls receive the user object and nothing else.
 */
export const authService = {
  async login(data: LoginRequest): Promise<AuthUser> {
    const { data: body } = await api.post<ApiEnvelope<{ user: AuthUser }>>('/auth/login', data, {
      skipTokenRefresh: true,
    });
    return body.data.user;
  },

  /** Also signs the customer in — no separate sign-in step follows (FR-003). */
  async register(data: RegisterRequest): Promise<AuthUser> {
    const { data: body } = await api.post<ApiEnvelope<{ user: AuthUser }>>('/auth/register', data, {
      skipTokenRefresh: true,
    });
    return body.data.user;
  },

  async getMe(): Promise<AuthUser> {
    const { data: body } = await api.get<ApiEnvelope<{ user: AuthUser }>>('/auth/me');
    return body.data.user;
  },

  async refreshToken(): Promise<AuthUser> {
    const { data: body } = await api.post<ApiEnvelope<{ user: AuthUser }>>(
      '/auth/refresh',
      undefined,
      { skipTokenRefresh: true },
    );
    return body.data.user;
  },

  async logout(): Promise<void> {
    // Unauthenticated by design: an expired access token must never leave a
    // customer unable to clear their cookies. The refresh token identifies the
    // session to revoke.
    await api.post('/auth/logout', undefined, { skipTokenRefresh: true });
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await api.post('/auth/change-password', data, { skipTokenRefresh: true });
  },
};
