import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { useCacheClear } from './useCacheClear';
import { toast } from 'sonner';

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  const cacheClear = useCacheClear();

  return useMutation({
    mutationFn: ({ slug, formData }: { slug: string; formData: FormData }) => dashboardService.adminUpdateProductFull(slug, formData),
    onSuccess: async (_, { slug }) => {
      await cacheClear();
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', slug] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'codes', slug] });
      toast.success('Product updated successfully!');
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { errors?: Record<string, unknown>; message?: string } } };
      const errors = errorObj?.response?.data?.errors;
      let fieldErrors = '';
      if (errors) {
        const entries = Object.entries(errors).slice(0, 4);
        fieldErrors = entries.map(([field, msgs]) => {
          const msg = Array.isArray(msgs) ? msgs[0] : msgs;
          return `${field}: ${msg}`;
        }).join(', ');
      }
      toast.error(fieldErrors || errorObj?.response?.data?.message || 'Failed to update product.');
    },
  });
};
