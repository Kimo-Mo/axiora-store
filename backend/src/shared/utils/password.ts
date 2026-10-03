import bcrypt from "bcrypt";
import { env } from "../../config/env.js";

/**
 * bcrypt silently ignores input past 72 bytes. A 100-character password would
 * therefore authenticate identically to its own 72-character prefix, and because
 * only the hash is stored the truncation is undetectable at sign-in time. The
 * limit is enforced here so every caller shares one definition.
 */
export const PASSWORD_MAX_BYTES = 72;
export const PASSWORD_MIN_LENGTH = 8;

const ALLOWED = /^[\x21-\x7e]+$/;

export interface PasswordPolicyResult {
  valid: boolean;
  /** Machine-readable reason, suitable for a field-level validation error. */
  reason?: "TOO_SHORT" | "TOO_LONG" | "NON_ASCII" | "NO_LETTER" | "NO_DIGIT";
}

export function checkPasswordPolicy(password: string): PasswordPolicyResult {
  if (password.length < PASSWORD_MIN_LENGTH) return { valid: false, reason: "TOO_SHORT" };
  if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) return { valid: false, reason: "TOO_LONG" };
  if (!ALLOWED.test(password)) return { valid: false, reason: "NON_ASCII" };
  if (!/[A-Za-z]/.test(password)) return { valid: false, reason: "NO_LETTER" };
  if (!/[0-9]/.test(password)) return { valid: false, reason: "NO_DIGIT" };
  return { valid: true };
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_COST);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
