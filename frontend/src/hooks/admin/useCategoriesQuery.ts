import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from './queryKeys';
import { legacyCatalogService } from '@/services/legacyCatalog.service';
import type { LegacyProductCategory } from '@/types/legacyCatalog';

export const useCategoriesQuery = () => {
  return useQuery<LegacyProductCategory[]>({
    queryKey: adminQueryKeys.categories(),
    queryFn: () => legacyCatalogService.adminCategoriesList(),
    staleTime: Infinity,
  });
};
