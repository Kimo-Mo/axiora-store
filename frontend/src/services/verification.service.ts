import api from '@/lib/api/axios';
import type { ApiEnvelope } from '@/types/auth';
import type { SendOtpDto, SendOtpPayload, VerifyOtpDto, VerifyOtpPayload } from '@/types/verification';

/**
 * Dedicated verification service (FR-016): every send/verify/status interaction
 * flows through here instead of scattered ad-hoc requests. Endpoints are
 * credentialed by the shared axios instance — no `skipTokenRefresh` flag, so a
 * refreshed session retries these requests normally.
 */
export const verificationService = {
  /** Request a one-time code for the given Egyptian mobile number. */
  send: async (payload: SendOtpPayload): Promise<SendOtpDto> => {
    const response = await api.post<ApiEnvelope<SendOtpDto>>('/verification/phone/send', payload);
    return response.data.data;
  },

  /** Check a submitted code; success marks the account phone verified. */
  verify: async (payload: VerifyOtpPayload): Promise<VerifyOtpDto> => {
    const response = await api.post<ApiEnvelope<VerifyOtpDto>>('/verification/phone/verify', payload);
    return response.data.data;
  },
};
