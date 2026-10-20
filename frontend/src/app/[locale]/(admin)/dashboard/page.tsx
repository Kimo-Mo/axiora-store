'use client';

import { useTranslations } from 'next-intl';
import { useAdminDashboardStatsQuery } from '@/hooks/admin/useAdminDashboardStatsQuery';
import { DashboardMetricCards } from '@/components/admin/dashboard/DashboardMetricCards';
import { PaymentSplitCard } from '@/components/admin/dashboard/PaymentSplitCard';
import { QuickActionsCard } from '@/components/admin/dashboard/QuickActionsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const t = useTranslations('admin.dashboard');
  const { data: stats, isLoading, isError, refetch } = useAdminDashboardStatsQuery();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="self-start sm:self-auto gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{t('refresh')}</span>
        </Button>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-border bg-card">
                <CardContent className="p-6 space-y-3 h-40">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-3 w-36" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-start">
            <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive">{t('errors.title')}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t('errors.description')}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              {t('errors.tryAgain')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {stats && (
        <>
          <DashboardMetricCards stats={stats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaymentSplitCard stats={stats} />
            <QuickActionsCard />
          </div>
        </>
      )}
    </div>
  );
}
