'use client';

import { Button, Input } from '@/components/ui';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import type { AuthModalState } from './AuthModal';
import { authService } from '@/services/auth.service';
import { authKeys } from '@/hooks/useUser';
import type { ApiErrorBody, AuthErrorCode } from '@/types/auth';

export const LoginForm = ({
  setCurrentState,
  onClose,
}: {
  setCurrentState: (state: AuthModalState) => void;
  onClose: () => void;
}) => {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Schema lives in-component so validation messages resolve per locale.
  const loginSchema = z.object({
    email: z.string().email(tErrors('invalidEmail')),
    password: z.string().min(1, tErrors('required')),
  });

  const { handleSubmit, register } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const submitForm = async (data: z.infer<typeof loginSchema>) => {
    setServerError('');
    setIsLoading(true);
    try {
      const user = await authService.login(data);
      // Seed the cache from the response rather than refetching: the user is
      // already in hand, and a refetch would flash a signed-out state first.
      queryClient.setQueryData(authKeys.me, user);
      onClose();

      // Return the visitor to whatever they were trying to reach.
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        router.push(returnTo);
      }
    } catch (error) {
      const code = (error as { response?: { data?: ApiErrorBody } })?.response?.data?.error?.code;
      if (code === ('VALIDATION_ERROR' satisfies AuthErrorCode)) {
        setServerError(tErrors('checkInput'));
      } else if (code === ('UNAUTHORIZED' satisfies AuthErrorCode)) {
        // The backend returns one identical message for an unknown email and for a
        // wrong password, so this text must not imply which one it was.
        setServerError(t('invalidCredentials'));
      } else if (code === ('RATE_LIMITED' satisfies AuthErrorCode)) {
        setServerError(t('tooManyAttempts'));
      } else {
        setServerError(tErrors('tryAgainLater'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-4">
        {serverError && (
          <p role="alert" className="text-destructive bg-destructive/10 px-4 py-2 rounded-2xl">
            {serverError}
          </p>
        )}
        <div>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full h-10 px-4 border rounded-2xl"
            placeholder={t('emailPlaceholder')}
            aria-invalid={false}
            {...register('email')}
          />
        </div>
        <div className="w-full relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="w-full h-10 px-4 pe-10 border rounded-2xl"
            placeholder={t('passwordPlaceholder')}
            {...register('password')}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="absolute top-1/2 -translate-y-1/2 inset-e-2"
            onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full p-2 rounded-2xl">
          {isLoading ? t('loggingIn') : t('signIn')}
        </Button>
      </form>
      <div className="border-t border-border pt-4">
        <p>
          {t('noAccount')}{' '}
          <button
            type="button"
            onClick={() => setCurrentState('register')}
            className="cursor-pointer text-accent-foreground font-bold">
            {t('signUp')}
          </button>
        </p>
      </div>
    </>
  );
};
