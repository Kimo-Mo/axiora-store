import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from './queryKeys';
import { catalogService } from '@/services/catalog.service';
import type { ProductCategory } from '@/types/catalog';

export const useCategoriesQuery = () => {
  return useQuery<ProductCategory[]>({
    queryKey: adminQueryKeys.categories(),
    queryFn: () => catalogService.adminCategoriesList(),
    staleTime: Infinity,
  });
};
