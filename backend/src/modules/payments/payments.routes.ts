import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { paymentInitLimiter } from "../../shared/middleware/rateLimit.js";
import { validateBody } from "../../shared/middleware/validate.js";
import * as controller from "./payments.controller.js";
import { InitiatePaymentSchema } from "./payments.schemas.js";

/**
 * Payment-method availability (public, read-only).
 *
 * Mounted at `/api/v1/payment-methods`. Returns capability flags only, so the
 * checkout payment step can render the real list — the storefront must never offer
 * a method the store has disabled (FR-001/FR-016).
 */
export const paymentMethodsRouter = Router();

paymentMethodsRouter.get("/", asyncHandler(controller.listMethods));

/** Customer-facing payment initiation (mounted at `/api/v1/payments`). */
export const paymentsRouter = Router();

paymentsRouter.post(
  "/create",
  requireAuth,
  paymentInitLimiter,
  validateBody(InitiatePaymentSchema),
  asyncHandler(controller.create),
);

/**
 * Provider settlement notifications.
 *
 * Exported separately from `paymentsRouter` because `app.ts` mounts it ABOVE the
 * global CSRF guard: Paymob's server-to-server sender carries no `Origin` and no
 * `Referer`, which the guard's production rule rejects — and this is the one
 * message the store must never lose (research D-3).
 *
 * No `requireAuth` (the provider has no session) and no limiter (throttling
 * settlement messages would delay financial correctness, research D-11). The
 * route's replacement control is the provider HMAC, verified in the adapter.
 */
export const paymentsWebhookRouter = Router();

paymentsWebhookRouter.post("/", asyncHandler(controller.webhook));