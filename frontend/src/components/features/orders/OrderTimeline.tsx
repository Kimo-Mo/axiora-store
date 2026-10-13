import { useLocale, useTranslations } from 'next-intl';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { OrderStatusHistoryDto } from '@/types/order';

interface OrderTimelineProps {
  history: OrderStatusHistoryDto[];
}

/**
 * Audit-style status timeline (FR-006).
 *
 * Renders exactly what the server recorded — chronological `statusHistory`
 * with timestamp and actor — never inferred milestones, so failed or
 * cancelled orders render truthfully. Exception statuses use the
 * destructive treatment.
 */
export function OrderTimeline({ history }: OrderTimelineProps) {
  const t = useTranslations('orders');
  const locale = useLocale();
  const dateLocale = locale === 'ar' ? 'ar-EG' : 'en-EG';

  if (history.length === 0) return null;

  return (
    <section aria-label={t('history.title')} className="space-y-4">
      <h2 className="text-lg font-semibold">{t('history.title')}</h2>
      <ol className="relative space-y-5 border-s-2 border-border ps-5">
        {history.map((entry) => (
          <li key={entry.id} className="relative">
            <span
              aria-hidden
              className="absolute -start-[29px] top-1 size-2.5 rounded-full border-2 border-background bg-primary"
            />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <OrderStatusBadge status={entry.status} />
              <time
                dateTime={entry.createdAt}
                className="text-xs text-muted-foreground">
                {new Date(entry.createdAt).toLocaleString(dateLocale)}
              </time>
              <span className="text-xs text-muted-foreground">
                · {t(`history.actor.${entry.actor}`)}
              </span>
            </div>
            {entry.note && (
              <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
