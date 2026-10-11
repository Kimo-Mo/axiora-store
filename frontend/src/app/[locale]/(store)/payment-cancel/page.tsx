'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { XCircle } from 'lucide-react';
import Loading from '@/app/loading';
import { Link } from '@/i18n/navigation';

/**
 * Provider return page after an abandoned or failed payment attempt.
 *
 * Presentational only. It never marks or unmarks an order: the order's state is
 * settled by the provider webhook, not by the customer arriving here (FR-013).
 * The retry affordance is a link to the order page rather than a second
 * initiation call — the order's "Pay now" action is the single place payment is
 * (re)started, and the backend is idempotent per order either way (FR-005/FR-021).
 *
 * `?order=` carries the order number because a cross-origin redirect back from the
 * provider does not preserve the legacy `sessionStorage` handoff.
 */
function PaymentCancelContent() {
  const t = useTranslations('payment');
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') ?? '';

  return (
    <div className="main_container py-16 md:py-24 flex items-center justify-center">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <XCircle className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('cancel.title')}</CardTitle>
          <p className="text-base text-muted-foreground">{t('cancel.subtitle')}</p>
          {orderNumber && (
            <p className="text-sm text-muted-foreground" dir="ltr">
              <span className="font-mono font-semibold text-foreground">{orderNumber}</span>
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4 pt-4 flex flex-col gap-3">
          {orderNumber && (
            <>
              <Button asChild className="w-full h-12 text-base">
                <Link href={`/checkout/confirmation/${encodeURIComponent(orderNumber)}`}>
                  {t('cancel.retry')}
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">{t('cancel.hint')}</p>
            </>
          )}
          <Button asChild variant="outline" className="w-full h-12 text-base">
            <Link href="/store">{t('cancel.continueShopping')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentCancelContent />
    </Suspense>
  );
}