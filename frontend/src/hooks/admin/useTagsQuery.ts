import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from './queryKeys';
import { legacyCatalogService } from '@/services/legacyCatalog.service';
import type { LegacyProductTag } from '@/types/legacyCatalog';

export const useTagsQuery = () => {
  return useQuery<LegacyProductTag[]>({
    queryKey: adminQueryKeys.tags(),
    queryFn: async (): Promise<LegacyProductTag[]> => {
      // The retired endpoint answered with either a bare array or `{ results }`
      // depending on the view; accept both so the admin screen keeps rendering.
      const data = await legacyCatalogService.adminTagsList();
      if (Array.isArray(data)) return data;
      return Array.isArray(data.results) ? data.results : [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
