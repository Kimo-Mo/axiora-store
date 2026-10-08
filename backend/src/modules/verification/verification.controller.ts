import type { Request, Response } from "express";
import { UnauthorizedError } from "../../shared/errors.js";
import type { AuthenticatedUser } from "../../shared/middleware/auth.js";
import type { SendOtpInput, VerifyOtpInput } from "./verification.schemas.js";
import * as verificationService from "./verification.service.js";

function currentUser(req: Request): AuthenticatedUser {
  const user = req.user;
  if (!user) throw new UnauthorizedError("Authentication required");
  return user;
}

export async function send(req: Request, res: Response): Promise<void> {
  const result = await verificationService.sendOtp(currentUser(req).id, req.body as SendOtpInput);
  res.status(200).json({ success: true, data: result });
}

export async function verify(req: Request, res: Response): Promise<void> {
  const result = await verificationService.verifyOtp(currentUser(req).id, req.body as VerifyOtpInput);
  res.status(200).json({ success: true, data: result });
}
