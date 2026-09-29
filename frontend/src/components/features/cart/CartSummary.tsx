'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/stores/useCartStore';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useAuthModal } from '@/providers/AuthModalProvider';
import { Button } from '@/components/ui';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui';
import { Separator } from '@/components/ui';

export default function CartSummary() {
  const t = useTranslations('cart');
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
        <CardTitle>{t('orderSummary')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('subtotal')}</span>
          <span>
            {currency} {total.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('estimatedShipping')}</span>
          <span className="text-xs text-muted-foreground">{t('calculatedAtCheckout')}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>{t('total')}</span>
          <span>
            {currency} {total.toFixed(2)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button className="w-full h-12 text-base" onClick={handleProceedToCheckout}>
          {t('proceedToCheckout')}
          <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/store">
            <ShoppingBag className="me-2 h-4 w-4" />
            {t('continueShopping')}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
