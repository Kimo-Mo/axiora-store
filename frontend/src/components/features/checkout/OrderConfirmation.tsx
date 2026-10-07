'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { BadgeCheck, MapPin } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '@/components/ui';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';
import { formatMoney as formatCurrency } from '@/lib/utils';
import { orderService } from '@/services/order.service';
import type { OrderDto } from '@/types/order';

interface OrderConfirmationProps {
  order: OrderDto;
}

/**
 * Order confirmation details (FR-016): order number, itemized purchases with
 * snapshots, all charges, shipping address, payment method, and the estimated
 * delivery window snapshotted at purchase time. The cancel affordance is the
 * customer's self-service cancellation touchpoint (FR-017) — backend-only in
 * this phase, surfaced here because the confirmation screen is the sole
 * post-order page.
 */
export function OrderConfirmation({ order }: OrderConfirmationProps) {
  const t = useTranslations('checkout');
  const tOrders = useTranslations('orders');
  const locale = useLocale();
  const queryClient = useQueryClient();

  // Local copy of the order updated by cancellation; the page keys this
  // component by orderNumber so per-order state never leaks between orders.
  const [currentOrder, setCurrentOrder] = useState(order);
  const isCancellable = currentOrder.status === 'PENDING' || currentOrder.status === 'CONFIRMED';

  const cancelMutation = useMutation({
    mutationFn: () => orderService.cancel(currentOrder.orderNumber),
    onSuccess: (updated) => {
      setCurrentOrder(updated);
      toast.success(t('confirmation.cancelSuccess'));
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: unknown) => {
      const code = axios.isAxiosError(err)
        ? (err.response?.data as { error?: { code?: string } } | undefined)?.error?.code
        : undefined;
      toast.error(
        code === 'ORDER_NOT_CANCELLABLE' ? t('confirmation.notCancellable') : t('confirmation.cancelFailed'),
      );
    },
  });

  const formatMoney = (amount: number) => formatCurrency(amount, locale);

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));

  const address = currentOrder.shippingAddressSnapshot;

  return (
    <div className="main_container py-8 md:py-12 space-y-8 max-w-4xl">
      <div className="text-center space-y-2">
        <BadgeCheck className="h-14 w-14 text-emerald-600 mx-auto" />
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t('confirmation.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('confirmation.subtitle')}</p>
      </div>

      <Card className="border-muted/60 shadow-sm">
        <CardHeader className="bg-muted/20 border-b border-muted/40 pb-4 flex-row items-center justify-between space-y-0">
          <div>
            <p className="text-xs text-muted-foreground">{t('confirmation.orderNumber')}</p>
            <CardTitle className="text-lg font-mono" dir="ltr">
              {currentOrder.orderNumber}
            </CardTitle>
          </div>
          <Badge variant="secondary">{tOrders(`status.${currentOrder.status}`)}</Badge>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="text-sm flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {currentOrder.estimatedDeliveryDays != null
              ? currentOrder.estimatedDeliveryDays === 1
                ? t('summary.estimatedDeliveryOne')
                : t('summary.estimatedDelivery', { days: currentOrder.estimatedDeliveryDays })
              : t('confirmation.estimatedDelivery')}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t('confirmation.items')}</h3>
            <div className="space-y-3">
              {currentOrder.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  {item.imageSnapshot && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageSnapshot}
                      alt=""
                      className="h-14 w-14 rounded-lg border border-border object-cover shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium truncate">
                      {locale === 'ar' ? item.variantSnapshot.nameAr : item.variantSnapshot.nameEn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Object.values(item.variantSnapshot.attributes)
                        .map((attr) => (locale === 'ar' ? attr.nameAr : attr.nameEn))
                        .join(' · ')}
                      {item.variantSnapshot.sku ? ` · ${item.variantSnapshot.sku}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {formatMoney(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap" dir="ltr">
                    {formatMoney(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('summary.subtotal')}</span>
              <span className="font-medium" dir="ltr">{formatMoney(currentOrder.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('summary.shippingFee')}</span>
              <span className="font-medium" dir="ltr">{formatMoney(currentOrder.shippingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('summary.codFee')}</span>
              <span className="font-medium" dir="ltr">{formatMoney(currentOrder.codFee)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>{t('summary.total')}</span>
              <span dir="ltr">{formatMoney(currentOrder.total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t('summary.payOnDelivery')}</p>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2 text-sm">
            <div className="space-y-1">
              <h3 className="font-semibold">{t('confirmation.shippingAddress')}</h3>
              <p className="text-muted-foreground">
                {address.fullName}
                {address.label ? ` · ${address.label}` : ''}
              </p>
              <p className="text-muted-foreground" dir="ltr">{address.phone}</p>
              <p className="text-muted-foreground">
                {address.governorate}, {address.city}, {address.street}
              </p>
              {address.building && (
                <p className="text-muted-foreground">
                  {address.building}
                  {address.floor ? `, ${address.floor}` : ''}
                  {address.apartment ? `, ${address.apartment}` : ''}
                </p>
              )}
              {address.landmark && <p className="text-muted-foreground">{address.landmark}</p>}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">{t('confirmation.paymentMethod')}</h3>
              <p className="text-muted-foreground">{t('payment.cod')}</p>
              <h3 className="font-semibold pt-2">{t('confirmation.contactPhone')}</h3>
              <p className="text-muted-foreground" dir="ltr">{currentOrder.customerPhoneSnapshot}</p>
              {currentOrder.notes && (
                <>
                  <h3 className="font-semibold pt-2">{t('confirmation.notes')}</h3>
                  <p className="text-muted-foreground">{currentOrder.notes}</p>
                </>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <h3 className="font-semibold">{t('confirmation.timeline')}</h3>
            <ol className="space-y-2">
              {currentOrder.statusHistory.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <Badge variant="outline">{tOrders(`status.${entry.status}`)}</Badge>
                    {entry.note && <span className="text-muted-foreground text-xs">{entry.note}</span>}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap" dir="ltr">
                    {formatDate(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {isCancellable && (
            <Alert>
              <AlertTitle>{t('confirmation.status')}</AlertTitle>
              <AlertDescription className="flex items-center justify-between gap-4">
                <span>
                  {tOrders(`status.${currentOrder.status}`)} — {t('confirmation.cancelConfirm')}
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate()}
                >
                  {cancelMutation.isPending ? t('confirmation.cancelling') : t('confirmation.cancel')}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Button asChild size="lg" className="w-full">
            <Link href="/store">{t('confirmation.backToStore')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
