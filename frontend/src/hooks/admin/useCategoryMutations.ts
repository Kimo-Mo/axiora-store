import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { adminApi } from '@/services/admin/adminApi';
import type { AdminCategoryDto } from '@/types/admin';
import { getApiErrorMessage, getApiErrorCode } from '@/lib/api/error';
import { toast } from 'sonner';

export const ADMIN_CATEGORIES_QUERY_KEY = ['admin', 'categories'] as const;

export function useAdminCategoriesQuery() {
  return useQuery<AdminCategoryDto[]>({
    queryKey: ADMIN_CATEGORIES_QUERY_KEY,
    queryFn: () => adminApi.listCategories(),
    staleTime: 60 * 1000,
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (payload: Parameters<typeof adminApi.createCategory>[0]) => adminApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY });
      toast.success(t('categoryCreated'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('categoryCreateFailed')));
    },
  });
}

export function useUpdateCategoryMutation(categoryId?: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (
      variables:
        | { id: string; payload: Parameters<typeof adminApi.updateCategory>[1] }
        | Parameters<typeof adminApi.updateCategory>[1]
    ) => {
      const targetId = typeof variables === 'object' && 'id' in variables ? variables.id : categoryId;
      const targetPayload =
        typeof variables === 'object' && 'payload' in variables ? variables.payload : variables;
      if (!targetId) throw new Error('Category ID is required');
      return adminApi.updateCategory(targetId, targetPayload as Parameters<typeof adminApi.updateCategory>[1]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY });
      toast.success(t('categoryUpdated'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('categoryUpdateFailed')));
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY });
      toast.success(t('categoryDeleted'));
    },
    onError: (error: unknown) => {
      // Could be CATEGORY_HAS_PRODUCTS or CATEGORY_HAS_CHILDREN
      const code = getApiErrorCode(error);
      if (code === 'CATEGORY_HAS_PRODUCTS' || code === 'CATEGORY_HAS_CHILDREN') {
        // Handled by the dialog UI
        return;
      }
      toast.error(getApiErrorMessage(error, t('categoryDeleteFailed')));
    },
  });
}

export function useReassignCategoryProductsMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: ({ id, targetCategoryId }: { id: string; targetCategoryId: string }) =>
      adminApi.reassignCategoryProducts(id, targetCategoryId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY });
      toast.success(t('productsReassigned', { count: data.reassignedCount }));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('reassignProductsFailed')));
    },
  });
}
