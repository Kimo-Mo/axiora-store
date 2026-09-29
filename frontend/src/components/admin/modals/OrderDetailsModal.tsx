'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAdminOrderDetailQuery } from '@/hooks/admin/useAdminOrderDetailQuery';
import { OrderDetailSummary } from '@/components/admin/orders/OrderDetailSummary';
import { OrderDetailItems } from '@/components/admin/orders/OrderDetailItems';
import { OrderPaymentDetails } from '@/components/admin/orders/OrderPaymentDetails';
import { OrderStatusUpdate } from '@/components/admin/orders/OrderStatusUpdate';
import { OrderDeleteAction } from '@/components/admin/orders/OrderDeleteAction';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export function OrderDetailsModal({ isOpen, onClose, orderId }: OrderDetailsModalProps) {
  const { data: order, isPending, isError } = useAdminOrderDetailQuery(orderId, isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-2xl bg-card text-card-foreground border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Order Details</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {order ? order.order_number : isPending ? `Loading order ${orderId}…` : 'Order details'}
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive text-sm">
            Failed to load order details. Please try again.
          </div>
        ) : order ? (
          <div className="space-y-6 py-2">
            <OrderDetailSummary order={order} />
            <OrderPaymentDetails paymentDetails={order.payment_details} />
            <Separator className="bg-border" />
            <OrderDetailItems items={order.items} />
            <Separator className="bg-border" />
            <OrderStatusUpdate order={order} onClose={onClose} />
            <Separator className="bg-border" />
            <OrderDeleteAction orderId={order.order_number} onSuccess={onClose} />
          </div>
        ) : null}

        <div className="flex justify-end pt-4 mt-2 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-foreground hover:bg-muted">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
