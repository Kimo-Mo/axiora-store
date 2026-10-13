import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { orderQueryKeys } from './useOrdersQuery';
import type { OrderDto } from '@/types/order';

/**
 * Full detail for one customer order (items, money breakdown, snapshots,
 * payment state, actor-attributed timeline). Disabled until the order number
 * is known; ownership misses surface as query errors for the page to render
 * as not-found.
 */
export function useOrderDetailQuery(orderNumber: string) {
  return useQuery<OrderDto>({
    queryKey: orderQueryKeys.detail(orderNumber),
    queryFn: () => orderService.detail(orderNumber),
    enabled: Boolean(orderNumber),
    retry: false,
  });
}
