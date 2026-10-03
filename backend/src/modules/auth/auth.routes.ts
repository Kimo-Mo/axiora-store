import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { authAccountLimiter, authIpLimiter } from "../../shared/middleware/rateLimit.js";
import { validateBody } from "../../shared/middleware/validate.js";
import * as controller from "./auth.controller.js";
import { changePasswordSchema, loginSchema, registerSchema } from "./auth.schema.js";

export const authRouter = Router();

/**
 * Sign-out is intentionally unauthenticated: an expired access token must not
 * leave a customer unable to clear their cookies. The refresh token identifies
 * the session to revoke.
 */
authRouter.post("/logout", asyncHandler(controller.logout));

authRouter.post("/refresh", asyncHandler(controller.refresh));

authRouter.post(
  "/register",
  authIpLimiter,
  authAccountLimiter,
  validateBody(registerSchema),
  asyncHandler(controller.register),
);

authRouter.post(
  "/login",
  authIpLimiter,
  authAccountLimiter,
  validateBody(loginSchema),
  asyncHandler(controller.login),
);

authRouter.get("/me", requireAuth, asyncHandler(controller.me));

// Only the per-IP limiter applies here: the account limiter keys on `body.email`,
// which this payload does not carry, so attaching it would pool every customer's
// password changes into a single shared counter.
authRouter.post(
  "/change-password",
  requireAuth,
  authIpLimiter,
  validateBody(changePasswordSchema),
  asyncHandler(controller.changePassword),
);
