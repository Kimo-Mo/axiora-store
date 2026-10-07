'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import type { CheckoutQuoteDto } from '@/types/checkout';

export const checkoutKeys = {
  quote: (governorate: string | null, paymentMethod: string) =>
    ['checkout-quote', governorate, paymentMethod] as const,
};

/**
 * Server-computed checkout quote for the current cart + selected governorate.
 * Enabled only once a governorate is chosen; the quote is a read projection,
 * so no invalidation — a new key (changed governorate/payment) refetches.
 */
export function useCheckoutQuote(governorate: string | null, paymentMethod: 'COD') {
  const queryClient = useQueryClient();

  const query = useQuery<CheckoutQuoteDto>({
    queryKey: checkoutKeys.quote(governorate, paymentMethod),
    queryFn: () => orderService.quote({ governorate: governorate as string, paymentMethod }),
    enabled: Boolean(governorate),
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
