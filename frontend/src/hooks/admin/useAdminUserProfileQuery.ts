import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from './queryKeys';
import type { UserProfileResponse } from '@/types/admin/users';
import { adminService } from '@/services/admin.service';

export function useAdminUserProfileQuery(userId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.user(userId ?? ''),
    queryFn: async () => {
      const data = await adminService.getUser(userId!);
      return data as UserProfileResponse;
    },
    enabled: !!userId,
  });
}
