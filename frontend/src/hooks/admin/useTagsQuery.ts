import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from './queryKeys';
import { catalogService } from '@/services/catalog.service';
import type { ProductTag } from '@/types/catalog';

export const useTagsQuery = () => {
  return useQuery<ProductTag[]>({
    queryKey: adminQueryKeys.tags(),
    queryFn: async (): Promise<ProductTag[]> => {
      const data = await catalogService.adminTagsList();
      if (data && Array.isArray(data.results)) {
        return data.results;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
