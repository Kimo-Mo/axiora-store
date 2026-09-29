import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, LoginRequest } from '@/types';
import { authService } from '@/services/auth.service';
import { AxiosError } from 'axios';
import { useCartStore } from '@/lib/stores/useCartStore';

// ── Cookie helpers ───────────────────────────────────────────────────────────
const setUserRoleCookie = (role: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `user_role=${role}; path=/; max-age=2592000; SameSite=Lax`;
};

const clearUserRoleCookie = () => {
  if (typeof document === 'undefined') return;
  document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // new
  _hasHydrated: boolean;

  // Actions
  setAuth: (user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setHasHydrated: (state: boolean) => void;

  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  validateSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setAuth: (user) => {
        set({ user, isAuthenticated: true, error: null });
      },

      setUser: (user) => {
        set({ user });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearAuth: () => {
        clearUserRoleCookie();
        set({ user: null, isAuthenticated: false, error: null });
      },

      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(data);
          const user = response?.data?.user ?? null;
          if (user?.role) setUserRoleCookie(user.role);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          let errorMessage = 'Login failed';

          if (err instanceof AxiosError && err.response?.data) {
            const data = err.response.data as { error?: string; message?: string; detail?: string };
            errorMessage = data.error || data.message || data.detail || errorMessage;
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw err;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // The backend endpoint is AllowAny — it clears HttpOnly cookies
          // and blacklists the refresh token regardless of access-token status.
          await authService.logout();
        } catch (err) {
          // Log unexpected errors only (network down, server 5xx, etc.)
          console.error('[logout] Server logout failed — cookies may not be cleared:', err);
        } finally {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('axiora-auth-storage');
          }
          useCartStore.getState().resetCartState();
          clearUserRoleCookie();
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
      },

      validateSession: async () => {
        // Don't validate until Zustand has finished rehydrating from localStorage.
        // Without this guard, a full-page load (e.g. redirect back from a payment
        // gateway) can race: isAuthenticated becomes true from persist, but user
        // is still null mid-hydration, causing clearAuth() to wipe the session.
        if (!get()._hasHydrated) return;

        // Only run if we think we're authenticated (state persisted from localStorage)
        if (!get().isAuthenticated) return;

        set({ isLoading: true, error: null });
        try {
          const user = get().user;
          if (user) {
            set({ user, isAuthenticated: true, isLoading: false, error: null });
          } else {
            // Response OK but no user — treat session as invalid
            get().clearAuth();
            set({ isLoading: false });
          }
        } catch (err: unknown) {
          // refreshToken failed (401/403/network) → session is dead
          if (
            err instanceof AxiosError &&
            (err.response?.status === 401 || err.response?.status === 403)
          ) {
            get().clearAuth();
          } else {
            // Network error or server error — keep existing auth state, don't log out
            console.warn('[validateSession] Non-auth error during refresh, keeping session:', err);
          }
          set({ isLoading: false, error: null });
        }
      },
    }),
    {
      name: 'axiora-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Track when rehydration from localStorage completes — mirrors useCartStore pattern.
      // Components that depend on auth state should check _hasHydrated before acting.
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);
