import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import type { AdminOrder } from '@/types/admin/orders';

/**
 * Fetches orders for a specific user (admin view).
 * The backend AdminOrderListView supports: filter=user={userId}
 */
export function useUserOrdersQuery(userId: string | null) {
  return useQuery({
    queryKey: ['admin', 'user-orders', userId],
    queryFn: async () => {
      const data = await orderService.adminOrdersList({
        filter: `user=${userId}`,
        page_size: 10,
      });
      return data as {
        results: AdminOrder[];
        count: number;
        total_pages: number;
        current_page: number;
      };
    },
    enabled: !!userId,
  });
}
