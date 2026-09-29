import apiClient from '@/lib/api/axios';
import {
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ForgotPasswordRequest,
  ChangePasswordRequest,
  ResetPasswordConfirmBody,
  LoginResponse,
  GoogleOauthPayload,
} from '@/types';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login/', data, { skipTokenRefresh: true });
    return response.data;
  },

  async register(data: RegisterRequest): Promise<void> {
    const response = await apiClient.post('/auth/register/', data, { skipTokenRefresh: true });
    return response.data;
  },

  async verifyEmailOtp(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    const response = await apiClient.post('/auth/verify-email-otp/', data, { skipTokenRefresh: true });
    return response.data;
  },

  async resendOtp(data: { email: string; type?: string }): Promise<void> {
    const response = await apiClient.post('/auth/resend-email-otp/', { email: data.email }, { skipTokenRefresh: true });
    return response.data;
  },

  async googleOauth2(data: GoogleOauthPayload): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/o2/google/', data, {
      skipTokenRefresh: true,
    });
    return response.data;
  },

  async clearCache(): Promise<void> {
    const response = await apiClient.post('/auth/clear-cache/');
    return response.data;
  },

  async logout(): Promise<void> {
    const response = await apiClient.post('/auth/logout/', undefined, {
      skipTokenRefresh: true,
    });
    return response.data;
  },

  async refreshToken(): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/refresh/', undefined, { skipTokenRefresh: true });
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    const response = await apiClient.post('/auth/forgot-password/', data, { skipTokenRefresh: true });
    return response.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const response = await apiClient.put('/auth/change-password/', data, { skipTokenRefresh: true });
    return response.data;
  },

  async validateResetToken(uidb64: string, token: string): Promise<void> {
    const response = await apiClient.get(`/auth/reset-password/${uidb64}/${token}/`, { skipTokenRefresh: true });
    return response.data;
  },

  async confirmResetPassword(
    uidb64: string,
    token: string,
    data: ResetPasswordConfirmBody
  ): Promise<void> {
    const response = await apiClient.post(`/auth/reset-password/${uidb64}/${token}/`, data, { skipTokenRefresh: true });
    return response.data;
  },

  async getCsrfToken(): Promise<{ csrfToken: string }> {
    const response = await apiClient.get(`/auth/csrf-token/`, { skipTokenRefresh: true });
    return response.data;
  },
};

