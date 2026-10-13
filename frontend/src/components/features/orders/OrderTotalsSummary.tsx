import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney } from '@/lib/utils';
import type { OrderDto } from '@/types/order';

/** Immutable money breakdown exactly as charged (FR-004). */
export function OrderTotalsSummary({ order }: { order: OrderDto }) {
  const t = useTranslations('orders');
  const locale = useLocale();

  const rows: Array<[string, number] | null> = [
    [t('detail.subtotal'), order.subtotal],
    order.discountTotal > 0 ? [t('detail.discount'), -order.discountTotal] : null,
    [t('detail.shippingFee'), order.shippingFee],
    order.codFee > 0 ? [t('detail.codFee'), order.codFee] : null,
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('detail.summary')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {rows.map(
          (row) =>
            row && (
              <div key={row[0]} className="flex items-center justify-between">
                <span className="text-muted-foreground">{row[0]}</span>
                <span>
                  {formatMoney(row[1], locale)} {order.currency}
                </span>
              </div>
            )
        )}
        <div className="flex items-center justify-between border-t border-border pt-2 text-base font-bold">
          <span>{t('detail.total')}</span>
          <span className="text-primary">
            {formatMoney(order.total, locale)} {order.currency}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
