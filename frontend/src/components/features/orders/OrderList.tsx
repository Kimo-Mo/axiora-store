import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OrderCard } from './OrderCard';
import type { OrderListItem, OrderStatusFilter } from './types';
import { ORDER_STATUS_FILTERS, getErrorMessage } from './types';

interface OrderListProps {
  orders: OrderListItem[];
  search: string;
  activeStatus: OrderStatusFilter;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: OrderStatusFilter) => void;
  onViewDetails: (orderNumber: string) => void;
}

export function OrderList({
  orders,
  search,
  activeStatus,
  isLoading,
  isError,
  error,
  onSearchChange,
  onStatusChange,
  onViewDetails,
}: OrderListProps) {
  return (
    <section className="space-y-4">
      <div className="relative">
        <Search
          size={16}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="order-search"
          placeholder="Search by order number, user id, payment status, coupon..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="bg-card/60 pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {ORDER_STATUS_FILTERS.map((status) => (
          <Button
            key={status}
            type="button"
            variant={activeStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(status)}>
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Loading orders...
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            {getErrorMessage(error, 'Failed to load orders')}
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No orders found.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.order_number} order={order} onViewDetails={onViewDetails} />
          ))}
        </div>
      )}
    </section>
  );
}
