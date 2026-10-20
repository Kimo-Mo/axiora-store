import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/admin/adminApi';
import type { DashboardStatsDto } from '@/types/admin';

export const ADMIN_DASHBOARD_STATS_KEY = ['admin', 'dashboard', 'stats'] as const;

export function useAdminDashboardStatsQuery() {
  return useQuery<DashboardStatsDto>({
    queryKey: ADMIN_DASHBOARD_STATS_KEY,
    queryFn: () => adminApi.getDashboardStats(),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
}
