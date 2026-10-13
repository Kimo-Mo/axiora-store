import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import type { OrderListResultDto } from '@/types/order';
import { ORDER_STATUS_FILTERS, type OrderStatusFilter } from '@/types/order';

export { ORDER_STATUS_FILTERS, type OrderStatusFilter };

/** Shared order query keys (research.md D-10). */
export const orderQueryKeys = {
  list: (params: { page: number; status: OrderStatusFilter }) =>
    ['orders', 'list', params] as const,
  detail: (orderNumber: string) => ['orders', 'detail', orderNumber] as const,
};

/**
 * Paginated customer order history (newest first).
 * `status` filters server-side; `keepPreviousData` keeps the previous page
 * visible while the next one loads.
 */
export function useOrdersQuery(page: number, status: OrderStatusFilter = 'ALL') {
  return useQuery<OrderListResultDto>({
    queryKey: orderQueryKeys.list({ page, status }),
    queryFn: () =>
      orderService.list({
        page,
        limit: 10,
        ...(status === 'ALL' ? {} : { status }),
      }),
    placeholderData: keepPreviousData,
  });
}
