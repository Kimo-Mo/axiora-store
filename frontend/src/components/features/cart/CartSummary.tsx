'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuthModal } from '@/providers/AuthModalProvider';
import { Button } from '@/components/ui';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui';
import { Separator } from '@/components/ui';
import { toast } from 'sonner';

export default function CartSummary() {
  const t = useTranslations('cart');
  const { subtotal, itemCount, hasUnavailableItems, isAuthenticated, currency } = useCart();
  const { openModal } = useAuthModal();
  const router = useRouter();

  const handleProceedToCheckout = () => {
    if (hasUnavailableItems) {
      toast.error(t('cannotCheckoutWithUnavailable'));
      return;
    }

    if (isAuthenticated) {
      router.push('/checkout');
      return;
    }

    // Unauthenticated guest: set returnTo=/checkout and open login modal (FR-015, T030)
    router.replace('/cart?returnTo=/checkout');
    openModal('login');
  };

  if (itemCount === 0) return null;

  return (
    <Card className="sticky top-24 border-border/80 shadow-xs">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold tracking-tight">
          {t('orderSummary')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('subtotal')}</span>
          <span className="font-semibold text-foreground">
            {subtotal.toFixed(2)} {currency}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('quantity')}</span>
          <span className="text-foreground">
            {itemCount} {itemCount === 1 ? t('item') : t('items')}
          </span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground pt-1">
          <span>{t('shippingCalculated')}</span>
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg text-foreground">
          <span>{t('total')}</span>
          <span className="text-primary">{subtotal.toFixed(2)} {currency}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50">
          <ShieldCheck className="size-4 text-primary shrink-0" />
          <span>{t('shippingCalculated')}</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2">
        <Button
          className="w-full h-12 text-base font-medium rounded-xl shadow-xs group cursor-pointer"
          disabled={hasUnavailableItems}
          onClick={handleProceedToCheckout}>
          <span>{isAuthenticated ? t('checkout') : t('signInToCheckout')}</span>
          <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
        </Button>

        <Button variant="outline" className="w-full rounded-xl" asChild>
          <Link href="/store">
            <ShoppingBag className="me-2 h-4 w-4" />
            {t('browseProducts')}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
