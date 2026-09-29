import { CalendarDays, Eye, ReceiptText, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CancelOrderButton } from './CancelOrderButton';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { OrderListItem } from './types';
import { formatOrderStatus } from './types';

interface OrderCardProps {
  order: OrderListItem;
  onViewDetails: (orderNumber: string) => void;
}

export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-primary/30 hover:bg-card">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Order ID: {order.order_number}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="mb-1 text-xs text-muted-foreground">Order Date</p>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-primary" />
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="mb-1 text-xs text-muted-foreground">Items Count</p>
            <div className="flex items-center gap-1.5">
              <ReceiptText className="size-3.5 text-primary" />
              <span>{order.items_count}</span>
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="mb-1 text-xs text-muted-foreground">Subtotal before fee</p>
            <div className="flex items-center gap-1.5">
              <Wallet className="size-3.5 text-primary" />
              <span>{order.currency} {order.subtotal}</span>
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="mb-1 text-xs text-muted-foreground">Discount</p>
            <span>{order.currency} {order.discount_total}</span>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="mb-1 text-xs text-muted-foreground">Coupon Code</p>
            <span>{order.coupon_code ?? 'No coupon'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold">
            Total Price after fee: <span className="text-primary">{order.currency} {order.total_price}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <CancelOrderButton orderNumber={order.order_number} status={order.status} />
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => onViewDetails(order.order_number)}>
              <Eye className="size-3.5" />
              View Details ({formatOrderStatus(order.status)})
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
