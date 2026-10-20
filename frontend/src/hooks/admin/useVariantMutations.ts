import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { adminApi } from '@/services/admin/adminApi';
import { ADMIN_PRODUCTS_QUERY_KEY } from './useProductMutations';
import { getApiErrorMessage } from '@/lib/api/error';
import { toast } from 'sonner';

export function useCreateVariantMutation(productId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (payload: Parameters<typeof adminApi.createVariant>[1]) =>
      adminApi.createVariant(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, 'detail', productId] });
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      toast.success(t('variantCreated'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('variantCreateFailed')));
    },
  });
}

export function useUpdateVariantMutation(productId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: ({
      variantId,
      payload,
    }: {
      variantId: string;
      payload: Parameters<typeof adminApi.updateVariant>[2];
    }) => adminApi.updateVariant(productId, variantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, 'detail', productId] });
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      toast.success(t('variantUpdated'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('variantUpdateFailed')));
    },
  });
}

export function useDeleteVariantMutation(productId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (variantId: string) => adminApi.deleteVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, 'detail', productId] });
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      toast.success(t('variantDeleted'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('variantDeleteFailed')));
    },
  });
}
