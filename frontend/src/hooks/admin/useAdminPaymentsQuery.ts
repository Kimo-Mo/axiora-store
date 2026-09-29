import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { adminQueryKeys } from './queryKeys';
import { paymentService } from '@/services/payment.service';
import type { AdminPaymentListParams, PaymentsPaginatedResponse } from '@/types/admin/payments';

export function useAdminPaymentsQuery(params: AdminPaymentListParams) {
  return useQuery<PaymentsPaginatedResponse>({
    queryKey: adminQueryKeys.payments(params),
    queryFn: async () => {
      const data = await paymentService.adminPaymentsList(params);
      return data as PaymentsPaginatedResponse;
    },
    placeholderData: keepPreviousData,
  });
}
