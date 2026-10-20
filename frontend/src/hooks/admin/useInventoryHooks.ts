import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { adminApi } from '@/services/admin/adminApi';
import type { InventoryAdjustmentDto, InventoryVariantDto, PaginatedResult } from '@/types/admin';
import { ADMIN_DASHBOARD_STATS_KEY } from './useAdminDashboardStatsQuery';
import { getApiErrorMessage } from '@/lib/api/error';
import { toast } from 'sonner';

export const ADMIN_INVENTORY_QUERY_KEY = ['admin', 'inventory'] as const;
export const ADMIN_INVENTORY_ADJUSTMENTS_QUERY_KEY = ['admin', 'inventory', 'adjustments'] as const;
export const ADMIN_LOW_STOCK_THRESHOLD_QUERY_KEY = ['admin', 'inventory', 'threshold'] as const;

export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  lowStockOnly?: boolean;
}

export interface AdjustmentsQueryParams {
  page?: number;
  limit?: number;
  variantId?: string;
}

export function useAdminInventoryQuery(params: InventoryQueryParams = {}) {
  return useQuery<PaginatedResult<InventoryVariantDto>>({
    queryKey: [...ADMIN_INVENTORY_QUERY_KEY, params],
    queryFn: () => adminApi.listInventory(params),
    staleTime: 30 * 1000,
  });
}

export function useStockAdjustmentMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (payload: { variantId: string; quantityChange: number; reason: string }) =>
      adminApi.adjustStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_INVENTORY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_INVENTORY_ADJUSTMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_STATS_KEY });
      toast.success(t('stockAdjusted'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('stockAdjustFailed')));
    },
  });
}

export function useInventoryAdjustmentsQuery(params: AdjustmentsQueryParams = {}, enabled = true) {
  return useQuery<PaginatedResult<InventoryAdjustmentDto>>({
    queryKey: [...ADMIN_INVENTORY_ADJUSTMENTS_QUERY_KEY, params],
    queryFn: () => adminApi.listInventoryAdjustments(params),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useLowStockThresholdQuery() {
  return useQuery<{ lowStockThreshold: number }>({
    queryKey: ADMIN_LOW_STOCK_THRESHOLD_QUERY_KEY,
    queryFn: () => adminApi.getLowStockThreshold(),
    staleTime: 60 * 1000,
  });
}

export function useUpdateLowStockThresholdMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin.toasts');

  return useMutation({
    mutationFn: (threshold: number) => adminApi.updateLowStockThreshold(threshold),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_LOW_STOCK_THRESHOLD_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_INVENTORY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_STATS_KEY });
      toast.success(t('thresholdUpdated'));
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, t('thresholdUpdateFailed')));
    },
  });
}
