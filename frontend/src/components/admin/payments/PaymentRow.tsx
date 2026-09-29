import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, RefreshCw } from 'lucide-react';
import type { AdminPayment } from '@/types/admin/payments';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface PaymentRowProps {
  payment: AdminPayment;
  onView: (id: number) => void;
  onUpdateStatus: (id: number) => void;
}

export function PaymentRow({ payment, onView, onUpdateStatus }: PaymentRowProps) {
  return (
    <TableRow>
      <TableCell className="text-muted-foreground">#{payment.order}</TableCell>
      <TableCell className="text-muted-foreground truncate max-w-37.5">
        {payment.full_name || payment.username}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {payment.currency} {payment.amount}
      </TableCell>
      <TableCell>{payment.gateway_name}</TableCell>
      <TableCell>
        <PaymentStatusBadge status={payment.status} />
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {new Date(payment.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onView(payment.id)}
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onUpdateStatus(payment.id)}
          title="Update Status"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
