import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { useCacheClear } from './useCacheClear';
import type { RoleEnum } from '@/types/admin/users';

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  const cacheClear = useCacheClear();

  return useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: async () => {
      await cacheClear();
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useRoleChangeMutation() {
  const queryClient = useQueryClient();
  const cacheClear = useCacheClear();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: RoleEnum }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: async (_, { userId }) => {
      await cacheClear();
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
    },
  });
}

/**
 * Staff-initiated reset, keyed on the user id rather than an email address. An
 * administrator is setting a known account's password, not mailing a recovery
 * link, so this needs no mail provider and is not the retired self-service flow.
 */
export function useResetPasswordMutation() {
  const queryClient = useQueryClient();
  const cacheClear = useCacheClear();

  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      adminService.resetUserPassword(userId, newPassword),
    onSuccess: async () => {
      await cacheClear();
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
