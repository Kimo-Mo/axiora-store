'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Check, Loader2, Settings2 } from 'lucide-react';
import {
  useLowStockThresholdQuery,
  useUpdateLowStockThresholdMutation,
} from '@/hooks/admin/useInventoryHooks';

export function LowStockThresholdPopover() {
  const t = useTranslations('admin.inventory');
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useLowStockThresholdQuery();
  const updateMutation = useUpdateLowStockThresholdMutation();

  const currentThreshold = data?.lowStockThreshold ?? 5;
  const [thresholdInput, setThresholdInput] = useState<number | ''>(currentThreshold);

  // Sync input when popover opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setThresholdInput(currentThreshold);
    }
    setOpen(isOpen);
  };

  const handleSave = () => {
    const val = typeof thresholdInput === 'number' ? thresholdInput : parseInt(String(thresholdInput), 10);
    if (isNaN(val) || val < 0) return;

    updateMutation.mutate(val, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs h-9">
          <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{t('threshold')}:</span>
          <span className="font-semibold text-primary">
            {isLoading ? '...' : `${currentThreshold} ${t('units')}`}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-4 space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            {t('threshold')}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="threshold-input" className="text-xs">
            {t('threshold')} ({t('units')})
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="threshold-input"
              type="number"
              min="0"
              max="1000"
              value={thresholdInput}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                setThresholdInput(val);
              }}
              className="text-xs h-9"
            />
            <span className="text-xs text-muted-foreground">{t('units')}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="text-xs h-8"
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={
              updateMutation.isPending ||
              thresholdInput === '' ||
              thresholdInput < 0 ||
              thresholdInput === currentThreshold
            }
            onClick={handleSave}
            className="text-xs h-8 gap-1.5"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {t('saveThreshold')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
