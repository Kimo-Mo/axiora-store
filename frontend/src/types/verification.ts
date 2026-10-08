/**
 * Aligns with `backend/src/modules/verification/verification.types.ts` and
 * contracts/verification-api.md. Response mirrors are presentational only
 * (NFR-002) — the server remains the sole authority on expiry, attempts, and
 * the verified flag.
 */

import type { AuthErrorCode } from './auth';

export interface SendOtpPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  code: string;
}

export type SendOtpDto = {
  phone: string;
  expiresInSeconds: number;
  resendAvailableInSeconds: number;
  remainingAttempts: number;
};

export type VerifyOtpDto = {
  phone: string;
  phoneVerified: true;
};

export type OtpErrorDetails = {
  remainingAttempts?: number;
  retryAfterSeconds?: number;
};

/** Error codes the verification panel branches on. Anything else is unexpected. */
export type OtpErrorCode =
  | AuthErrorCode
  | 'OTP_INVALID'
  | 'OTP_EXPIRED'
  | 'OTP_ATTEMPTS_EXHAUSTED'
  | 'OTP_SEND_LIMITED'
  | 'OTP_RESEND_COOLDOWN'
  | 'PHONE_ALREADY_VERIFIED'
  | 'SMS_SEND_FAILED';

/**
 * A failure whose code the panel branches on (the AuthErrorCode
 * literal-comparison pattern); the inherited fields carry the mirrors.
 */
export interface OtpFailure extends OtpErrorDetails {
  code: OtpErrorCode;
}
