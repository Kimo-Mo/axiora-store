'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { CheckCircle2 } from 'lucide-react';
import Loading from '@/app/loading';
import { Link } from '@/i18n/navigation';
import { orderService } from '@/services/order.service';

/**
 * Provider return page after a payment attempt (FR-013).
 *
 * Presentational only, and deliberately honest: the customer arriving here has
 * merely *completed an attempt on the provider's page*. The order is confirmed
 * only by a signature-verified webhook, which may not have landed yet — so this
 * screen states that confirmation is in progress and links to the order, which
 * shows live server state. It never asserts "paid" on the strength of the
 * redirect itself, because the redirect is not authenticated and is trivially
 * reachable by typing the URL.
 *
 * The order number arrives as an `?order=` query parameter rather than through the
 * legacy `sessionStorage` handoff: a cross-origin redirect back from the provider
 * does not carry that client state.
 */
function PaymentSuccessContent() {
  const t = useTranslations('payment');
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') ?? '';

  // The order's real state, so the page can render the actual payment status
  // instead of guessing from the URL.
  const orderQuery = useQuery({
    queryKey: ['orders', 'detail', orderNumber],
    queryFn: () => orderService.detail(orderNumber),
    enabled: Boolean(orderNumber),
    retry: false,
    // The webhook may land a moment after the redirect, so allow a couple of
    // background refetches to catch the transition rather than pinning the page
    // to whatever the first response said.
    refetchInterval: (query) => (query.state.data?.paymentStatus === 'PENDING' ? 5_000 : false),
  });

  const status = orderQuery.data?.paymentStatus;

  return (
    <div className="main_container py-16 md:py-24 flex items-center justify-center">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-emerald-500/10 p-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('success.title')}</CardTitle>
          <p className="text-base text-muted-foreground">{t('success.subtitle')}</p>
          {orderNumber && (
            <p className="text-sm text-muted-foreground" dir="ltr">
              <span className="font-mono font-semibold text-foreground">{orderNumber}</span>
            </p>
          )}
          {status && (
            <p className="text-sm font-medium">
              {t(`status.${status.toLowerCase()}`)}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4 pt-4 flex flex-col gap-3">
          {status === 'PENDING' && (
            <p className="text-xs text-muted-foreground">{t('success.confirming')}</p>
          )}
          {orderNumber && (
            <Button asChild className="w-full h-12 text-base">
              <Link href={`/checkout/confirmation/${encodeURIComponent(orderNumber)}`}>
                {t('success.viewOrder')}
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="w-full h-12 text-base">
            <Link href="/store">{t('success.continueShopping')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}