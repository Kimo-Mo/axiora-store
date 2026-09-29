import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, LoaderCircle, XCircle } from 'lucide-react';
import type { OrderStatus } from './types';
import { formatOrderStatus } from './types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const normalized = status.toString().toLowerCase();

  if (normalized === 'paid') {
    return (
      <Badge className="border-success/20 bg-success/10 text-success">
        <CheckCircle2 className="mr-1 size-3.5" />
        {formatOrderStatus(status)}
      </Badge>
    );
  }

  if (normalized === 'pending') {
    return (
      <Badge className="border-warning/20 bg-warning/10 text-warning">
        <Clock className="mr-1 size-3.5" />
        {formatOrderStatus(status)}
      </Badge>
    );
  }

  if (normalized === 'processing') {
    return (
      <Badge className="border-blue-500/20 bg-blue-500/10 text-blue-500">
        <LoaderCircle className="mr-1 size-3.5 animate-spin" />
        {formatOrderStatus(status)}
      </Badge>
    );
  }

  if (normalized === 'cancelled' || normalized === 'failed') {
    return (
      <Badge className="border-destructive/20 bg-destructive/10 text-destructive">
        <XCircle className="mr-1 size-3.5" />
        {formatOrderStatus(status)}
      </Badge>
    );
  }

  return <Badge variant="outline">{formatOrderStatus(status)}</Badge>;
}
