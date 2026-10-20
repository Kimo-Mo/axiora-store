'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, AlertTriangle, Boxes } from 'lucide-react';
import { LowStockThresholdPopover } from './LowStockThresholdPopover';

interface InventoryFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  lowStockOnly: boolean;
  onLowStockToggle: (lowStock: boolean) => void;
  totalCount?: number;
  lowStockCount?: number;
}

export function InventoryFilterBar({
  search,
  onSearchChange,
  lowStockOnly,
  onLowStockToggle,
  totalCount,
  lowStockCount,
}: InventoryFilterBarProps) {
  const t = useTranslations('admin.inventory');

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute inset-s-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('sku') + ' / ' + t('variant') + '...'}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="ps-8 text-xs h-9"
        />
      </div>

      {/* Filter Toggles & Threshold Setting */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-border p-0.5 bg-muted/40">
          <Button
            type="button"
            variant={!lowStockOnly ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onLowStockToggle(false)}
            className="text-xs h-8 gap-1.5 px-3"
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>{t('allVariants')}</span>
            {totalCount !== undefined && !lowStockOnly && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                {totalCount}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant={lowStockOnly ? 'destructive' : 'ghost'}
            size="sm"
            onClick={() => onLowStockToggle(true)}
            className="text-xs h-8 gap-1.5 px-3"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>{t('lowStockOnly')}</span>
            {lowStockCount !== undefined && (
              <Badge
                variant={lowStockOnly ? 'secondary' : 'outline'}
                className="text-[10px] px-1 py-0 h-4"
              >
                {lowStockCount}
              </Badge>
            )}
          </Button>
        </div>

        <LowStockThresholdPopover />
      </div>
    </div>
  );
}
