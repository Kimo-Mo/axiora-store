'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/stores/useCartStore';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useAuthModal } from '@/providers/AuthModalProvider';
import { Button } from '@/components/ui';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui';
import { Separator } from '@/components/ui';

export default function CartSummary() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModal();
  const router = useRouter();

  const currency = items[0]?.product?.currency === 'USD' ? '$' : (items[0]?.product?.currency || 'EGP');

  const handleProceedToCheckout = () => {
    if (isAuthenticated) {
      router.push('/checkout');
      return;
    }
    openModal('login');
  };

  if (items.length === 0) return null;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>
            {currency} {total.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Estimated Shipping</span>
          <span className="text-xs text-muted-foreground">Calculated at checkout</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>
            {currency} {total.toFixed(2)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button className="w-full h-12 text-base" onClick={handleProceedToCheckout}>
          Proceed to Checkout
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/store">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
