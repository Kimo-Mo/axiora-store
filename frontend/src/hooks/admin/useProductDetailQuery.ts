import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from './queryKeys';
import { catalogService } from '@/services/catalog.service';
import type { Product } from '@/types';

export const useProductDetailQuery = (slug: string) => {
  return useQuery<Product>({
    queryKey: adminQueryKeys.product(slug),
    queryFn: () => catalogService.adminGetProduct(slug),
    enabled: !!slug,
  });
};
