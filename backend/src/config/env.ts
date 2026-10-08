import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * Session lifetimes and policy limits. These are constants rather than
 * environment variables because changing them silently would invalidate every
 * issued credential; only the ones an operator genuinely needs to tune per
 * environment are overridable.
 */
const MINUTE = 60 * 1000;
/** Exported for modules that express limits as rolling windows (verification). */
export const HOUR = 60 * MINUTE;

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email"),
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),

  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),

  /**
   * Public origin of the Next.js storefront. Serves two purposes: the CSRF
   * allowlist for mutating requests and the CORS allowlist. Required — without it
   * neither control can function.
   */
  FRONTEND_URL: z.string().url("FRONTEND_URL must be an absolute URL, e.g. http://localhost:3000"),

  /**
   * Cookie domain scope. Empty in development: a `localhost` cookie domain
   * behaves inconsistently across browsers and breaks the flow in Safari.
   */
  COOKIE_DOMAIN: z.string().optional().default(""),

  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  BCRYPT_COST: z.coerce.number().int().min(10).max(15).default(12),

  /**
   * SMS vendor selector for OTP delivery. Only "mock" exists until a production
   * vendor is wired; an unknown value fails env parsing at startup (fail-fast,
   * consistent with every other bad-env failure).
   */
  SMS_PROVIDER: z.enum(["mock"]).default("mock"),

  /**
   * Per-client-IP allowance across all credential endpoints.
   *
   * Deliberately generous: in local development every request arrives from
   * 127.0.0.1, and a tight budget makes the manual verification checklist
   * impossible to complete — the phase's only correctness gate, since automated
   * tests are out of scope. The per-account limiter below is the one that must
   * stay tight, because it is what actually stops credential stuffing.
   */
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),

  /**
   * Per-target-account allowance. Counts failures only, so a legitimate customer
   * signing in repeatedly is never throttled by their own history, and a
   * developer testing the happy path never consumes budget either.
   */
  ACCOUNT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  ACCOUNT_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

export const isProduction = env.NODE_ENV === "production";

export const ACCESS_TOKEN_TTL_MS = env.ACCESS_TOKEN_TTL_MINUTES * MINUTE;
export const REFRESH_TOKEN_TTL_MS = env.REFRESH_TOKEN_TTL_DAYS * HOUR * 24;

/**
 * OTP policy limits for phone verification. Spec-fixed for this phase
 * (admin-configurability deferred): 6-digit code, 5-minute expiry, at most
 * 3 sends per phone per rolling hour, 5 attempts per code, 60-second resend
 * cooldown. Retuning these silently would undermine the abuse-protection
 * budget, so like the session constants they are constants, not env vars.
 */
export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 5 * MINUTE;
export const OTP_MAX_SENDS_PER_HOUR = 3;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = MINUTE;

/** Origin comparison must be exact, so trailing slashes are normalised away. */
export const FRONTEND_ORIGIN = new URL(env.FRONTEND_URL).origin;
