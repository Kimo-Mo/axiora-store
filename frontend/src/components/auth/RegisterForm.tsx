import type { AuthModalState } from './AuthModal';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/auth.service';
import axios from 'axios';

const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters long'),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirm_password: z.string().min(8, 'Password must be at least 8 characters long'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
  .refine(
    (data) => data.password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/),
    {
      message: 'Password must contain at least one letter and one number and one special character',
      path: ['password'],
    }
  );

type RegisterFields = z.infer<typeof registerSchema>;

const FIELD_NAMES: Array<keyof RegisterFields> = ['username', 'email', 'password', 'confirm_password'];

export const RegisterForm = ({
  setCurrentState,
  onClose
}: {
  setCurrentState: (state: AuthModalState) => void;
  onClose: () => void;
}) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitForm = async (data: RegisterFields) => {
    setServerError('');
    try {
      setLoading(true);
      await authService.register({ ...data });
      router.push(`?email=${encodeURIComponent(data.email)}&type=registration`);
      setCurrentState('verify-otp');
    } catch (error) {
      console.error(error);

      // Handle Axios errors with a response (4xx / 5xx)
      if (axios.isAxiosError(error) && error.response) {
        const statusCode = error.response.status;
        const responseData = error.response.data;

        if (statusCode === 400 && responseData && typeof responseData === 'object') {
          // Map field-level errors returned by DRF onto the form fields
          let hasFieldError = false;

          FIELD_NAMES.forEach((field) => {
            if (field in responseData) {
              const messages: string[] = Array.isArray(responseData[field])
                ? responseData[field]
                : [String(responseData[field])];
              setError(field, { type: 'server', message: messages[0] });
              hasFieldError = true;
            }
          });

          // Show non-field error in top banner
          const nonField =
            responseData.error ||
            responseData.detail ||
            (Array.isArray(responseData.non_field_errors) ? responseData.non_field_errors[0] : null);

          if (nonField) {
            setServerError(String(nonField));
          } else if (!hasFieldError) {
            setServerError('Something went wrong. Please check your input and try again.');
          }
          return;
        }

        // 4xx non-validation errors (e.g. 429 rate-limit)
        if (statusCode < 500) {
          const msg =
            responseData?.error || responseData?.detail || 'Request failed. Please try again.';
          setServerError(String(msg));
          return;
        }
      }

      // 5xx / network / unexpected
      setServerError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-4 ">
        {serverError && (
          <p className="text-destructive bg-destructive/10 px-4 py-2 rounded-2xl">{serverError}</p>
        )}
        <div>
          <Input
            id="username"
            type="text"
            className="w-full h-10 px-4 border rounded-2xl"
            placeholder="Enter your Username"
            aria-invalid={!!errors.username}
            {...register('username')}
            name="username"
          />
          {errors.username && <p className="text-destructive text-sm">{errors.username.message}</p>}
        </div>
        <div>
          <Input
            id="email"
            type="email"
            className="w-full h-10 px-4 border rounded-2xl"
            placeholder="Enter your Email"
            aria-invalid={!!errors.email}
            {...register('email')}
            name="email"
          />
          {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <div className="w-full relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="w-full h-10 px-4 pr-10 border rounded-2xl"
              placeholder="Enter your Password"
              aria-invalid={!!errors.password}
              {...register('password')}
              name="password"
            />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="absolute top-1/2 -translate-y-1/2 right-2"
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
        </div>
        <div>
          <div className="w-full relative">
            <Input
              id="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              className="w-full h-10 px-4 pr-10 border rounded-2xl"
              placeholder="Confirm Password"
              aria-invalid={!!errors.confirm_password}
              {...register('confirm_password')}
              name="confirm_password"
            />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="absolute top-1/2 -translate-y-1/2 right-2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {errors.confirm_password && (
            <p className="text-destructive text-sm">{errors.confirm_password.message}</p>
          )}
        </div>
        <Button type="submit" disabled={loading} className="w-full p-2 rounded-2xl">
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
      <p className="text-sm">
        By signing up, you agree to Axiora Store&apos;s{' '}
        <Link href="/legal?tab=terms" className="text-accent-foreground font-bold" onClick={() => onClose()}>
          Terms and Conditions
        </Link>{' '}
        and acknowledge that Axiora Store&apos;s{' '}
        <Link href="/legal?tab=privacy" className="text-accent-foreground font-bold" onClick={() => onClose()}>
          Privacy Policy
        </Link>{' '}
        applies to you.
      </p>
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


