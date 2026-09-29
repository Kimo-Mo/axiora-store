'use client';

import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPass } from './ForgotPass';
import Image from 'next/image';
import { VerifyOtp } from './VerifyOtp';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  currentState: AuthModalState;
  setCurrentState: (state: AuthModalState) => void;
}
export type AuthModalState =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'check your email'
  | 'verify-otp';

export const AuthModal = ({ open, onClose, currentState, setCurrentState }: AuthModalProps) => {
  const router = useRouter();
  const handleStateChange = (state: AuthModalState) => {
    setCurrentState(state);
  };

  const handleGoogleSignIn = () => {
    // Dynamically get the current origin to support both localhost and production
    const redirectUri = `${window.location.origin}/auth/callback/google`;
    router.push(
      `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?scope=openid%20email%20profile&response_type=id_token&client_id=214740263821-bn827npekbkep9ng8d2f8lt0qsla6j2q.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&nonce=1234&service=lso&o2v=2&flowName=GeneralOAuthFlow`
    );
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby="">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl capitalize">{currentState}</DialogTitle>
        </DialogHeader>
        <div className="no-scrollbar overflow-y-auto max-h-[calc(100vh-15rem)] space-y-4">
          {(currentState === 'login' || currentState === 'register') && (
            <>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={handleGoogleSignIn}>
                <Image src="/google-logo.png" alt="google-logo" width={20} height={20} />
                <p className="capitalize">{currentState} with Google</p>
              </Button>
              <div className="w-full h-px bg-border relative my-5">
                <span className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-card rounded-full size-8 flex items-center justify-center text-sm font-medium">
                  OR
                </span>
              </div>
            </>
          )}
          {currentState === 'login' && (
            <LoginForm setCurrentState={handleStateChange} onClose={onClose} />
          )}
          {currentState === 'register' && <RegisterForm onClose={onClose} setCurrentState={handleStateChange} />}
          {currentState === 'forgot-password' && <ForgotPass setCurrentState={handleStateChange} />}
          {currentState === 'check your email' && (
            <p className="font-semibold text-lg">
              We have sent you an email with a link to reset your password.
            </p>
          )}
        </div>
        {currentState === 'verify-otp' && (
          <VerifyOtp setCurrentState={handleStateChange} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
};
