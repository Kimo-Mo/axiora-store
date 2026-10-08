/**
 * Result DTOs for the verification service. These are presentational mirrors
 * (NFR-002): the server remains the sole authority over expiry, attempts, and
 * the verified flag — the client renders the numbers it is given.
 */

export interface SendOtpResult {
  /** Normalized target phone (separator-stripped Egyptian mobile). */
  phone: string;
  /** Mirror for the code-expiry countdown (FR-014). */
  expiresInSeconds: number;
  /** Mirror for the resend countdown (FR-014). */
  resendAvailableInSeconds: number;
  /** Mirror for the proactive attempt counter: a fresh code starts at the cap. */
  remainingAttempts: number;
}

export interface VerifyOtpResult {
  /** The verified number — equals the caller's account phone after the update. */
  phone: string;
  phoneVerified: true;
}

/** Presentational mirrors attached to AppError details for the client UI. */
export interface OtpErrorDetails {
  remainingAttempts?: number;
  retryAfterSeconds?: number;
}
