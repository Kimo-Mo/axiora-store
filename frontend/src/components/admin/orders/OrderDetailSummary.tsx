import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { AdminOrderDetail } from '@/types/admin/orders';

interface OrderDetailSummaryProps {
  order: AdminOrderDetail;
}

export function OrderDetailSummary({ order }: OrderDetailSummaryProps) {
  const fmt = (val: string) => `${order.currency} ${parseFloat(val).toFixed(2)}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground text-xs mb-0.5">Order Number</div>
          <div className="font-mono font-semibold text-foreground">{order.order_number}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs mb-0.5">Date</div>
          <div className="text-foreground">{new Date(order.created_at).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs mb-0.5">Status</div>
          <OrderStatusBadge status={order.status} />
        </div>
        <div>
          <div className="text-muted-foreground text-xs mb-0.5">Subtotal</div>
          <div className="text-foreground">{fmt(order.subtotal)}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs mb-0.5">Tax</div>
          <div className="text-foreground">{fmt(order.tax)}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs mb-0.5">Discount</div>
          <div className="text-foreground">{fmt(order.discount_total)}</div>
        </div>
        {order.coupon_code && (
          <div>
            <div className="text-muted-foreground text-xs mb-0.5">Coupon</div>
            <div className="font-mono text-primary text-sm">{order.coupon_code}</div>
          </div>
        )}
        <div className="col-span-2 sm:col-span-1">
          <div className="text-muted-foreground text-xs mb-0.5">Total</div>
          <div className="text-foreground font-bold text-lg">{fmt(order.total_price)}</div>
        </div>
      </div>
      <Separator className="bg-border" />
    </div>
  );
}
