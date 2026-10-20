'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { History, Loader2, ArrowUp, ArrowDown, User, Calendar } from 'lucide-react';
import type { InventoryAdjustmentDto, InventoryVariantDto } from '@/types/admin';
import { useInventoryAdjustmentsQuery } from '@/hooks/admin/useInventoryHooks';

interface AdjustmentHistorySheetProps {
  variant: InventoryVariantDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AdjustmentHistorySheetBodyProps {
  variant: InventoryVariantDto;
}

function AdjustmentHistorySheetBody({ variant }: AdjustmentHistorySheetBodyProps) {
  const t = useTranslations('admin.inventory');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const { data, isLoading } = useInventoryAdjustmentsQuery({
    variantId: variant.variantId,
    limit: 50,
  });

  const adjustments = data?.results ?? [];
  const productName = isAr ? variant.productNameAr : variant.productNameEn;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <SheetHeader className="text-start">
        <SheetTitle className="text-base font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          {t('historyModal.title')}
        </SheetTitle>
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground">{productName}</p>
          <p className="text-[11px] font-mono text-muted-foreground">{variant.sku}</p>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto pe-1 space-y-3">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs">Loading audit logs...</span>
          </div>
        ) : adjustments.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <History className="h-8 w-8 mx-auto opacity-40" />
            <p className="text-xs">{t('historyModal.noHistory')}</p>
          </div>
        ) : (
          adjustments.map((adj: InventoryAdjustmentDto) => {
            const isPositive = adj.quantityChange >= 0;
            return (
              <div
                key={adj.id}
                className="p-3 rounded-lg border border-border bg-card space-y-2 text-xs transition-colors hover:border-border/80"
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant={isPositive ? 'default' : 'destructive'}
                    className="font-mono text-xs font-bold gap-1"
                  >
                    {isPositive ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {isPositive ? `+${adj.quantityChange}` : `${adj.quantityChange}`}
                  </Badge>

                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(adj.createdAt)}</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-muted/40 text-foreground font-medium text-xs wrap-break-word">
                  {adj.reason}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{adj.adjustedBy || 'System Admin'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function AdjustmentHistorySheet({
  variant,
  open,
  onOpenChange,
}: AdjustmentHistorySheetProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  if (!variant) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isAr ? 'left' : 'right'} className="w-full sm:max-w-md">
        <AdjustmentHistorySheetBody variant={variant} />
      </SheetContent>
    </Sheet>
  );
}
