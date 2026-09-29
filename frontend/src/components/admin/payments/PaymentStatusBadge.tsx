import { Badge } from '@/components/ui/badge';
import type { PaymentStatus } from '@/types/admin/payments';

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const getBadgeVariant = (s: PaymentStatus) => {
    switch (s) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'intended':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed':
        return 'destructive'; // Shadcn variant
      case 'refunded':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'cancelled':
        return 'secondary'; // Shadcn variant
      default:
        return 'secondary';
    }
  };

  const variantStr = getBadgeVariant(status);
  const isCustomClass = variantStr.startsWith('bg-');

  return (
    <Badge
      variant={isCustomClass ? 'outline' : (variantStr as 'secondary' | 'destructive')}
      className={isCustomClass ? variantStr + ' border-transparent' : ''}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
