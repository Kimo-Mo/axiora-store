'use client';

import { useMutation } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { paymentService } from '@/services/payment.service';
import type { InitiatePaymentResponse } from '@/types/payment';

/**
 * Start (or re-start) the payment session for an awaiting-payment online order.
 *
 * The backend is idempotent per order: a second call returns the same active
 * session with `reused: true` rather than creating a second payable one, which is
 * what makes a double-clicked "Pay now" impossible to turn into a double charge
 * (FR-005). This hook therefore never has to reason about whether it was called
 * twice.
 */
export function useInitiatePayment() {
  const locale = useLocale();

  const mutation = useMutation({
    mutationFn: (orderNumber: string): Promise<InitiatePaymentResponse> =>
      paymentService.initiate(orderNumber, locale === 'ar' ? 'ar' : 'en'),
  });

  /**
   * Initiate, then hand the browser to the provider.
   *
   * `window.location.assign` — not the router — because the target is a
   * cross-origin hosted-checkout page that needs a real document navigation.
   */
  const initiateAndRedirect = async (orderNumber: string): Promise<void> => {
    const session = await mutation.mutateAsync(orderNumber);
    window.location.assign(session.redirectUrl);
  };

  return {
    initiateAndRedirect,
    isInitiating: mutation.isPending,
    error: mutation.error,
  };
}