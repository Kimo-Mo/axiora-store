import { Button, Input } from '@/components/ui';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AuthModalState } from './AuthModal';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/lib/stores/useCartStore';

export const LoginForm = ({
  setCurrentState,
  onClose,
}: {
  setCurrentState: (state: AuthModalState) => void;
  onClose: () => void;
  }) => {
  const t = useTranslations('auth');
  const tErrors = useTranslations('errors');

  // Schema lives in-component so validation messages resolve per locale.
  const loginSchema = z.object({
    email: z.string().email(tErrors('invalidEmail')),
    password: z.string().min(1, tErrors('required')),
  });

  const { syncWithServer } = useCartStore();
  const queryClient = useQueryClient();
  const { login, isLoading, error: storeError } = useAuthStore();
  const { refreshCartPrices } = useCartStore();
  const { handleSubmit, register } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [showPassword, setShowPassword] = useState(false);

  const submitForm = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login(data);
      queryClient.clear();
      await syncWithServer();
      await refreshCartPrices();
      onClose();
    } catch (error) {
      console.error('Login component error:', error);
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-4">
        {storeError && (
          <p className="text-destructive bg-destructive/10 px-4 py-2 rounded-2xl">{storeError}</p>
        )}
        <Input
          id="email"
          type="email"
          className="w-full h-10 px-4 border rounded-2xl"
          placeholder={t('emailPlaceholder')}
          {...register('email')}
        />
        <div className="w-full relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="w-full h-10 px-4 pe-10 border rounded-2xl"
            placeholder={t('passwordPlaceholder')}
            {...register('password')}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="absolute top-1/2 -translate-y-1/2 end-2"
            onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full p-2 rounded-2xl">
          {isLoading ? t('loggingIn') : t('signIn')}
        </Button>
        <p className="">
          <span
            onClick={() => setCurrentState('forgot-password')}
            className="cursor-pointer text-accent-foreground font-bold">
            {t('forgotPassword')}
          </span>
        </p>
      </form>
      <div className="border-t border-border pt-4">
        <p>
          {t('noAccount')}{' '}
          <span
            onClick={() => setCurrentState('register')}
            className="cursor-pointer text-accent-foreground font-bold">
            {t('signUp')}
          </span>
        </p>
      </div>
    </>
  );
};
