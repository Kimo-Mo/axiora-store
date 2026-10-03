import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { logSecurityEvent } from "../logger.js";

const MINUTE = 60 * 1000;

/** Normalise the attempted identity so casing and whitespace cannot split a counter. */
function normaliseEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function handleThrottled(req: Request, res: Response): void {
  logSecurityEvent("auth.throttled", "rejected", "RATE_LIMITED", {
    actor: normaliseEmail((req.body as Record<string, unknown> | undefined)?.email),
    detail: { path: req.path },
  });
  res.status(429).json({
    success: false,
    error: {
      message: "Too many attempts. Please try again later.",
      code: "RATE_LIMITED",
    },
  });
}

const shared = {
  standardHeaders: "draft-7" as const,
  legacyHeaders: false,
  handler: handleThrottled,
};

/**
 * Per-client-IP allowance.
 *
 * `ipKeyGenerator` applies IPv6 subnet masking, which is mandatory here: without
 * it an attacker can rotate through many addresses inside their own IPv6 subnet
 * and defeat a per-IP limit entirely. `app.set("trust proxy", 1)` makes
 * `req.ip` the real client address forwarded by Next.js, so this measures the
 * customer rather than the proxy.
 */
export const authIpLimiter = rateLimit({
  ...shared,
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MINUTES * MINUTE,
  limit: env.AUTH_RATE_LIMIT_MAX,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? ""),
});

/**
 * Per-target-account allowance, counting failures only.
 *
 * `skipSuccessfulRequests` is a correctness requirement, not an optimisation:
 * without it a customer who signs in successfully dozens of times a day would
 * exhaust their own allowance. The email is not verified at this point — this
 * limit exists to blunt distributed credential stuffing against one victim, and
 * the IP limit covers the single-source case.
 */
export const authAccountLimiter = rateLimit({
  ...shared,
  windowMs: env.ACCOUNT_RATE_LIMIT_WINDOW_MINUTES * MINUTE,
  limit: env.ACCOUNT_RATE_LIMIT_MAX,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => normaliseEmail((req.body as Record<string, unknown> | undefined)?.email),
});
