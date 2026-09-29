import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types/admin/orders';

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  completed: {
    label: 'Completed',
    className: 'bg-success/20 text-success hover:bg-success/30 border-none font-medium',
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning/20 text-warning hover:bg-warning/30 border-none font-medium',
  },
  paid: {
    label: 'Paid',
    className: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-none font-medium',
  },
  processing: {
    label: 'Processing',
    className: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-none font-medium',
  },
  failed: {
    label: 'Failed',
    className: 'bg-destructive/20 text-destructive hover:bg-destructive/30 border-none font-medium',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-muted/60 text-muted-foreground hover:bg-muted border-none font-medium',
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-muted/60 text-muted-foreground border-none font-medium',
  };
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}
