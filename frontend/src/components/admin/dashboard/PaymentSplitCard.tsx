'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, CreditCard } from 'lucide-react';
import type { DashboardStatsDto } from '@/types/admin';

interface PaymentSplitCardProps {
  stats: DashboardStatsDto;
}

export function PaymentSplitCard({ stats }: PaymentSplitCardProps) {
  const t = useTranslations('admin.dashboard.paymentSplit');
  const totalCount = stats.paymentSplit.codCount + stats.paymentSplit.onlineCount;
  const codPercent = totalCount > 0 ? Math.round((stats.paymentSplit.codCount / totalCount) * 100) : 0;
  const onlinePercent = totalCount > 0 ? 100 - codPercent : 0;

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Progress Bar */}
        <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
          <div
            style={{ width: `${codPercent}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`COD: ${codPercent}%`}
          />
          <div
            style={{ width: `${onlinePercent}%` }}
            className="bg-primary transition-all duration-500"
            title={`Online: ${onlinePercent}%`}
          />
        </div>

        {/* Legend & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* COD */}
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background">
            <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t('cod')}</div>
              <div className="text-lg font-bold">
                {Number(stats.paymentSplit.codAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
                <span className="text-xs font-normal text-muted-foreground">{stats.revenue.currency}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.paymentSplit.codCount} {t('orders')} ({codPercent}%)
              </div>
            </div>
          </div>

          {/* Online */}
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t('online')}</div>
              <div className="text-lg font-bold">
                {Number(stats.paymentSplit.onlineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
                <span className="text-xs font-normal text-muted-foreground">{stats.revenue.currency}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.paymentSplit.onlineCount} {t('orders')} ({onlinePercent}%)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
