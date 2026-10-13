'use client';

import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import {
  CancelOrderButton,
  OrderItemsSummary,
  OrderStatusBadge,
  OrderTimeline,
  OrderTotalsSummary,
} from '@/components/features/orders';
import { useOrderDetailQuery } from '@/hooks/orders/useOrderDetailQuery';

/**
 * Customer order detail (US2): immutable snapshots, money breakdown,
 * shipping/payment state, and the actor-attributed timeline.
 *
 * The cancel slot renders for PENDING/CONFIRMED orders (FR-008); the button
 * itself is owned by US3 (T027) — until then the legacy shim renders inside
 * the slot.
 */
export default function AccountOrderDetailPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = typeof params.orderNumber === 'string' ? params.orderNumber : '';
  const t = useTranslations('orders');
  const tCheckout = useTranslations('checkout');
  const locale = useLocale();

  const detailQuery = useOrderDetailQuery(orderNumber);
  const order = detailQuery.data;

  if (!orderNumber || detailQuery.isError || (!detailQuery.isLoading && !order)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <PackageSearch size={48} className="text-muted-foreground" />
        <h1 className="text-xl font-bold">{t('detail.notFoundTitle')}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{t('detail.notFoundHint')}</p>
        <Button asChild variant="outline">
          <Link href="/account/orders">{t('detail.backToOrders')}</Link>
        </Button>
      </div>
    );
  }

  if (detailQuery.isLoading || !order) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  const address = order.shippingAddressSnapshot;
  const cancellable = order.status === 'PENDING' || order.status === 'CONFIRMED';
  const methodLabel =
    order.paymentMethod === 'COD' ? tCheckout('payment.cod') : tCheckout('payment.online');

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 gap-1 ps-0">
          <Link href="/account/orders">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t('detail.backToOrders')}
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">
            {t('list.orderNumber')} {order.orderNumber}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date(order.createdAt).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-EG')}
        </p>
      </div>

      {cancellable && (
        <section aria-label="cancel">
          <CancelOrderButton
            orderNumber={order.orderNumber}
            paidOnline={order.paymentMethod === 'ONLINE' && order.paymentStatus === 'PAID'}
          />
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <OrderItemsSummary order={order} />
          <OrderTimeline history={order.statusHistory} />
        </div>
        <div className="space-y-4">
          <OrderTotalsSummary order={order} />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('detail.shipping')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-semibold">{address.fullName}</p>
              <p className="text-muted-foreground">
                {t('detail.phone')}: {order.customerPhoneSnapshot}
              </p>
              <p>
                {address.street}
                {address.building ? `، ${address.building}` : ''}
                {address.floor ? ` — ${tCheckout('address.floor')}: ${address.floor}` : ''}
                {address.apartment ? ` — ${tCheckout('address.apartment')}: ${address.apartment}` : ''}
              </p>
              <p className="text-muted-foreground">
                {[address.area, address.city, address.governorate].filter(Boolean).join('، ')}
              </p>
              {address.landmark && (
                <p className="text-muted-foreground">
                  {tCheckout('address.landmark')}: {address.landmark}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('detail.payment')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{methodLabel}</p>
              <p className="text-muted-foreground">{t(`paymentStatus.${order.paymentStatus}`)}</p>
            </CardContent>
          </Card>
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('notes.label')}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{order.notes}</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
