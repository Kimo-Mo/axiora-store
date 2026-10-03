'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useTranslations } from 'next-intl';

export type AuthModalState = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  currentState: AuthModalState;
  setCurrentState: (state: AuthModalState) => void;
}

/**
 * Sign-in and registration only.
 *
 * The Google sign-in button, the email-code verification step, and the
 * forgot-password panel were all removed with the Django backend they depended on
 * (FR-030). Password recovery by email is a documented MVP non-goal, and there is
 * no mail provider configured to deliver a code or a reset link.
 */
export const AuthModal = ({ open, onClose, currentState, setCurrentState }: AuthModalProps) => {
  const t = useTranslations('auth');

  const titles: Record<AuthModalState, string> = {
    login: t('titleLogin'),
    register: t('titleRegister'),
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby="">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl capitalize">{titles[currentState]}</DialogTitle>
        </DialogHeader>
        <div className="no-scrollbar overflow-y-auto max-h-[calc(100vh-15rem)] space-y-4">
          {currentState === 'login' && <LoginForm setCurrentState={setCurrentState} onClose={onClose} />}
          {currentState === 'register' && (
            <RegisterForm onClose={onClose} setCurrentState={setCurrentState} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
