import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from './queryKeys';
import { catalogService } from '@/services/catalog.service';
import type { PaginatedResponse } from '@/types';
import type { Product } from '@/types/catalog';

export const useProductsQuery = ({ page, search, categoryId }: { page: number; search: string; categoryId: string }) => {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: adminQueryKeys.products({
      page,
      page_size: 10,
      search,
      filter: `product_type=digital,${categoryId !== 'all' ? `category=${categoryId}` : ''}`,
    }),
    queryFn: () =>
      catalogService.adminProductsList({
        page,
        page_size: 10,
        ...(search ? { search } : {}),
        filter: `product_type=digital,${categoryId !== 'all' ? `category=${categoryId}` : ''}`,
      }),
  });
};
