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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, ArrowRightLeft, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import type { AdminCategoryDto } from '@/types/admin';
import {
  useDeleteCategoryMutation,
  useReassignCategoryProductsMutation,
} from '@/hooks/admin/useCategoryMutations';
import { toast } from 'sonner';

interface CategoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: AdminCategoryDto | null;
  allCategories: AdminCategoryDto[];
  onDeleted?: () => void;
}

export function CategoryDeleteDialog({
  open,
  onOpenChange,
  category,
  allCategories,
  onDeleted,
}: CategoryDeleteDialogProps) {
  const t = useTranslations('admin.categories');
  const tToasts = useTranslations('admin.toasts');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [targetCategoryId, setTargetCategoryId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const deleteMutation = useDeleteCategoryMutation();
  const reassignMutation = useReassignCategoryProductsMutation();

  if (!category) return null;

  const hasProducts = category.productCount > 0;
  const hasChildren = Boolean(category.children && category.children.length > 0);

  // Flatten categories to find candidates for reassignment (exclude this category)
  const flattenEligible = (cats: AdminCategoryDto[], result: AdminCategoryDto[] = []) => {
    for (const c of cats) {
      if (c.id !== category.id) {
        result.push(c);
        if (c.children) flattenEligible(c.children, result);
      }
    }
    return result;
  };

  const eligibleTargets = flattenEligible(allCategories);

  const handleDeleteDirect = async () => {
    setIsProcessing(true);
    try {
      await deleteMutation.mutateAsync(category.id);
      onOpenChange(false);
      onDeleted?.();
    } catch {
      // error handled by mutation
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReassignAndDelete = async () => {
    if (!targetCategoryId) {
      toast.error(tToasts('selectTargetCategory'));
      return;
    }

    setIsProcessing(true);
    try {
      // Step 1: Reassign all products
      await reassignMutation.mutateAsync({
        id: category.id,
        targetCategoryId,
      });

      // Step 2: Delete category
      await deleteMutation.mutateAsync(category.id);

      toast.success(
        t('dialog.reassignSuccess', {
          defaultValue: 'Products reassigned and category deleted successfully',
        })
      );
      onOpenChange(false);
      onDeleted?.();
    } catch {
      // error handled by mutations
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t('delete.title', { defaultValue: 'Delete Category' })}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isAr ? category.nameAr : category.nameEn} ({isAr ? category.nameEn : category.nameAr})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {hasChildren ? (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {t('delete.blockedChildrenTitle', {
                    defaultValue: 'Category contains subcategories',
                  })}
                </span>
              </div>
              <p className="text-xs leading-relaxed">
                {t('delete.blockedChildrenDesc', {
                  defaultValue:
                    'This category has active subcategories. You must reassign or delete its child categories before deleting this category.',
                })}
              </p>
            </div>
          ) : hasProducts ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    {category.productCount}{' '}
                    {t('delete.hasProductsTitle', {
                      defaultValue: 'products are assigned to this category',
                    })}
                  </span>
                </div>
                <p className="text-xs leading-relaxed">
                  {t('delete.hasProductsDesc', {
                    defaultValue:
                      'Categories with products cannot be deleted directly. Reassign all products to another category to proceed.',
                  })}
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label htmlFor="reassign-target" className="text-xs font-medium">
                  {t('delete.selectTarget', { defaultValue: 'Reassign products to:' })} *
                </Label>
                <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
                  <SelectTrigger id="reassign-target">
                    <SelectValue placeholder={t('delete.selectTargetPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleTargets.map((target) => (
                      <SelectItem key={target.id} value={target.id}>
                        {isAr ? target.nameAr : target.nameEn}{' '}
                        {t('delete.targetProductCount', { count: target.productCount })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground">
              {t('delete.confirmEmpty', {
                defaultValue:
                  'Are you sure you want to permanently delete this category? This action cannot be undone.',
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
            disabled={isProcessing}
          >
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </Button>

          {hasChildren ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              className="opacity-50"
            >
              {t('delete.cannotDelete', { defaultValue: 'Cannot Delete' })}
            </Button>
          ) : hasProducts ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={!targetCategoryId || isProcessing}
              onClick={handleReassignAndDelete}
              className="gap-1.5"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('delete.reassigning', { defaultValue: 'Reassigning...' })}
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4" />
                  {t('delete.reassignAndDelete', { defaultValue: 'Reassign & Delete' })}
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isProcessing}
              onClick={handleDeleteDirect}
              className="gap-1.5"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('common.deleting', { defaultValue: 'Deleting...' })}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {t('common.delete', { defaultValue: 'Delete Category' })}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
