'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authKeys, useUser } from '@/hooks/useUser';
import { verificationService } from '@/services/verification.service';
import type { AuthUser } from '@/types/auth';
import type { VerifyOtpDto, VerifyOtpPayload } from '@/types/verification';

/**
 * Code-verification mutation. On success the account phone and its verified
 * flag are already updated server-side; the `['auth','me']` cache is updated
 * in place ({ ...user, phone, phoneVerified: true }) so profile and checkout
 * react instantly without a refetch (research D-8).
 */
export function useVerifyOtp() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  const mutation = useMutation({
    mutationFn: async (payload: VerifyOtpPayload): Promise<VerifyOtpDto> =>
      verificationService.verify(payload),
    onSuccess: (result) => {
      if (user) {
        queryClient.setQueryData<AuthUser>(authKeys.me, {
          ...user,
          phone: result.phone,
          phoneVerified: true,
        });
      }
    },
  });

  return {
    mutate: (payload: VerifyOtpPayload): Promise<VerifyOtpDto> => mutation.mutateAsync(payload),
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
