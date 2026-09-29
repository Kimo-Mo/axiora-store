import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { adminQueryKeys } from './queryKeys';

interface AdminOrderStats {
  profit: number;
  completed_count: number;
  pending_count: number;
}

export function useAdminOrderStatsQuery() {
  return useQuery<AdminOrderStats>({
    queryKey: adminQueryKeys.orderStats(),
    queryFn: async () => {
      const data = await orderService.adminOrdersStats();
      return data as AdminOrderStats;
    },
  });
}
