import { Button, Input } from '@/components/ui';
import type { AuthModalState } from './AuthModal';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/auth.service';

const forgotPassSchema = z.object({
  email: z.string().email(),
});

export const ForgotPass = ({
  setCurrentState,
}: {
  setCurrentState: (state: AuthModalState) => void;
}) => {
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof forgotPassSchema>>({
    resolver: zodResolver(forgotPassSchema),
    defaultValues: {
      email: '',
    },
  });
  const submitForm = async (data: z.infer<typeof forgotPassSchema>) => {
    try {
      setLoading(true);
      await authService.forgotPassword({ ...data });
      setCurrentState('check your email');
    } catch (error) {
      console.error(error);
      setServerError('Something went wrong try again later');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-4">
        {serverError && (
          <p className="text-destructive bg-destructive/10 px-4 py-2 rounded-2xl">{serverError}</p>
        )}
        <Input
          id="email"
          type="email"
          className="w-full h-10 px-4 border rounded-2xl"
          placeholder="Enter your Email"
          {...register('email')}
          name="email"
        />
        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
        <Button type="submit" className="w-full p-2 rounded-2xl" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Password Link'}
        </Button>
      </form>
      <div className="border-t border-border pt-4">
        <p>
          Already have an account?{' '}
          <span
            onClick={() => setCurrentState('login')}
            className="cursor-pointer text-accent-foreground font-bold">
            Login
          </span>
        </p>
      </div>
    </>
  );
};
