import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { authIpLimiter } from "../../shared/middleware/rateLimit.js";
import { validateBody } from "../../shared/middleware/validate.js";
import * as controller from "./verification.controller.js";
import { sendOtpSchema, verifyOtpSchema } from "./verification.schemas.js";

export const verificationRouter = Router();

verificationRouter.post(
  "/phone/send",
  requireAuth,
  authIpLimiter,
  validateBody(sendOtpSchema),
  asyncHandler(controller.send),
);

verificationRouter.post(
  "/phone/verify",
  requireAuth,
  authIpLimiter,
  validateBody(verifyOtpSchema),
  asyncHandler(controller.verify),
);
