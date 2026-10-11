'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import { cartKeys } from '@/hooks/useCart';
import type { CreateOrderPayload } from '@/types/checkout';
import type { OrderDto } from '@/types/order';

/**
 * Order-creation mutation, followed by whatever the chosen payment method needs.
 *
 * The backend has already emptied the server cart by the time this resolves, so the
 * stale `['cart']` entry is dropped first. COD then routes to the confirmation
 * screen; ONLINE hands the customer to the provider's hosted checkout.
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale();

  const mutation = useMutation({
    mutationFn: async (payload: CreateOrderPayload): Promise<OrderDto> =>
      orderService.create(payload),
    onSuccess: async () => {
      // The server cart was emptied inside the order transaction; drop the
      // stale cache entry so the navbar badge and cart page refetch.
      await queryClient.invalidateQueries({ queryKey: cartKeys.cart });
    },
  });

  const placeOrder = async (payload: CreateOrderPayload): Promise<OrderDto> => {
    const order = await mutation.mutateAsync(payload);
    const confirmationPath = `/checkout/confirmation/${encodeURIComponent(order.orderNumber)}`;

    if (order.paymentMethod === 'ONLINE') {
      try {
        const session = await paymentService.initiate(order.orderNumber, locale === 'ar' ? 'ar' : 'en');
        // A cross-origin hosted-checkout URL needs a real document navigation —
        // `router.push` would try to resolve it against this app's routes.
        window.location.assign(session.redirectUrl);
        return order;
      } catch {
        // The order exists and its stock is reserved, so nothing is lost: route to
        // the confirmation screen, where "Pay now" is the recovery path (FR-021).
        toast.error('initiateFailed');
        router.push(confirmationPath);
        return order;
      }
    }

    router.push(confirmationPath);
    return order;
  };

  return {
    placeOrder,
    isPlacing: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}