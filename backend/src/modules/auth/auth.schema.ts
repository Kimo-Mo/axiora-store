import { z } from "zod";
import { PASSWORD_MAX_BYTES, PASSWORD_MIN_LENGTH } from "../../shared/utils/password.js";

/**
 * `.strict()` on every object means an unknown key is a validation failure rather
 * than a silently dropped field. That is what stops a client from smuggling
 * `role: "ADMIN"` into a registration payload.
 */

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254, "Email address is too long");

const username = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[A-Za-z0-9_-]+$/, "Username may only contain letters, numbers, underscore, and hyphen");

const fullName = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters")
  .max(100, "Full name must be at most 100 characters");

/**
 * Length is bounded in bytes, not characters, because bcrypt truncates at 72
 * bytes. A multi-byte character string can pass a 72-character check and still
 * exceed the limit.
 */
const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .refine((value) => Buffer.byteLength(value, "utf8") <= PASSWORD_MAX_BYTES, {
    message: `Password must be at most ${PASSWORD_MAX_BYTES} bytes`,
  })
  .refine((value) => /^[!-~]+$/.test(value), {
    message: "Password may only contain printable ASCII characters",
  })
  .refine((value) => /[A-Za-z]/.test(value), { message: "Password must contain a letter" })
  .refine((value) => /[0-9]/.test(value), { message: "Password must contain a number" });

export const registerSchema = z
  .object({
    username,
    email,
    fullName,
    password,
  })
  .strict();

export const loginSchema = z
  .object({
    email,
    // A sign-in password is not re-validated against the strength policy: an
    // account created before the policy tightened must still be able to sign in.
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: password,
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
