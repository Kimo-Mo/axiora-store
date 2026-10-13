import { CheckCircle2, Clock, LoaderCircle, PackageCheck, Truck, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

/**
 * Localized status badge for all 8 order statuses.
 * Terminal/exception statuses (CANCELLED, FAILED, RETURNED) use the
 * destructive treatment; in-flight statuses each get a distinct tone.
 */
export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const t = useTranslations('orders');
  const label = t(`status.${status}`);

  switch (status) {
    case 'PENDING':
      return (
        <Badge className="border-warning/20 bg-warning/10 text-warning">
          <Clock className="me-1 size-3.5" />
          {label}
        </Badge>
      );
    case 'CONFIRMED':
      return (
        <Badge className="border-primary/20 bg-primary/10 text-primary">
          <CheckCircle2 className="me-1 size-3.5" />
          {label}
        </Badge>
      );
    case 'PROCESSING':
      return (
        <Badge className="border-blue-500/20 bg-blue-500/10 text-blue-500">
          <LoaderCircle className="me-1 size-3.5 animate-spin" />
          {label}
        </Badge>
      );
    case 'SHIPPED':
      return (
        <Badge className="border-violet-500/20 bg-violet-500/10 text-violet-500">
          <Truck className="me-1 size-3.5" />
          {label}
        </Badge>
      );
    case 'DELIVERED':
      return (
        <Badge className="border-success/20 bg-success/10 text-success">
          <PackageCheck className="me-1 size-3.5" />
          {label}
        </Badge>
      );
    case 'CANCELLED':
    case 'FAILED':
    case 'RETURNED':
      return (
        <Badge className="border-destructive/20 bg-destructive/10 text-destructive">
          <XCircle className="me-1 size-3.5" />
          {label}
        </Badge>
      );
  }
}
