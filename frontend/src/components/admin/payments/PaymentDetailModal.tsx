import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAdminPaymentDetailQuery } from '@/hooks/admin/useAdminPaymentDetailQuery';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface PaymentDetailModalProps {
  id: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (id: number) => void;
}

export function PaymentDetailModal({
  id,
  open,
  onOpenChange,
  onUpdateStatus,
}: PaymentDetailModalProps) {
  const { data, isLoading, isError } = useAdminPaymentDetailQuery(id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {isLoading && (
            <>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </>
          )}
          {isError && (
            <p className="text-destructive text-sm">
              Failed to load payment details. Please try again.
            </p>
          )}
          {data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Payment ID</h4>
                  <p className="text-sm mt-1">#{data.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <div className="mt-1">
                    <PaymentStatusBadge status={data.status} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Amount</h4>
                  <p className="text-sm mt-1">
                    {data.currency} {data.amount}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Gateway</h4>
                  <p className="text-sm mt-1">{data.gateway_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Customer</h4>
                  <p className="text-sm mt-1">
                    {data.full_name || data.username} ({data.user_email})
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Created At</h4>
                  <p className="text-sm mt-1">{new Date(data.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Transaction ID</h4>
                  <p className="text-sm mt-1 text-muted-foreground break-all">
                    {data.transaction_id || '—'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Linked Order</h4>
                  <p className="text-sm mt-1">
                    {data.order_details.order_number
                      ? `#${data.order_details.order_number} — ${data.order_status || 'unknown'}`
                      : 'No linked order'}
                  </p>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-1 gap-4">
                  {data.order_details.items &&
                    data.order_details.items.length > 0 &&
                    data.order_details.items.map((item) => (
                      <div key={item.id} className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Product</h4>
                          <p className="text-sm mt-1">{item.product_name}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Quantity</h4>
                          <p className="text-sm mt-1">{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Order Details</h4>
                  <p className="text-sm mt-1">
                    Order Number:{' '}
                    {data.order_details.order_number ? data.order_details.order_number : '—'}
                  </p>
                  <p className="text-sm mt-1">Status: {data.status}</p>
                  {data.order_details.coupon_code && (
                    <p className="text-sm mt-1">
                      Coupon Code: {data.order_details.coupon_code}
                    </p>
                  )}
                  <p className="text-sm mt-1">
                    Created At:{' '}
                    {new Date(data.order_details.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm mt-1">
                    Discount Total: {data.order_details.currency}{' '}
                    {data.order_details.discount_total}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {data && (
            <Button
              onClick={() => {
                onUpdateStatus(data.id);
                onOpenChange(false);
              }}>
              Update Status
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
