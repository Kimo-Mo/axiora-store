'use client';

import { useQuery } from '@tanstack/react-query';
import { shippingService } from '@/services/shipping.service';
import type { ShippingRateDto } from '@/types/checkout';

export const shippingKeys = {
  rates: ['shipping-rates'] as const,
};

/**
 * Active shipping zones (public data). Zones are admin-configured and rarely
 * change, so a 5-minute staleTime avoids refetching on every checkout visit.
 */
export function useShippingRates() {
  const {
    data: rates,
    isLoading,
    isError,
  } = useQuery<ShippingRateDto[]>({
    queryKey: shippingKeys.rates,
    queryFn: () => shippingService.listRates(),
    staleTime: 5 * 60 * 1000,
  });

  return { rates: rates ?? [], isLoading, isError };
}
