'use client';

import { useLocale, useTranslations } from 'next-intl';
import { AlertCircle, Loader2, MapPin } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent, CardHeader, CardTitle, Separator } from '@/components/ui';
import { formatMoney as formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import type { CheckoutQuoteDto } from '@/types/checkout';
import type { UnavailableItemDto } from '@/types/checkout';

interface CheckoutSummaryProps {
  quote: CheckoutQuoteDto | null;
  quoteLoading: boolean;
  quoteError: boolean;
  insufficientItems: UnavailableItemDto[] | null;
  isPlacing: boolean;
  canPlaceOrder: boolean;
  onPlaceOrder: () => void;
  onBackToCart: () => void;
  placeOrderError: string | null;
}

/**
 * Sticky live order summary (section 4). Every amount comes from the server
 * quote — client values are never computed or displayed (FR-006, US2).
 */
export function CheckoutSummary({
  quote,
  quoteLoading,
  quoteError,
  insufficientItems,
  isPlacing,
  canPlaceOrder,
  onPlaceOrder,
  onBackToCart,
  placeOrderError,
}: CheckoutSummaryProps) {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const { items } = useCart();

  const formatMoney = (amount: number) => formatCurrency(amount, locale);

  const formatEstimated = (days: number) =>
    days === 1 ? t('summary.estimatedDeliveryOne') : t('summary.estimatedDelivery', { days });

  return (
    <Card className="sticky top-24 shadow-sm border-muted/60">
      <CardHeader className="bg-muted/20 border-b border-muted/40 pb-4">
        <CardTitle>{t('summary.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 text-sm">
              <span className="min-w-0 flex-1">
                <span className="font-medium block truncate">
                  {locale === 'ar' ? item.product.nameAr : item.product.nameEn}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('summary.itemsCount', { count: item.quantity })}
                  {item.variant.sku ? ` · ${item.variant.sku}` : ''}
                </span>
              </span>
              <span className="font-medium whitespace-nowrap" dir="ltr">
                {formatMoney(item.lineTotal)}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('summary.subtotal')}</span>
            <span className="font-medium" dir="ltr">
              {quote ? formatMoney(quote.subtotal) : formatMoney(items.reduce((s, i) => s + i.lineTotal, 0))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('summary.shippingFee')}</span>
            <span className="font-medium" dir="ltr">
              {quote ? formatMoney(quote.shippingFee) : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('summary.codFee')}</span>
            <span className="font-medium" dir="ltr">
              {quote ? formatMoney(quote.codFee) : '—'}
            </span>
          </div>
        </div>

        {quote?.estimatedDays != null && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {formatEstimated(quote.estimatedDays)}
          </p>
        )}

        {quoteLoading && (
          <p className="text-sm text-muted-foreground animate-pulse flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ...
          </p>
        )}

        {quoteError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('errors.deliveryUnavailable')}</AlertDescription>
          </Alert>
        )}

        {insufficientItems && insufficientItems.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('insufficientStock.title')}</AlertTitle>
            <AlertDescription>
              <p className="mb-2">{t('insufficientStock.description')}</p>
              <ul className="list-disc ps-4 space-y-1 text-xs">
                {insufficientItems.map((item) => (
                  <li key={item.variantId}>
                    {locale === 'ar' ? item.productNameAr : item.productNameEn}
                  </li>
                ))}
              </ul>
              <Button type="button" size="sm" variant="outline" className="mt-3" onClick={onBackToCart}>
                {t('insufficientStock.backToCart')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>{t('summary.total')}</span>
          <span dir="ltr">{quote ? formatMoney(quote.total) : '—'}</span>
        </div>

        {placeOrderError && (
          <p className="text-sm text-destructive font-medium">{placeOrderError}</p>
        )}

        <Button
          onClick={onPlaceOrder}
          disabled={isPlacing || !canPlaceOrder || quoteLoading}
          size="lg"
          className="w-full text-base font-semibold shadow-md transition-all hover:shadow-lg h-12"
        >
          {isPlacing ? t('summary.placing') : t('summary.placeOrder')}
        </Button>
      </CardContent>
    </Card>
  );
}
