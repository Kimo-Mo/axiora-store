'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import type { DashboardStatsDto } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/navigation';

interface DashboardMetricCardsProps {
  stats: DashboardStatsDto;
}

export function DashboardMetricCards({ stats }: DashboardMetricCardsProps) {
  const t = useTranslations('admin.dashboard.kpis');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* 1. Total Orders */}
      <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('totalOrders')}
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold tracking-tight">
            {stats.orders.total.toLocaleString()}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
              {stats.orders.pending} {t('pendingOrders')}
            </Badge>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
              {stats.orders.processing} {t('processingOrders')}
            </Badge>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              {stats.orders.delivered} {t('deliveredOrders')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 2. Total & Monthly Revenue */}
      <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('totalRevenue')}
          </CardTitle>
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {Number(stats.revenue.total).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-muted-foreground">{stats.revenue.currency}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t('monthRevenue')}: <span className="font-semibold text-foreground">{Number(stats.revenue.thisMonth).toLocaleString(undefined, { minimumFractionDigits: 2 })} {stats.revenue.currency}</span>
          </p>
        </CardContent>
      </Card>

      {/* 3. Catalog Products */}
      <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('totalProducts')}
          </CardTitle>
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Package className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold tracking-tight">
            {stats.products.total.toLocaleString()}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t('activeProducts')}: <span className="font-semibold text-foreground">{stats.products.active.toLocaleString()}</span>
          </p>
        </CardContent>
      </Card>

      {/* 4. Low-Stock Alerts */}
      <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('lowStockAlerts')}
          </CardTitle>
          <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-destructive">
            {stats.inventory.lowStockCount.toLocaleString()}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <Link href="/dashboard/inventory?lowStockOnly=true" className="text-destructive hover:underline font-medium">
              {stats.inventory.lowStockCount} {t('needAttention')} (≤ {stats.inventory.threshold}) →
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
