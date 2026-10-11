'use client';

import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import type { PaymentMethodsDto, StorePaymentMethod } from '@/types/payment';

export const paymentKeys = {
  methods: ['payment-methods'] as const,
};

/**
 * Payment methods the store currently offers (public, read-only).
 *
 * These are capability flags an admin owns, not customer state, so they change
 * rarely — a long staleTime keeps the checkout payment step from refetching on
 * every visit, and the list is what keeps the UI from offering a method the
 * backend would refuse (FR-016).
 */
export function usePaymentMethods() {
  const { data, isLoading, isError } = useQuery<PaymentMethodsDto>({
    queryKey: paymentKeys.methods,
    queryFn: () => paymentService.getPaymentMethods(),
    staleTime: 5 * 60 * 1000,
  });

  const methods = (data?.methods ?? [])
    .filter((entry) => entry.enabled)
    .map((entry) => entry.method);

  return {
    methods,
    currency: data?.currency ?? 'EGP',
    isLoading,
    isError,
  };
}

/**
 * First selectable method once the list resolves: COD when available (the
 * historical default and the one that always works), otherwise whatever single
 * method is enabled. Keeping this derived rather than stored avoids an effect
 * that writes state on render.
 */
export function preferredMethod(methods: StorePaymentMethod[]): StorePaymentMethod | null {
  if (methods.includes('COD')) return 'COD';
  return methods[0] ?? null;
}