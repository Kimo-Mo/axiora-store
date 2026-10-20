import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { adminApi } from '@/services/admin/adminApi';
import type { AdminBrandDto } from '@/types/admin';
import { getApiErrorMessage } from '@/lib/api/error';
import { toast } from 'sonner';

export const ADMIN_BRANDS_QUERY_KEY = ['admin', 'brands'] as const;

export function useAdminBrandsQuery() {
  return useQuery<AdminBrandDto[]>({
    queryKey: ADMIN_BRANDS_QUERY_KEY,
    queryFn: () => adminApi.listBrands(),
    staleTime: 60 * 1000,
  });
}

export function useCreateBrandMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (payload: Parameters<typeof adminApi.createBrand>[0]) => adminApi.createBrand(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BRANDS_QUERY_KEY });
      toast.success(t('brandCreated'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('brandCreateFailed')));
    },
  });
}

export function useUpdateBrandMutation(brandId?: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (
      variables:
        | { id: string; payload: Parameters<typeof adminApi.updateBrand>[1] }
        | Parameters<typeof adminApi.updateBrand>[1]
    ) => {
      const targetId = typeof variables === 'object' && 'id' in variables ? variables.id : brandId;
      const targetPayload =
        typeof variables === 'object' && 'payload' in variables ? variables.payload : variables;
      if (!targetId) throw new Error('Brand ID is required');
      return adminApi.updateBrand(targetId, targetPayload as Parameters<typeof adminApi.updateBrand>[1]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BRANDS_QUERY_KEY });
      toast.success(t('brandUpdated'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('brandUpdateFailed')));
    },
  });
}

export function useDeleteBrandMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BRANDS_QUERY_KEY });
      toast.success(t('brandDeleted'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('brandDeleteFailed')));
    },
  });
}
