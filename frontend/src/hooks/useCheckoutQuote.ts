'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import type { CheckoutQuoteDto } from '@/types/checkout';
import type { StorePaymentMethod } from '@/types/payment';

export const checkoutKeys = {
  quote: (governorate: string | null, paymentMethod: string | null) =>
    ['checkout-quote', governorate, paymentMethod] as const,
};

/**
 * Server-computed checkout quote for the current cart + selected governorate.
 * Enabled only once both a governorate and a payment method are known; the quote is
 * a read projection, so no invalidation — a new key (changed governorate/payment)
 * refetches.
 */
export function useCheckoutQuote(
  governorate: string | null,
  paymentMethod: StorePaymentMethod | null
) {
  const queryClient = useQueryClient();

  const query = useQuery<CheckoutQuoteDto>({
    queryKey: checkoutKeys.quote(governorate, paymentMethod),
    queryFn: () => orderService.quote({ governorate: governorate as string, paymentMethod: paymentMethod as StorePaymentMethod }),
    enabled: Boolean(governorate) && Boolean(paymentMethod),
    staleTime: 30 * 1000,
    retry: false,
  });

  return {
    quote: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    queryClient,
  };
}
