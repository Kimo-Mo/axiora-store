import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { adminQueryKeys } from './queryKeys';
import type { AdminOrderListParams, AdminOrder } from '@/types/admin/orders';

interface PaginatedOrdersResult {
  results: AdminOrder[];
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
}

export function useAdminOrdersQuery(params: AdminOrderListParams) {
  return useQuery<PaginatedOrdersResult>({
    queryKey: adminQueryKeys.orders(params),
    queryFn: async () => {
      const data = await orderService.adminOrdersList(params);
      // // Backend may wrap paginated payload inside data.status OR return it at the top level.
      // // Try data.status first (if it looks like a paginated object); fall back to data itself.
      // const payload: PaginatedOrdersResult =
      //   data?.status && typeof data.status === 'object' && Array.isArray(data.status.results)
      //     ? (data.status as PaginatedOrdersResult)
      //     : (data as PaginatedOrdersResult);
      // return payload;
      // After the Axios unwrapper fix, data is already the unwrapped paginated payload.
      return data as PaginatedOrdersResult;
    },
    placeholderData: keepPreviousData,
  });
}

