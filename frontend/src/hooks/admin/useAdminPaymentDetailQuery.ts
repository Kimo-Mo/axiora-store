import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from './queryKeys';
import { paymentService } from '@/services/payment.service';
import type { AdminPaymentDetail } from '@/types/admin/payments';

export function useAdminPaymentDetailQuery(id: number | null) {
  return useQuery<AdminPaymentDetail>({
    queryKey: adminQueryKeys.payment(id ?? 0),
    queryFn: () => paymentService.adminPaymentDetail(id!) as Promise<AdminPaymentDetail>,
    enabled: id !== null && id !== undefined,
  });
}
