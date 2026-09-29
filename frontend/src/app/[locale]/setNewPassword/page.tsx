'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/services/auth.service';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { AxiosError } from 'axios';

const setNewPasswordSchema = z
  .object({
    new_password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirm_password: z.string().min(6, 'Password must be at least 6 characters long'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type SetNewPasswordValues = z.infer<typeof setNewPasswordSchema>;

function SetNewPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uidb64 = searchParams.get('uidb64');
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetNewPasswordValues>({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  });

  useEffect(() => {
    if (!uidb64 || !token) {
      toast.error('Invalid or missing reset link');
      router.push('/');
      return;
    }

    const validateToken = async () => {
      setIsValidating(false);
      try {
        await authService.validateResetToken(uidb64, token);
      } catch (error) {
        console.error(error);
        toast.error('This reset link is invalid or has expired');
        router.push('/');
      }
    };

    validateToken();
  }, [uidb64, token, router]);

  const onSubmit = async (data: SetNewPasswordValues) => {
    if (!uidb64 || !token) return;

    setIsLoading(true);
    try {
      await authService.confirmResetPassword(uidb64, token, data);
      toast.success('Password reset successfully!');
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error: unknown) {
      console.error(error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">
          Validating your reset link...
        </p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-md w-full mx-auto mt-20 p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-success/20 blur-3xl rounded-full" />
          <CheckCircle2 className="size-20 text-success mx-auto relative" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-linear-to-r from-success to-success/50 bg-clip-text text-transparent">
            Success!
          </h1>
          <p className="text-muted-foreground text-lg">
            Your password has been successfully reset.
          </p>
        </div>
        <div className="pt-4 space-y-4">
          <p className="text-sm text-foreground/60">
            You will be redirected to the sign in page in a few seconds...
          </p>
          <Button
            onClick={() => router.push('/')}
            className="w-full h-12 rounded-2xl shadow-lg shadow-success/20">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full mx-auto py-16 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="p-0 border-border/50 shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border">
        <CardHeader className="space-y-2 pb-10 text-center bg-linear-to-b from-primary/10 via-primary/5 to-transparent pt-10">
          <div className="bg-primary/15 size-16 rounded-2xl flex items-center justify-center mx-auto mb-2 ring-1 ring-primary/20">
            <CheckCircle2 className="size-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">New Password</CardTitle>
          <p className="text-muted-foreground text-sm max-w-60 mx-auto">
            Choose a secure password for your Axiora Store account.
          </p>
        </CardHeader>
        <CardContent className="px-8 flex flex-col gap-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <div className="relative group">
                <Input
                  id="new_password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  className="rounded-2xl h-14 pe-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all text-lg ps-5"
                  {...register('new_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.new_password && (
                <p className="text-destructive text-sm font-medium px-4">
                  {errors.new_password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className="rounded-2xl h-14 pe-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all text-lg ps-5"
                  {...register('confirm_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-destructive text-sm font-medium px-4">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 mt-4 border-none group active:scale-[0.98]">
              {isLoading ? (
                <>
                  <Loader2 className="me-2 h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Set New Password'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/40 py-6 bg-muted/20">
          <p className="text-sm text-muted-foreground font-medium">
            Remembered your password?{' '}
            <button
              onClick={() => router.push('/')}
              className="text-primary font-bold hover:text-primary/80 transition-colors ms-1">
              Sign In
            </button>
          </p>
        </CardFooter>
      </Card>

      <p className="text-center mt-8 text-xs text-muted-foreground max-w-70 mx-auto leading-relaxed">
        By resetting your password, you agree to our security policies and Terms of Service.
      </p>
    </div>
  );
}

export default function SetNewPasswordPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background flex items-center justify-center">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-medium">
              Preparing secure environment...
            </p>
          </div>
        }>
        <SetNewPasswordContent />
      </Suspense>
    </div>
  );
}
