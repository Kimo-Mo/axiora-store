import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useUpdatePaymentStatusMutation } from '@/hooks/admin/useUpdatePaymentStatusMutation';
import type { PaymentStatus } from '@/types/admin/payments';

interface UpdatePaymentStatusDialogProps {
  paymentId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdatePaymentStatusDialog({
  paymentId,
  open,
  onOpenChange,
}: UpdatePaymentStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | ''>('');
  const { mutate, isPending } = useUpdatePaymentStatusMutation();

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedStatus('');
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Payment Status</AlertDialogTitle>
          <AlertDialogDescription>
            Select the new status for payment #{paymentId}. This action will be submitted immediately upon confirmation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as PaymentStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="intended">Intended</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending || !selectedStatus}
            onClick={(e) => {
              e.preventDefault();
              if (!paymentId || !selectedStatus) return;
              mutate(
                { id: paymentId, status: selectedStatus as PaymentStatus },
                {
                  onSuccess: () => {
                    setSelectedStatus('');
                    onOpenChange(false);
                  },
                }
              );
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating…
              </>
            ) : (
              'Confirm'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
