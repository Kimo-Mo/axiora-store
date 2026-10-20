'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Boxes, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { InventoryFilterBar } from '@/components/admin/inventory/InventoryFilterBar';
import { InventoryTable } from '@/components/admin/inventory/InventoryTable';
import { StockAdjustmentDialog } from '@/components/admin/inventory/StockAdjustmentDialog';
import { AdjustmentHistorySheet } from '@/components/admin/inventory/AdjustmentHistorySheet';
import {
  useAdminInventoryQuery,
  useLowStockThresholdQuery,
} from '@/hooks/admin/useInventoryHooks';
import { useAdminDashboardStatsQuery } from '@/hooks/admin/useAdminDashboardStatsQuery';
import type { InventoryVariantDto } from '@/types/admin';

export default function AdminInventoryPage() {
  const t = useTranslations('admin.inventory');

  // Deep-link support: the dashboard's low-stock KPI card links here with
  // ?lowStockOnly=true, so the initial filter state comes from the URL.
  const searchParams = useSearchParams();

  // Filter and pagination state
  const initialSearch = searchParams.get('search') ?? '';
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [lowStockOnly, setLowStockOnly] = useState(() => searchParams.get('lowStockOnly') === 'true');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Debounce search so typing does not fire one API call per keystroke
  // (same pattern as the products list page).
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [search]);

  // Active modal targets
  const [adjustingVariant, setAdjustingVariant] = useState<InventoryVariantDto | null>(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);

  const [historyVariant, setHistoryVariant] = useState<InventoryVariantDto | null>(null);
  const [historySheetOpen, setHistorySheetOpen] = useState(false);

  // Queries
  const { data: thresholdData } = useLowStockThresholdQuery();
  const currentThreshold = thresholdData?.lowStockThreshold ?? 5;

  const { data: inventoryData, isLoading } = useAdminInventoryQuery({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    lowStockOnly,
  });

  const { data: stats } = useAdminDashboardStatsQuery();

  const variants = inventoryData?.results ?? [];
  const meta = inventoryData?.meta;

  // The KPI card and filter badge promise the catalogue-wide number, not the
  // handful of rows on the current page; the dashboard stats payload already
  // carries it (and inventory mutations invalidate that key). Fall back to the
  // page-scoped count only while the stats query is still in flight.
  const pageLowStockCount = variants.filter((v: InventoryVariantDto) => v.isLowStock).length;
  const lowStockCount = stats ? stats.inventory.lowStockCount : pageLowStockCount;

  const handleSearchChange = (val: string) => {
    setSearch(val);
  };

  const handleLowStockToggle = (val: boolean) => {
    setLowStockOnly(val);
    setPage(1);
  };

  const handleOpenAdjust = (variant: InventoryVariantDto) => {
    setAdjustingVariant(variant);
    setAdjustDialogOpen(true);
  };

  const handleOpenHistory = (variant: InventoryVariantDto) => {
    setHistoryVariant(variant);
    setHistorySheetOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t('subtitle')}</p>
      </div>

      {/* KPI metric summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Boxes className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">{t('allVariants')}</p>
              <p className="text-lg font-bold text-foreground">
                {meta?.total ?? variants.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">{t('lowStockOnly')}</p>
              <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                {lowStockCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">{t('threshold')}</p>
              <p className="text-lg font-bold text-foreground">
                {currentThreshold} {t('units')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <InventoryFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        lowStockOnly={lowStockOnly}
        onLowStockToggle={handleLowStockToggle}
        totalCount={meta?.total}
        lowStockCount={lowStockCount}
      />

      {/* Main Inventory Table */}
      <InventoryTable
        variants={variants}
        meta={meta}
        onPageChange={setPage}
        loading={isLoading}
        onAdjustStock={handleOpenAdjust}
        onViewHistory={handleOpenHistory}
      />

      {/* Manual Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        variant={adjustingVariant}
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
      />

      {/* Adjustment History Side Sheet */}
      <AdjustmentHistorySheet
        variant={historyVariant}
        open={historySheetOpen}
        onOpenChange={setHistorySheetOpen}
      />
    </div>
  );
}
