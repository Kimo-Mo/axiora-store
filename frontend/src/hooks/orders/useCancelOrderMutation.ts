import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { orderQueryKeys } from './useOrdersQuery';
import type { OrderDto } from '@/types/order';

/** Cancel response: the refreshed order plus whether a refund was recorded. */
export interface CancelOrderResult extends OrderDto {
  refundRecorded: boolean;
}

/**
 * Customer cancellation mutation (FR-008/FR-009/FR-016).
 * On success both the list and the open detail refresh, so the CANCELLED
 * badge and the freed timeline entry appear without a reload (SC-004).
 */
export function useCancelOrderMutation(orderNumber: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (): Promise<CancelOrderResult> => orderService.cancel(orderNumber),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
      await queryClient.invalidateQueries({ queryKey: orderQueryKeys.detail(orderNumber) });
    },
  });
}
