'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowDown, ArrowUp, Loader2, PackageCheck } from 'lucide-react';
import type { InventoryVariantDto } from '@/types/admin';
import { useStockAdjustmentMutation } from '@/hooks/admin/useInventoryHooks';

interface StockAdjustmentDialogProps {
  variant: InventoryVariantDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StockAdjustmentDialogBodyProps {
  variant: InventoryVariantDto;
  onClose: () => void;
}

function StockAdjustmentDialogBody({
  variant,
  onClose,
}: StockAdjustmentDialogBodyProps) {
  const t = useTranslations('admin.inventory');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const mutation = useStockAdjustmentMutation();

  const [quantityChange, setQuantityChange] = useState<number>(0);
  const [reason, setReason] = useState<string>('');

  const productName = isAr ? variant.productNameAr : variant.productNameEn;
  const currentStock = variant.stockQuantity;
  const reservedQuantity = variant.reservedQuantity;
  const newStock = currentStock + quantityChange;
  const newAvailable = newStock - reservedQuantity;

  // Invariant validation — the reason min-length mirrors the backend schema
  // (`min(3)`), so a 1–2 character reason fails fast client-side instead of
  // surfacing as a 400 after the user filled the form.
  const isBelowZero = newStock < 0;
  const isBelowReserved = newStock < reservedQuantity;
  const isZeroChange = quantityChange === 0;
  const isReasonInvalid = reason.trim().length < 3;
  const isValid = !isBelowZero && !isBelowReserved && !isZeroChange && !isReasonInvalid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || mutation.isPending) return;

    // The hook toasts the error; this catch only keeps the rejection from
    // bubbling as an unhandled exception while the dialog stays open.
    try {
      await mutation.mutateAsync({
        variantId: variant.variantId,
        quantityChange,
        reason: reason.trim(),
      });
    } catch {
      return;
    }

    onClose();
  };

  const handleQuickDelta = (delta: number) => {
    setQuantityChange((prev) => prev + delta);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <DialogHeader>
        <DialogTitle className="text-base font-semibold flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-primary" />
          {t('adjustmentModal.title')}
        </DialogTitle>
        <p className="text-xs text-muted-foreground">
          {t('adjustmentModal.subtitle', { sku: variant.sku })}
        </p>
      </DialogHeader>

      {/* Target variant summary card */}
      <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">{productName}</span>
          <Badge variant="outline" className="font-mono text-[11px]">
            {variant.sku}
          </Badge>
        </div>

        {variant.attributes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {variant.attributes.map((attr) => (
              <Badge key={attr.attributeSlug} variant="secondary" className="text-[10px] font-normal">
                {isAr ? attr.attributeNameAr : attr.attributeNameEn}: {isAr ? attr.valueAr : attr.valueEn}
              </Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-center">
          <div className="bg-background/80 p-1.5 rounded">
            <span className="text-muted-foreground block text-[10px]">{t('currentStock')}</span>
            <span className="font-bold text-sm">{currentStock}</span>
          </div>
          <div className="bg-background/80 p-1.5 rounded">
            <span className="text-muted-foreground block text-[10px]">{t('reservedStock')}</span>
            <span className="font-bold text-sm text-amber-600 dark:text-amber-400">{reservedQuantity}</span>
          </div>
          <div className="bg-background/80 p-1.5 rounded">
            <span className="text-muted-foreground block text-[10px]">{t('availableStock')}</span>
            <span className="font-bold text-sm text-primary">{variant.availableQuantity}</span>
          </div>
        </div>
      </div>

      {/* Quantity Change Input & Quick Buttons */}
      <div className="space-y-2">
        <Label htmlFor="qty-change" className="text-xs font-medium">
          {t('adjustmentModal.changeType')}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="qty-change"
            type="number"
            value={quantityChange}
            onChange={(e) => setQuantityChange(parseInt(e.target.value, 10) || 0)}
            className="text-xs font-mono font-bold h-9"
          />
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDelta(1)}
              className="text-xs h-9 px-2 text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              +1
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDelta(5)}
              className="text-xs h-9 px-2 text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              +5
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDelta(-1)}
              className="text-xs h-9 px-2 text-rose-600 hover:text-rose-700 font-semibold"
            >
              -1
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDelta(-5)}
              className="text-xs h-9 px-2 text-rose-600 hover:text-rose-700 font-semibold"
            >
              -5
            </Button>
          </div>
        </div>
      </div>

      {/* Resulting Stock Preview & Invariant Warnings */}
      <div className="p-3 rounded-lg border border-border bg-card space-y-1.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">{t('adjustmentModal.resultingStock')}</span>
          <span className={`font-mono font-bold text-sm ${isBelowZero ? 'text-destructive' : 'text-foreground'}`}>
            {currentStock} {quantityChange >= 0 ? `+ ${quantityChange}` : `- ${Math.abs(quantityChange)}`} = {newStock}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">{t('adjustmentModal.resultingAvailable')}</span>
          <span className={`font-mono font-bold text-sm ${isBelowReserved ? 'text-destructive' : 'text-primary'}`}>
            {newAvailable}
          </span>
        </div>

        {/* Invariant Warnings */}
        {isBelowZero && (
          <div className="flex items-center gap-1.5 text-destructive font-medium pt-1">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{t('adjustmentModal.errorBelowZero')}</span>
          </div>
        )}
        {isBelowReserved && !isBelowZero && (
          <div className="flex items-center gap-1.5 text-destructive font-medium pt-1">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{t('adjustmentModal.errorBelowReserved', { reserved: reservedQuantity })}</span>
          </div>
        )}
      </div>

      {/* Mandatory Reason */}
      <div className="space-y-2">
        <Label htmlFor="adj-reason" className="text-xs font-medium">
          {t('adjustmentModal.reason')} <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="adj-reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('adjustmentModal.reasonPlaceholder')}
          className="text-xs resize-none"
        />
      </div>

      {/* Form Action Buttons */}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-xs h-9"
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!isValid || mutation.isPending}
          className="text-xs h-9 gap-1.5"
        >
          {mutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : quantityChange >= 0 ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )}
          {t('adjustmentModal.submit')}
        </Button>
      </div>
    </form>
  );
}

export function StockAdjustmentDialog({
  variant,
  open,
  onOpenChange,
}: StockAdjustmentDialogProps) {
  if (!variant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <StockAdjustmentDialogBody
          variant={variant}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
