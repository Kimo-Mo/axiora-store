'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { useClearUser } from './useUser';
import { authService } from '@/services/auth.service';

/**
 * Shared sign-out hook (deduplicates logout lifecycle across shell and account pages).
 * Revokes session on server, evicts client cache, clears local storage, toasts, and redirects.
 */
export function useSignOut() {
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearUser = useClearUser();

  const signOut = async (redirectTo: string = '/') => {
    try {
      await authService.logout();
    } catch {
      // The server session may already be expired/revoked; local session must clear either way.
    } finally {
      clearUser();
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'auth',
      });
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('axiora-auth-storage');
      }
      toast.success(tAuth('signOut'));
      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  };

  return { signOut };
}