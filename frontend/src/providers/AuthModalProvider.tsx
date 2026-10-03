'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { AuthModal, AuthModalState } from '@/components/layout';
import { useClearUser } from '@/hooks/useUser';

interface AuthModalContextType {
  isOpen: boolean;
  currentState: AuthModalState;
  openModal: (state?: AuthModalState) => void;
  closeModal: () => void;
  setCurrentState: (state: AuthModalState) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentState, setCurrentState] = useState<AuthModalState>('login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearUser = useClearUser();

  const openModal = (state: AuthModalState = 'login') => {
    setCurrentState(state);
    setIsOpen(true);
  };

  // Open modal when the proxy redirects with ?auth=login. The guard also sets
  // ?returnTo so the customer lands back where they were heading after signing in.
  useEffect(() => {
    const authParam = searchParams.get('auth');
    if (authParam === 'login') {
      setTimeout(() => {
        // The session is definitively over, so the cached user is dropped.
        clearUser();
        openModal('login');

        const params = new URLSearchParams(searchParams.toString());
        params.delete('auth');
        const newUrl = params.size > 0 ? `/?${params}` : '/';
        router.replace(newUrl);
      }, 0);
    }
  }, [searchParams, router, clearUser]);

  // Listen for open-auth-modal event dispatched by axios interceptor on token expiry
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ state?: AuthModalState }>).detail;
      openModal(detail?.state ?? 'login');
    };
    window.addEventListener('open-auth-modal', handler);
    return () => window.removeEventListener('open-auth-modal', handler);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider
      value={{ isOpen, currentState, openModal, closeModal, setCurrentState }}>
      {children}
      <AuthModal
        open={isOpen}
        onClose={closeModal}
        currentState={currentState}
        setCurrentState={setCurrentState}
      />
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
