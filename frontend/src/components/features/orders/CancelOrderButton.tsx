'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCancelOrderMutation } from '@/hooks/orders/useCancelOrderMutation';

interface CancelOrderButtonProps {
  orderNumber: string;
  /** True when the order was paid online: the dialog warns a refund is recorded. */
  paidOnline: boolean;
}

/**
 * Customer cancellation with confirmation (US3).
 *
 * Success shows the refund notice when the backend recorded one (FR-016);
 * policy rejections (409) and other failures surface as friendly localized
 * errors (FR-009). List + detail queries invalidate via the mutation hook.
 */
export function CancelOrderButton({ orderNumber, paidOnline }: CancelOrderButtonProps) {
  const t = useTranslations('orders');
  const [open, setOpen] = useState(false);
  const cancelMutation = useCancelOrderMutation(orderNumber);

  const handleConfirm = () => {
    cancelMutation.mutate(undefined, {
      onSuccess: (result) => {
        setOpen(false);
        toast.success(t('cancel.success'));
        if (result.refundRecorded) {
          toast.info(t('cancel.refundNotice'), { duration: 8000 });
        }
      },
      onError: (error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        setOpen(false);
        toast.error(status === 409 ? t('cancel.notCancellable') : t('cancel.failed'));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1 border-error/30 text-error hover:border-error hover:bg-error/10 hover:text-error">
          <Ban className="size-3.5" />
          {t('cancel.title')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('cancel.title')}</DialogTitle>
          <DialogDescription>{t('cancel.prompt')}</DialogDescription>
        </DialogHeader>
        {paidOnline && (
          <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
            {t('cancel.refundNotice')}
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('cancel.keep')}</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={cancelMutation.isPending}>
            {t('cancel.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
