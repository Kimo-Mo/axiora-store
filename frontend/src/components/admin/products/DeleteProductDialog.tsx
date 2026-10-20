'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface DeleteProductTarget {
  id: string;
  nameAr: string;
  nameEn: string;
}

interface DeleteProductDialogProps {
  product: DeleteProductTarget | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  deleting?: boolean;
  onConfirm?: () => void;
  onDeleted?: () => void;
}

export function DeleteProductDialog({
  product,
  open,
  onOpenChange,
  onClose,
  deleting = false,
  onConfirm,
  onDeleted,
}: DeleteProductDialogProps) {
  const locale = useLocale();
  const t = useTranslations('admin.products');

  const isOpen = open !== undefined ? open : Boolean(product);
  const productName = product ? (locale === 'ar' ? product.nameAr : product.nameEn) : '';

  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const handleConfirmAction = async () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onDeleted) {
      onDeleted();
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(isOpenState) => {
        if (!isOpenState) handleClose();
      }}
    >
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            {t('deleteTitle', { defaultValue: 'Delete Product' })}: {productName}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {t('deleteConfirm', {
              defaultValue:
                'Are you sure you want to permanently delete this product? This action cannot be undone.',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border" disabled={deleting} onClick={handleClose}>
            {t('cancel', { defaultValue: 'Cancel' })}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirmAction();
            }}
            disabled={deleting}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {deleting ? t('deleting') : t('deleteTitle', { defaultValue: 'Delete Product' })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
