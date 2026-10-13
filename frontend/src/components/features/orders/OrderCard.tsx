import { CalendarDays, Eye, ReceiptText } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { formatMoney } from '@/lib/utils';
import type { OrderSummaryDto } from '@/types/order';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderCardProps {
  order: OrderSummaryDto;
}

/**
 * One row of the customer order history (Express `OrderSummaryDto`).
 * Links to the detail page; cancellation lives on the detail page (US3).
 */
export function OrderCard({ order }: OrderCardProps) {
  const t = useTranslations('orders');
  const locale = useLocale();

  return (
    <article className="rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-primary/30 hover:bg-card">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold">
              {t('list.orderNumber')}: {order.orderNumber}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="mb-1 text-xs text-muted-foreground">{t('list.date')}</p>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-primary" />
              <span>{new Date(order.createdAt).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-EG')}</span>
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="mb-1 text-xs text-muted-foreground">{t('list.items')}</p>
            <div className="flex items-center gap-1.5">
              <ReceiptText className="size-3.5 text-primary" />
              <span>{t('list.itemsCount', { count: order.itemCount })}</span>
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/50 p-3">
            <p className="mb-1 text-xs text-muted-foreground">{t('list.total')}</p>
            <span className="font-semibold text-primary">
              {formatMoney(order.total, locale)} {order.currency}
            </span>
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-3">
          <Button variant="outline" size="sm" className="gap-1" asChild>
            <Link href={`/account/orders/${order.orderNumber}`}>
              <Eye className="size-3.5" />
              {t('list.viewDetails')}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
