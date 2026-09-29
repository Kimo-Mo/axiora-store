'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LoginResponse } from '@/types';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isProcessing = useRef(false);

  useEffect(() => {
    // Prevent strict mode double-firing from attempting auth twice
    if (isProcessing.current) return;
    isProcessing.current = true;

    const handleCallback = async () => {
      try {
        // 1. Parse the hash fragment for id_token (e.g. #id_token=xyz...)
        const hashStr = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hashStr);

        // Check hash or standard query parameters
        const idToken = hashParams.get('id_token') || searchParams.get('id_token');

        if (!idToken) {
          toast.error('Google authentication failed: No token found.');
          router.replace('/?auth=login');
          return;
        }

        // 2. Send the id_token to our backend
        const response: LoginResponse = await authService.googleOauth2({ auth_token: idToken });

        // 3. Update the auth state
        const user = response?.data?.user || null;

        if (user) {
          // Manually set user role cookie to sync with backend session rules
          if (user.role && typeof document !== 'undefined') {
            document.cookie = `user_role=${user.role}; path=/; max-age=2592000; SameSite=Lax`;
          }

          setAuth(user);
          toast.success('Successfully logged in with Google!');
          router.replace('/');
        } else {
          throw new Error('Invalid user data received from server');
        }
      } catch (error: any) {
        console.error('Google OAuth error:', error);
        const errorMsg =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          'Failed to authenticate with Google. Please try again.';
        toast.error(errorMsg);
        router.replace('/?auth=login');
      }
    };

    handleCallback();
  }, [router, searchParams, setAuth]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background p-4 text-center">
      <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
      <h2 className="text-2xl font-semibold mb-2">Authenticating with Google...</h2>
      <p className="text-muted-foreground">Please wait while we complete your login.</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background p-4 text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait.</p>
        </div>
      }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
