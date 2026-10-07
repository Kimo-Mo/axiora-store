'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { orderService } from '@/services/order.service';
import { cartKeys } from '@/hooks/useCart';
import type { CreateOrderPayload } from '@/types/checkout';
import type { OrderDto } from '@/types/order';

/**
 * Order-creation mutation. On success the backend has already emptied the
 * server cart, so the local `['cart']` cache is dropped and the customer is
 * routed to the confirmation screen.
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

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
    router.push(`/checkout/confirmation/${encodeURIComponent(order.orderNumber)}`);
    return order;
  };

  return {
    placeOrder,
    isPlacing: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
