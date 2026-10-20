import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { adminApi, type PaginatedResult } from '@/services/admin/adminApi';
import type { AdminProductDetailDto, AdminProductListItemDto, SpecificationDto } from '@/types/admin';
import { ADMIN_DASHBOARD_STATS_KEY } from './useAdminDashboardStatsQuery';
import { getApiErrorMessage } from '@/lib/api/error';
import { toast } from 'sonner';

export const ADMIN_PRODUCTS_QUERY_KEY = ['admin', 'products'] as const;

export function useAdminProductsQuery(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
}) {
  return useQuery<PaginatedResult<AdminProductListItemDto>>({
    queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, params],
    queryFn: () => adminApi.listProducts(params),
    staleTime: 30 * 1000,
  });
}

export function useAdminProductQuery(id?: string) {
  return useQuery<AdminProductDetailDto>({
    queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, 'detail', id],
    queryFn: () => adminApi.getProduct(id!),
    enabled: Boolean(id),
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (payload: Parameters<typeof adminApi.createProduct>[0]) => adminApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_STATS_KEY });
      toast.success(t('productCreated'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('productCreateFailed')));
    },
  });
}

export function useUpdateProductMutation(productId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (payload: Parameters<typeof adminApi.updateProduct>[1]) =>
      adminApi.updateProduct(productId, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      queryClient.setQueryData([...ADMIN_PRODUCTS_QUERY_KEY, 'detail', productId], updated);
      toast.success(t('productUpdated'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('productUpdateFailed')));
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_STATS_KEY });
      toast.success(t('productDeleted'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('productDeleteFailed')));
    },
  });
}

export function useUpdateProductStatusMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.updateProductStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_STATS_KEY });
      toast.success(variables.isActive ? t('productActivated') : t('productArchived'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('productStatusUpdateFailed')));
    },
  });
}

export function useReplaceSpecificationsMutation(productId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (specifications: SpecificationDto[]) =>
      adminApi.replaceSpecifications(productId, specifications),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      queryClient.setQueryData([...ADMIN_PRODUCTS_QUERY_KEY, 'detail', productId], updated);
      toast.success(t('specificationsSaved'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('specificationsSaveFailed')));
    },
  });
}

export function useReorderProductImagesMutation(productId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (images: string[]) => adminApi.reorderProductImages(productId, images),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      queryClient.setQueryData([...ADMIN_PRODUCTS_QUERY_KEY, 'detail', productId], updated);
      toast.success(t('imageOrderUpdated'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('imageOrderUpdateFailed')));
    },
  });
}

export function useDeleteProductImageMutation(productId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (imageId: string) => adminApi.deleteProductImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, 'detail', productId] });
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      toast.success(t('imageRemoved'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('imageDeleteFailed')));
    },
  });
}
