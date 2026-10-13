import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney } from '@/lib/utils';
import type { OrderDto, OrderItemDto } from '@/types/order';

/** Localized "value" list for one item's variant attribute map. */
function VariantAttributes({ item }: { item: OrderItemDto }) {
  const locale = useLocale();
  const entries = Object.entries(item.variantSnapshot.attributes ?? {});
  if (entries.length === 0) return null;
  return (
    <p className="text-xs text-muted-foreground">
      {entries
        .map(([, names]) => (locale === 'ar' ? names.nameAr : names.nameEn))
        .join(' · ')}
    </p>
  );
}

/**
 * Immutable item snapshots (FR-003): everything renders from the order row,
 * never from the live product catalog.
 */
export function OrderItemsSummary({ order }: { order: OrderDto }) {
  const t = useTranslations('orders');
  const locale = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t('detail.items')} ({order.items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {order.items.map((item) => {
          const productName =
            (locale === 'ar' ? item.variantSnapshot?.nameAr : item.variantSnapshot?.nameEn) ||
            item.productNameSnapshot;

          return (
            <div key={item.id} className="flex gap-3 border-b border-border/60 pb-4 last:border-0 last:pb-0">
              {item.imageSnapshot && (
                <Image
                  src={item.imageSnapshot}
                  alt={productName}
                  width={72}
                  height={72}
                  className="size-18 shrink-0 rounded-lg border border-border object-cover"
                />
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-semibold">{productName}</p>
                <VariantAttributes item={item} />
                <p className="text-xs text-muted-foreground">
                  {formatMoney(item.unitPrice, locale)} {order.currency} × {item.quantity}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold">
                {formatMoney(item.lineTotal, locale)} {order.currency}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
