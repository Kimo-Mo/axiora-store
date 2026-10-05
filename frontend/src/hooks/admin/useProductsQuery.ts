import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from './queryKeys';
import { legacyCatalogService } from '@/services/legacyCatalog.service';
import type { PaginatedResponse } from '@/types';
import type { LegacyProduct } from '@/types/legacyCatalog';

export const useProductsQuery = ({ page, search, categoryId }: { page: number; search: string; categoryId: string }) => {
  return useQuery<PaginatedResponse<LegacyProduct>>({
    queryKey: adminQueryKeys.products({
      page,
      page_size: 10,
      search,
      filter: `product_type=digital,${categoryId !== 'all' ? `category=${categoryId}` : ''}`,
    }),
    queryFn: () =>
      legacyCatalogService.adminProductsList({
        page,
        page_size: 10,
        ...(search ? { search } : {}),
        filter: `product_type=digital,${categoryId !== 'all' ? `category=${categoryId}` : ''}`,
      }),
  });
};
