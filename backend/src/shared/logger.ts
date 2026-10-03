import { createHash } from "node:crypto";

/**
 * Structured security-event log (FR-035).
 *
 * The event union below is the whole vocabulary. It has no field capable of
 * carrying a password, hash, cookie value, or session credential, so leaking one
 * is a type error rather than something a code review has to catch (FR-036).
 *
 * `actor` is always a non-reversible digest of the account identifier, never a
 * plaintext email address.
 */

export type SecurityEventName =
  | "auth.register.succeeded"
  | "auth.register.rejected"
  | "auth.login.succeeded"
  | "auth.login.failed"
  | "auth.throttled"
  | "auth.session.issued"
  | "auth.session.rotated"
  | "auth.session.revoked"
  | "auth.session.refresh_rejected"
  | "auth.password.changed"
  | "auth.password.change_rejected"
  | "authz.access_denied"
  | "account.profile_updated"
  | "account.address_created"
  | "account.address_updated"
  | "account.address_deleted";

/**
 * Why an event happened. Several values deliberately collapse into a single
 * client-visible response (an unknown email and a wrong password both return an
 * identical 401) while staying distinct here for investigation.
 */
export type SecurityEventReason =
  | "OK"
  | "VALIDATION_FAILED"
  | "EMAIL_TAKEN"
  | "USERNAME_TAKEN"
  | "INVALID_CREDENTIALS"
  | "UNKNOWN_ACCOUNT"
  | "WEAK_PASSWORD"
  | "REFRESH_MISSING"
  | "REFRESH_EXPIRED"
  | "REFRESH_REVOKED"
  | "REFRESH_REPLAYED"
  | "SESSION_NOT_FOUND"
  | "ROLE_INSUFFICIENT"
  | "FOREIGN_ORIGIN"
  | "CURRENT_PASSWORD_WRONG"
  | "RATE_LIMITED"
  | "NOT_FOUND";

export interface SecurityEvent {
  event: SecurityEventName;
  outcome: "success" | "rejected" | "denied";
  reason: SecurityEventReason;
  /** Non-reversible digest of the acting account, or null when unauthenticated. */
  actor: string | null;
  role?: "CUSTOMER" | "ADMIN";
  /** Free-form machine-readable detail. Never a credential. */
  detail?: Record<string, string | number | boolean>;
  timestamp: string;
}

/**
 * Reduce an account identifier to a stable, non-reversible token.
 * `sha256(email)` truncated to 16 hex chars: short enough to read in a log line,
 * wide enough that a log dump cannot be walked back into an email address.
 */
export function redactUser(identifier: string | null | undefined): string | null {
  if (!identifier) return null;
  return createHash("sha256").update(identifier.trim().toLowerCase()).digest("hex").slice(0, 16);
}

function emit(record: SecurityEvent): void {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(record));
}

/** Record a security event. Never throws, so logging cannot break a request. */
export function logSecurityEvent(
  event: SecurityEventName,
  outcome: SecurityEvent["outcome"],
  reason: SecurityEventReason,
  options: {
    actor?: string | null;
    role?: "CUSTOMER" | "ADMIN";
    detail?: Record<string, string | number | boolean>;
  } = {},
): void {
  try {
    emit({
      event,
      outcome,
      reason,
      actor: redactUser(options.actor ?? null),
      ...(options.role ? { role: options.role } : {}),
      ...(options.detail ? { detail: options.detail } : {}),
      timestamp: new Date().toISOString(),
    });
  } catch {
    // A logging failure must never surface as a request failure.
  }
}
