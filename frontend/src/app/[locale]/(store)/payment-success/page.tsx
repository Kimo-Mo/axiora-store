'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Promise.resolve().then(() => {
        const storedOrderId = sessionStorage.getItem('last_order_number');
        if (storedOrderId) {
          setOrderId(storedOrderId);
          sessionStorage.removeItem('last_order_number');
        }
      });
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-green-500/10 p-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Payment Successful!</CardTitle>
          <p className="text-base text-muted-foreground">
            Thank you for your purchase. Your order {orderId && <span className="font-semibold text-foreground">#{orderId}</span>} is being processed.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 flex flex-col gap-3">
          <Button
            className="w-full h-12 text-base"
            onClick={() => router.push('/orders')}
          >
            View Order Details
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => router.push('/store')}
          >
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
