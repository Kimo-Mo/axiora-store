'use client';

import { useMutation } from '@tanstack/react-query';
import { verificationService } from '@/services/verification.service';
import type { SendOtpDto, SendOtpPayload } from '@/types/verification';

/**
 * One-time-code request mutation. The result carries the presentational
 * mirrors (`expiresInSeconds`, `resendAvailableInSeconds`) that seed the
 * panel's countdowns — server state stays authoritative (NFR-002).
 */
export function useSendOtp() {
  const mutation = useMutation({
    mutationFn: async (payload: SendOtpPayload): Promise<SendOtpDto> =>
      verificationService.send(payload),
  });

  return {
    mutate: (payload: SendOtpPayload): Promise<SendOtpDto> => mutation.mutateAsync(payload),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
