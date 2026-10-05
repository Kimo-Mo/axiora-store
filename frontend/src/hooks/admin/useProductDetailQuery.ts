import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from './queryKeys';
import { legacyCatalogService } from '@/services/legacyCatalog.service';
import type { LegacyProduct } from '@/types/legacyCatalog';

export const useProductDetailQuery = (slug: string) => {
  return useQuery<LegacyProduct>({
    queryKey: adminQueryKeys.product(slug),
    queryFn: () => legacyCatalogService.adminGetProduct(slug),
    enabled: !!slug,
  });
};
