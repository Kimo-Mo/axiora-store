import { useMutation, useQueryClient } from '@tanstack/react-query';
import { legacyCatalogService } from '@/services/legacyCatalog.service';
import { useCacheClear } from './useCacheClear';
import { toast } from 'sonner';

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  const cacheClear = useCacheClear();

  return useMutation({
    mutationFn: (slug: string) => legacyCatalogService.adminDeleteProduct(slug),
    onSuccess: async () => {
      await cacheClear();
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product deleted successfully.');
    },
    onError: () => {
      toast.error('Failed to delete product.');
    },
  });
};
