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
const HOUR = 60 * MINUTE;

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

/** Origin comparison must be exact, so trailing slashes are normalised away. */
export const FRONTEND_ORIGIN = new URL(env.FRONTEND_URL).origin;
