import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from './queryKeys';
import type { UserProfileResponse } from '@/types/admin/users';
import { userService } from '@/services/user.service';

export function useAdminUserProfileQuery(userId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.user(userId ?? ''),
    queryFn: async () => {
      const data = await userService.getUserProfile(userId!);
      return data as UserProfileResponse;
    },
    enabled: !!userId,
  });
}
