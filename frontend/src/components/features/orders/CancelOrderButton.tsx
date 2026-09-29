'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { orderService } from '@/services/order.service';
import { toast } from 'sonner';
import { getErrorMessage, type CancelOrderResponse, type OrderStatus } from './types';

interface CancelOrderButtonProps {
  orderNumber: string;
  status: OrderStatus;
}

export function CancelOrderButton({ orderNumber, status }: CancelOrderButtonProps) {
  const queryClient = useQueryClient();
  const isCancellable = status.toString().toLowerCase() === 'pending';

  const cancelOrderMutation = useMutation({
    mutationFn: async (): Promise<CancelOrderResponse> => orderService.cancelOrder(orderNumber),
    onSuccess: async () => {
      toast.success('Order cancelled successfully');
      await queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
      await queryClient.invalidateQueries({ queryKey: ['orders', 'detail', orderNumber] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to cancel order'));
    },
  });

  if (!isCancellable) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={cancelOrderMutation.isPending}
      onClick={() => cancelOrderMutation.mutate()}>
      {cancelOrderMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
    </Button>
  );
}
