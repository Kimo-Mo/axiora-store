import type { AdminOrderItem } from '@/types/admin/orders';

interface OrderDetailItemsProps {
  items: AdminOrderItem[];
}

export function OrderDetailItems({ items }: OrderDetailItemsProps) {
  return (
    <div>
      <div className="text-sm font-medium text-foreground mb-3">
        Order Items ({items.length})
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border text-sm"
          >
            <div>
              <div className="font-medium text-foreground">{item.product_name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Qty: {item.quantity}
              </div>
            </div>
            <div className="font-semibold text-foreground ms-4 shrink-0">
              {item.currency} {parseFloat(item.price).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
