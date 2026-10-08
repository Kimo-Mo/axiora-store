'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { ShieldCheck } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { normalizeDigits } from '@/lib/phone';
import { useSendOtp } from '@/hooks/useSendOtp';
import { useUser } from '@/hooks/useUser';
import { useVerifyOtp } from '@/hooks/useVerifyOtp';
import type { ApiErrorBody } from '@/types/auth';
import type { OtpErrorDetails, OtpFailure, OtpErrorCode } from '@/types/verification';

type Stage = 'phone' | 'code' | 'verified';

interface PhoneVerificationProps {
  /**
   * Seeds the panel with the number that must be verified — in checkout that
   * is the delivery phone, not the stored account phone. When provided, the
   * panel renders it read-only: the editable field lives in the section above.
   */
  initialPhone?: string;
}

function extractFailure(error: unknown): OtpFailure | null {
  if (!axios.isAxiosError(error)) return null;
  const body = error.response?.data as ApiErrorBody | undefined;
  if (!body?.error?.code) return null;
  const details = (body.error.details ?? {}) as OtpErrorDetails;
  return {
    code: body.error.code as OtpErrorCode,
    remainingAttempts: details.remainingAttempts,
    retryAfterSeconds: details.retryAfterSeconds,
  };
}

/**
 * The shared verification panel (research D-8): phone entry → request code →
 * code entry → verified, rendered purely from response mirrors. Serves both
 * checkout (inline, seeded with the delivery phone) and the profile entry
 * point, so every piece of copy is localized and the layout stays
 * direction-neutral.
 */
export function PhoneVerification({ initialPhone }: PhoneVerificationProps) {
  const t = useTranslations('verification');
  const { data: user } = useUser();

  const [stage, setStage] = useState<Stage>('phone');
  const [phoneInput, setPhoneInput] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [failure, setFailure] = useState<OtpFailure | null>(null);

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const seeded = initialPhone !== undefined;
  const phone = phoneInput ?? initialPhone ?? user?.phone ?? '';

  const ticking = secondsLeft > 0 || resendIn > 0;
  useEffect(() => {
    if (!ticking) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      setResendIn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [ticking]);

  const failureMessage = (f: OtpFailure): string => {
    switch (f.code) {
      case 'VALIDATION_ERROR':
        return t('errors.invalidPhone');
      case 'OTP_INVALID':
        return t('errors.invalidCode');
      case 'OTP_EXPIRED':
        return t('errors.expiredCode');
      case 'OTP_ATTEMPTS_EXHAUSTED':
        return t('errors.attemptsExhausted');
      case 'OTP_SEND_LIMITED':
        return t('errors.sendLimited', { seconds: f.retryAfterSeconds ?? 0 });
      case 'OTP_RESEND_COOLDOWN':
        return t('errors.resendCooldown', { seconds: f.retryAfterSeconds ?? 60 });
      case 'PHONE_ALREADY_VERIFIED':
        return t('errors.alreadyVerified');
      default:
        return t('errors.sendFailed');
    }
  };

  /**
   * Absorbs a failed mutation into panel state (US3 limit wiring): a
   * cooldown/limit error re-arms the resend countdown from the server mirror,
   * an exhausted code resets the panel so a fresh code can be requested, and
   * any mirror of attempts left updates the proactive counter.
   */
  const absorbFailure = (error: unknown): void => {
    const f = extractFailure(error);
    setFailure(f);
    if (f?.remainingAttempts !== undefined) {
      setRemainingAttempts(f.remainingAttempts);
    }
    if (!f) return;
    if (f.code === 'OTP_RESEND_COOLDOWN' || f.code === 'OTP_SEND_LIMITED') {
      setResendIn(Math.max(1, f.retryAfterSeconds ?? 60));
    } else if (f.code === 'OTP_ATTEMPTS_EXHAUSTED') {
      setStage('phone');
      setCode('');
    }
  };

  const handleSend = async (): Promise<void> => {
    setFailure(null);
    try {
      const result = await sendOtp.mutate({ phone });
      setSecondsLeft(result.expiresInSeconds);
      setResendIn(result.resendAvailableInSeconds);
      setRemainingAttempts(result.remainingAttempts);
      setCode('');
      setStage('code');
    } catch (error) {
      absorbFailure(error);
    }
  };

  const handleVerify = async (): Promise<void> => {
    setFailure(null);
    try {
      await verifyOtp.mutate({ phone, code: normalizeDigits(code).trim() });
      setStage('verified');
    } catch (error) {
      absorbFailure(error);
    }
  };

  if (stage === 'verified') {
    return (
      <div className="space-y-2 rounded-2xl border border-border p-4 text-center">
        <ShieldCheck size={28} className="mx-auto text-success" />
        <p className="text-success text-sm font-medium">{t('verified')}</p>
      </div>
    );
  }

  if (stage === 'code') {
    return (
      <div className="space-y-3 rounded-2xl border border-border p-4">
        <p className="text-sm text-muted-foreground">{t('codeSent')}</p>
        <div className="space-y-1">
          <label htmlFor="verification-code" className="text-sm font-medium">
            {t('codeLabel')}
          </label>
          <Input
            id="verification-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('codePlaceholder')}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{secondsLeft > 0 ? t('expiresIn', { seconds: secondsLeft }) : t('errors.expiredCode')}</span>
          {remainingAttempts !== null && <span>{t('attemptsLeft', { count: remainingAttempts })}</span>}
        </div>
        {failure && <p className="text-error text-sm">{failureMessage(failure)}</p>}
        <div className="flex gap-2">
          <Button
            onClick={() => void handleVerify()}
            disabled={verifyOtp.isPending || code.length === 0}
            className="flex-1 rounded-2xl">
            {t('verify')}
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleSend()}
            disabled={resendIn > 0 || sendOtp.isPending}>
            {resendIn > 0 ? t('resendIn', { seconds: resendIn }) : t('resendCode')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border p-4">
      <div>
        <h3 className="font-semibold">{t('title')}</h3>
        <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
      </div>
      {seeded ? (
        <p className="text-sm font-medium" dir="ltr">
          {phone}
        </p>
      ) : (
        <div className="space-y-1">
          <label htmlFor="verification-phone" className="text-sm font-medium">
            {t('phoneLabel')}
          </label>
          <Input
            id="verification-phone"
            value={phone}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder={t('phonePlaceholder')}
            inputMode="tel"
            autoComplete="tel"
          />
        </div>
      )}
      {failure && <p className="text-error text-sm">{failureMessage(failure)}</p>}
      <Button
        onClick={() => void handleSend()}
        disabled={sendOtp.isPending || !phone}
        className="w-full rounded-2xl">
        {t('sendCode')}
      </Button>
    </div>
  );
}
