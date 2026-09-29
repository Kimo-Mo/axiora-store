import { Badge } from '@/components/ui/badge';

import type { OrderPaymentDetails as PaymentDetailsType } from '@/types/admin/orders';

interface OrderPaymentDetailsProps {
  paymentDetails: PaymentDetailsType | null;
}

export function OrderPaymentDetails({ paymentDetails }: OrderPaymentDetailsProps) {
  if (!paymentDetails) return null;

  return (
    <div>
      <div className="text-sm font-medium text-foreground mb-3">Payment</div>
        <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 rounded-lg p-4 border border-border">
          <div>
            <div className="text-muted-foreground text-xs mb-0.5">Gateway</div>
            <div className="text-foreground">{paymentDetails.gateway_name}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs mb-0.5">Status</div>
            <Badge variant="outline" className="border-border text-xs capitalize">
              {paymentDetails.status}
            </Badge>
          </div>
          <div>
            <div className="text-muted-foreground text-xs mb-0.5">Amount Paid</div>
            <div className="text-foreground">
            {paymentDetails.currency} {parseFloat(paymentDetails.amount).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
  );
}
