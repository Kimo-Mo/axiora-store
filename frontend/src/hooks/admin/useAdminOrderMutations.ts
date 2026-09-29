import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { adminQueryKeys } from './queryKeys';
import { useCacheClear } from './useCacheClear';
import { toast } from 'sonner';
import type { AdminOrderUpdatePayload } from '@/types/admin/orders';

// --- Update Order Status (+ optional notification) ---
export function useAdminUpdateOrderMutation() {
  const queryClient = useQueryClient();
  const cacheClear = useCacheClear();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AdminOrderUpdatePayload;
    }) => orderService.adminUpdateOrder(id, payload),

    onSuccess: async (_, { id }) => {
      await cacheClear();
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.order(id) });
      toast.success('Order status updated successfully.');
    },

    onError: () => {
      toast.error('Failed to update order status. Please try again.');
    },
  });
}

// --- Delete Order ---
export function useAdminDeleteOrderMutation() {
  const queryClient = useQueryClient();
  const cacheClear = useCacheClear();

  return useMutation({
    mutationFn: (id: string) => orderService.adminDeleteOrder(id),

    onSuccess: async () => {
      await cacheClear();
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order deleted successfully.');
    },

    onError: () => {
      toast.error('Failed to delete order. Please try again.');
    },
  });
}
