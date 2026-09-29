import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import { useCacheClear } from './useCacheClear';
import { toast } from 'sonner';
import type { PaymentStatus } from '@/types/admin/payments';

export function useUpdatePaymentStatusMutation() {
  const queryClient = useQueryClient();
  const cacheClear = useCacheClear();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: PaymentStatus }) =>
      paymentService.adminUpdatePaymentStatus(id, { status }),
    onSuccess: async () => {
      await cacheClear();
      await queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      toast.success('Payment status updated.');
    },
    onError: () => {
      toast.error('Failed to update payment status. Please try again.');
    },
  });
}
