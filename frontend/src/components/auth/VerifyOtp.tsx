import { useSearchParams, useRouter } from 'next/navigation';
import { AuthModalState } from './AuthModal';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { Button } from '@/components/ui';
import { Loader2 } from 'lucide-react';
import { AxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/lib/stores/useCartStore';

export const VerifyOtp = ({
  setCurrentState,
  onClose,
}: {
  setCurrentState: (state: AuthModalState) => void;
  onClose: () => void;
  }) => {
  const queryClient = useQueryClient();
  const { syncWithServer, refreshCartPrices } = useCartStore();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const type = searchParams.get('type');

      if (type === 'reset') {
        router.push(
          `/setNewPassword?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otpValue)}`
        );
        return;
      }

      const response = await authService.verifyEmailOtp({ email, otp: otpValue });
      toast.success('Email verified successfully!');

      const user = response?.data?.user;
      if (user) {
        useAuthStore.getState().setAuth(user);
        queryClient.clear();
        await syncWithServer();
        await refreshCartPrices();
        onClose();
      } else {
        setCurrentState('login');
      }
    } catch (error: unknown) {
      console.error(error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setIsResending(true);
    try {
      const type = searchParams.get('type');
      await authService.resendOtp({
        email,
        type: type || 'registration',
      });
      toast.success('Verification code resent to your email');
      setTimer(60);
    } catch (error: unknown) {
      console.error(error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground ">
          We&apos;ve sent a 6-digit verification code to
          <br />
          <span className="font-semibold text-foreground">{email || 'your email'}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="size-10 md:size-14 text-center text-2xl font-bold border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-card"
          />
        ))}
      </div>

      <Button
        onClick={handleVerify}
        disabled={isLoading || otp.join('').length !== 6}
        className="w-full h-12 rounded-2xl text-lg font-semibold group relative overflow-hidden">
        {isLoading ? <Loader2 className="animate-spin" /> : 'Verify & Proceed'}
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the code?{' '}
          <button
            onClick={handleResend}
            disabled={timer > 0 || isResending}
            className={`font-bold transition-colors ${
              timer > 0
                ? 'text-muted-foreground cursor-not-allowed'
                : 'text-primary hover:text-primary/80 cursor-pointer'
            }`}>
            {isResending ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend Now'}
          </button>
        </p>
      </div>

      <Button
        variant="link"
        onClick={() => setCurrentState('login')}
        className="w-fit self-center text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
        Back to Login
      </Button>
    </div>
  );
};
