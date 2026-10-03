'use client';

import axios from 'axios';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { setSessionEndedHandler } from '@/lib/api/axios';
import { authService } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth';

/**
 * The session lives in HttpOnly cookies, so the only way to learn who is signed in
 * is to ask the server. This query is the single client-side cache for that answer
 * (constitution Principle VI: TanStack Query owns server state).
 *
 * `staleTime` matches the 15-minute access-token lifetime: once the token is due
 * for renewal the data is due to be refetched too, so the two never drift.
 */
export const ACCESS_TTL_MINUTES = 15;

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function useUser() {
  return useQuery<AuthUser | null>({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        return await authService.getMe();
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
          return null;
        }
        throw err;
      }
    },
    // A signed-out visitor gets a 401, which is a normal answer rather than a
    // failure — it must not surface as an error state in the UI.
    retry: false,
    staleTime: ACCESS_TTL_MINUTES * 60 * 1000,
  });
}

/**
 * Seed or drop the cache directly.
 *
 * Registration and sign-in already have the user in hand from the response, so
 * writing it into the cache avoids a redundant round trip and avoids the flash of
 * "signed out" state that a refetch would produce.
 */
export function useSetUser() {
  const queryClient = useQueryClient();
  return (user: AuthUser) => queryClient.setQueryData(authKeys.me, user);
}

export function useClearUser() {
  const queryClient = useQueryClient();
  return () => queryClient.setQueryData(authKeys.me, null);
}

/**
 * Bridge the axios layer's "the session is definitively over" signal into the
 * query cache, so a renewal refused at the network layer clears the UI without the
 * interceptor needing to know anything about React or TanStack Query.
 */
export function useSessionEndedBridge(): void {
  const queryClient: QueryClient = useQueryClient();
  useEffect(() => {
    setSessionEndedHandler(() => {
      queryClient.setQueryData(authKeys.me, null);
    });
    return () => setSessionEndedHandler(null);
  }, [queryClient]);
}
