'use client';

import { useTranslations } from 'next-intl';
import { useCart } from '@/hooks/useCart';
import CartItemRow from '@/components/features/cart/CartItemRow';
import CartSummary from '@/components/features/cart/CartSummary';
import EmptyCart from '@/components/features/cart/EmptyCart';
import CartNoticeBanner from '@/components/features/cart/CartNoticeBanner';
import { Button } from '@/components/ui';
import Loading from '@/app/loading';

export default function CartPage() {
  const t = useTranslations('cart');
  const { items, clearCart, isHydrated, notices, currency } = useCart();

  if (!isHydrated) {
    return <Loading />;
  }

  return (
    <div className="main_container py-6 md:py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void clearCart()}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 self-start sm:self-auto cursor-pointer">
            {t('clearAll')}
          </Button>
        )}
      </div>

      {/* Cart Notices Banner */}
      {notices && notices.length > 0 && (
        <CartNoticeBanner notices={notices} />
      )}

      {/* Main Cart Body */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-2">
            <div className="divide-y divide-border/60">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} currency={currency} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      ) : (
        <EmptyCart />
      )}
    </div>
  );
}
