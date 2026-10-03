import { create } from 'zustand';

/**
 * Auth UI state only.
 *
 * The signed-in user and role are *not* held here. They are server state, owned by
 * TanStack Query via `useUser()`, and duplicating them into a persisted store is
 * exactly the duplication constitution Principle VI forbids — it is also how the
 * previous implementation ended up disagreeing with the server about whether a
 * session was alive.
 */
interface AuthUiState {
  /** Whether the sign-in / register panel is open. */
  isAuthModalOpen: boolean;
  /** Which panel the modal is showing. */
  modalView: 'login' | 'register';
  /** Where to return after a successful sign-in. */
  returnTo: string | null;

  openAuthModal: (view?: 'login' | 'register', returnTo?: string | null) => void;
  closeAuthModal: () => void;
  setModalView: (view: 'login' | 'register') => void;
}

export const useAuthStore = create<AuthUiState>()((set) => ({
  isAuthModalOpen: false,
  modalView: 'login',
  returnTo: null,

  openAuthModal: (view = 'login', returnTo = null) =>
    set({ isAuthModalOpen: true, modalView: view, returnTo }),

  closeAuthModal: () => set({ isAuthModalOpen: false }),

  setModalView: (modalView) => set({ modalView }),
}));
