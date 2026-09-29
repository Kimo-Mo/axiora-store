import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { adminQueryKeys } from './queryKeys';
import type { AdminOrderDetail } from '@/types/admin/orders';

export function useAdminOrderDetailQuery(orderId: string, enabled: boolean = true) {
  return useQuery<AdminOrderDetail>({
    queryKey: adminQueryKeys.order(orderId),
    queryFn: () => orderService.adminOrderDetails(orderId) as Promise<AdminOrderDetail>,
    enabled: enabled && !!orderId, // Only fetches when modal is open with a valid ID
  });
}
