import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from './queryKeys';
import type { UserListParams, AdminUser } from '@/types/admin/users';
import { userService } from '@/services/user.service';

/**
 * The backend UserListView expects filters as a single comma-separated string:
 * filter=role=admin,is_active=true,is_verified=false
 * NOT as separate query params like role=admin&is_active=true
 */
function buildBackendParams(params: UserListParams): Record<string, unknown> {
  const { search, role, is_active, provider, is_verified, page, page_size } = params;

  const filterParts: string[] = [];
  if (role) filterParts.push(`role=${role}`);
  if (is_active !== undefined) filterParts.push(`is_active=${is_active}`);
  if (provider) filterParts.push(`provider=${provider}`);
  if (is_verified !== undefined) filterParts.push(`is_verified=${is_verified}`);

  return {
    ...(search ? { search } : {}),
    ...(filterParts.length > 0 ? { filter: filterParts.join(',') } : {}),
    ...(page ? { page } : {}),
    ...(page_size ? { page_size } : {}),
  };
}

export function useAdminUsersQuery(params: UserListParams) {
  return useQuery({
    queryKey: adminQueryKeys.users(params),
    queryFn: async () => {
      const backendParams = buildBackendParams(params);
      const data = await userService.adminUsersList(backendParams as UserListParams);
      // axios interceptor already unwraps { status, message, data: <payload> }
      return data as {
        count: number;
        total_pages: number;
        current_page: number;
        page_size: number;
        next: string | null;
        previous: string | null;
        results: AdminUser[];
      };
    },
  });
}
