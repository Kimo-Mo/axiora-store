'use client';

import { Button, Input } from '@/components/ui';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import type { AuthModalState } from './AuthModal';
import { authService } from '@/services/auth.service';
import { authKeys } from '@/hooks/useUser';
import type { ApiErrorBody, AuthErrorCode } from '@/types/auth';

export const RegisterForm = ({
  setCurrentState,
  onClose,
}: {
  setCurrentState: (state: AuthModalState) => void;
  onClose: () => void;
}) => {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const tFooter = useTranslations('footer');
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Mirrors the backend policy so the customer is told before submitting. The
  // backend revalidates regardless — this is convenience, never the control.
  const registerSchema = z
    .object({
      username: z.string().min(3, t('usernameTooShort')),
      fullName: z.string().min(2, tErrors('required')),
      email: z.string().email(tErrors('invalidEmail')),
      password: z.string().min(8, tErrors('passwordTooShort')),
      confirmPassword: z.string().min(8, tErrors('passwordTooShort')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordsMismatch'),
      path: ['confirmPassword'],
    })
    .refine((data) => /^(?=.*[A-Za-z])(?=.*\d)[\x21-\x7e]{8,72}$/.test(data.password), {
      message: t('passwordWeak'),
      path: ['password'],
    });

  type Fields = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Fields>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submitForm = async (data: Fields) => {
    setServerError('');
    setIsLoading(true);
    try {
      const user = await authService.register({
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      // Registration signs the customer in — no second sign-in step (FR-003).
      // Guest cart contents are deliberately left alone: discarding them here
      // would silently empty a basket the customer just filled (FR-033).
      queryClient.setQueryData(authKeys.me, user);
      onClose();

      // Return the visitor to whatever they were trying to reach (FR-031).
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        router.push(returnTo);
      }
    } catch (error) {
      const body = (error as { response?: { data?: ApiErrorBody } })?.response?.data;
      const code = body?.error?.code;

      if (code === ('CONFLICT' satisfies AuthErrorCode)) {
        // The backend names the field that collided, so the customer knows which
        // one to change instead of being told "registration failed".
        const details = body?.error?.details as Record<string, string | string[]> | undefined;
        (['email', 'username'] as const).forEach((field) => {
          const message = details?.[field];
          if (message) setError(field, { type: 'server', message: Array.isArray(message) ? message[0] : message });
        });
      } else if (code === ('VALIDATION_ERROR' satisfies AuthErrorCode)) {
        setServerError(tErrors('checkInput'));
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
            id="fullName"
            type="text"
            autoComplete="name"
            className="w-full h-10 px-4 border rounded-2xl"
            placeholder={t('namePlaceholder')}
            aria-invalid={!!errors.fullName}
            {...register('fullName')}
          />
          {errors.fullName && <p className="text-destructive text-sm">{errors.fullName.message}</p>}
        </div>

        <div>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            className="w-full h-10 px-4 border rounded-2xl"
            placeholder={t('usernamePlaceholder')}
            aria-invalid={!!errors.username}
            {...register('username')}
          />
          {errors.username && <p className="text-destructive text-sm">{errors.username.message}</p>}
        </div>

        <div>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full h-10 px-4 border rounded-2xl"
            placeholder={t('emailPlaceholder')}
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <div className="w-full relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="w-full h-10 px-4 pe-10 border rounded-2xl"
              placeholder={t('passwordPlaceholder')}
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="absolute top-1/2 -translate-y-1/2 inset-e-2"
              onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
        </div>

        <div>
          <div className="w-full relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              className="w-full h-10 px-4 pe-10 border rounded-2xl"
              placeholder={t('confirmPasswordPlaceholder')}
              aria-invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="absolute top-1/2 -translate-y-1/2 inset-e-2"
              onClick={() => setShowConfirm((v) => !v)}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full p-2 rounded-2xl">
          {isLoading ? t('registering') : t('signUp')}
        </Button>
      </form>

      <p className="text-sm">
        {t('agreePrefix')}{' '}
        <Link href="/legal?tab=terms" className="text-accent-foreground font-bold" onClick={onClose}>
          {tFooter('terms')}
        </Link>{' '}
        {t('andAcknowledge')}{' '}
        <Link href="/legal?tab=privacy" className="text-accent-foreground font-bold" onClick={onClose}>
          {tFooter('privacy')}
        </Link>{' '}
        {t('appliesToYou')}
      </p>

      <div className="border-t border-border pt-4">
        <p>
          {t('hasAccount')}{' '}
          <button
            type="button"
            onClick={() => setCurrentState('login')}
            className="cursor-pointer text-accent-foreground font-bold">
            {t('signIn')}
          </button>
        </p>
      </div>
    </>
  );
};
