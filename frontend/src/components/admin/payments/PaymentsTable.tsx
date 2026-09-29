import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AdminPayment } from '@/types/admin/payments';
import { PaymentsTableSkeleton } from './PaymentsTableSkeleton';
import { PaymentRow } from './PaymentRow';

interface PaymentsTableProps {
  payments: AdminPayment[];
  isLoading: boolean;
  pagination: { count: number; total_pages: number; current_page: number };
  page: number;
  onPageChange: (p: number) => void;
  onView: (id: number) => void;
  onUpdateStatus: (id: number) => void;
}

export function PaymentsTable({
  payments,
  isLoading,
  pagination,
  page,
  onPageChange,
  onView,
  onUpdateStatus,
}: PaymentsTableProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <PaymentsTableSkeleton />
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                    <CreditCard className="h-10 w-10 opacity-30 mb-2" />
                    <span>No payments found.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p) => (
                <PaymentRow
                  key={p.id}
                  payment={p}
                  onView={onView}
                  onUpdateStatus={onUpdateStatus}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.total_pages}
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pagination.total_pages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
