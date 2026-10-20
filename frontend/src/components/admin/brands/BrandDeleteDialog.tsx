'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Trash2, Loader2 } from 'lucide-react';
import type { AdminBrandDto } from '@/types/admin';
import { useDeleteBrandMutation } from '@/hooks/admin/useBrandMutations';

interface BrandDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: AdminBrandDto | null;
  onDeleted?: () => void;
}

export function BrandDeleteDialog({
  open,
  onOpenChange,
  brand,
  onDeleted,
}: BrandDeleteDialogProps) {
  const t = useTranslations('admin.brands');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMutation = useDeleteBrandMutation();

  if (!brand) return null;

  const hasProducts = brand.productCount > 0;
  const brandName = isAr ? brand.nameAr : brand.nameEn;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(brand.id);
      onOpenChange(false);
      onDeleted?.();
    } catch {
      // handled by mutation error toast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t('delete.title', { defaultValue: 'Delete Brand' })}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {brandName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {hasProducts ? (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  {brand.productCount}{' '}
                  {t('delete.hasProductsTitle', {
                    defaultValue: 'products are assigned to this brand',
                  })}
                </span>
              </div>
              <p className="text-xs leading-relaxed">
                {t('delete.hasProductsDesc', {
                  defaultValue:
                    'Brands associated with products cannot be deleted. You must reassign or remove all assigned products before this brand can be deleted.',
                })}
              </p>
            </div>
          ) : (
            <p className="text-sm text-foreground">
              {t('delete.confirmEmpty', {
                defaultValue:
                  'Are you sure you want to permanently delete this brand? This action cannot be undone.',
              })}
            </p>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={hasProducts || isDeleting}
            onClick={handleDelete}
            className="gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.deleting', { defaultValue: 'Deleting...' })}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {t('common.delete', { defaultValue: 'Delete Brand' })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
