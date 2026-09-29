import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { useCacheClear } from './useCacheClear';
import { toast } from 'sonner';

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  const cacheClear = useCacheClear();

  return useMutation({
    mutationFn: (formData: FormData) => dashboardService.adminCreateProductFull(formData),
    onSuccess: async () => {
      await cacheClear();
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product created successfully!');
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
      toast.error(fieldErrors || errorObj?.response?.data?.message || 'Failed to create product.');
    },
  });
};
