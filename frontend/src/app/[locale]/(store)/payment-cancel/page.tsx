'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { XCircle } from 'lucide-react';
import { paymentService } from '@/services/payment.service';

interface InitPaymentResponse {
  checkout_url?: string;
}

export default function PaymentCancelPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Promise.resolve().then(() => {
        setOrderId(sessionStorage.getItem('last_order_number'));
      });
    }
  }, []);

  const handleRetry = async () => {
    if (!orderId) return;
    setIsRetrying(true);
    try {
      const response = await paymentService.initPayment({
        order_id: orderId,
        gateway_code: 'stripe',
      }) as InitPaymentResponse;

      if (response.checkout_url) {
        window.location.href = response.checkout_url;
      } else {
        setIsRetrying(false);
      }
    } catch {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <XCircle className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Payment Cancelled / Failed</CardTitle>
          <p className="text-base text-muted-foreground">
            Your order has been saved, but the transaction was not completed.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {orderId && (
            <Button
              className="w-full h-12 text-base"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? 'Processing...' : 'Try Again'}
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => router.push('/orders')}
          >
            View My Orders
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
