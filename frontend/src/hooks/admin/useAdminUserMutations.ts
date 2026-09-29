import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { useCacheClear } from './useCacheClear';
import type { RoleEnum } from '@/types/admin/users';

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  const cacheClear = useCacheClear();

  return useMutation({
    mutationFn: (userId: string) => userService.adminDeleteUser(userId),
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
      userService.adminUpdateUserRole(userId, { role }),
    onSuccess: async (_, { userId }) => {
      await cacheClear();
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
    },
  });
}

export function useResetPasswordMutation() {
  const queryClient = useQueryClient();
  const cacheClear = useCacheClear();

  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword({ email }),
    onSuccess: async () => {
      await cacheClear();
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
