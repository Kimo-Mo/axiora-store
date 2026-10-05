import { useMutation, useQueryClient } from '@tanstack/react-query';
import { legacyCatalogService } from '@/services/legacyCatalog.service';
import { toast } from 'sonner';

export const useCreateTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => legacyCatalogService.adminAddTag({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
    },
  });
};

export const useDeleteTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => legacyCatalogService.adminDeleteTag(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
    },
    onError: () => {
      toast.error('Failed to delete tag.');
    },
  });
};
