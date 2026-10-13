import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { OrderSummaryDto } from '@/types/order';
import { OrderCard } from './OrderCard';
import { OrdersEmptyState } from './OrdersEmptyState';
import { ORDER_STATUS_FILTERS, getErrorMessage, type OrderStatusFilter } from './types';

interface OrderListProps {
  orders: OrderSummaryDto[];
  activeStatus: OrderStatusFilter;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onStatusChange: (status: OrderStatusFilter) => void;
}

/**
 * Customer order history: status filter chips + order cards.
 * Pagination controls live on the page (they need page state); the empty
 * state is a dedicated component so list/empty/error never overlap.
 */
export function OrderList({
  orders,
  activeStatus,
  isLoading,
  isError,
  error,
  onStatusChange,
}: OrderListProps) {
  const t = useTranslations('orders');

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('list.filterByStatus')}>
        {ORDER_STATUS_FILTERS.map((status) => (
          <Button
            key={status}
            type="button"
            variant={activeStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(status)}>
            {status === 'ALL' ? t('list.filterAll') : t(`status.${status}`)}
          </Button>
        ))}
      </div>

      {isLoading && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t('list.loading')}
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            {getErrorMessage(error, t('list.loadError'))}
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && orders.length === 0 && <OrdersEmptyState />}

      {!isLoading && !isError && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.orderNumber} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}
