import type { Request, Response } from "express";
import { UnauthorizedError } from "../../shared/errors.js";
import { clearAuthCookies, setAuthCookies } from "../../shared/utils/cookies.js";
import { REFRESH_COOKIE_NAME } from "../../shared/utils/tokens.js";
import type { AuthenticatedUser } from "../../shared/middleware/auth.js";
import type { ChangePasswordInput, LoginInput, RegisterInput } from "./auth.schema.js";
import * as authService from "./auth.service.js";

function readRefreshCookie(req: Request): string | undefined {
  const value = req.cookies?.[REFRESH_COOKIE_NAME];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function sendUser(res: Response, user: ReturnType<typeof authService.toAuthUser>): void {
  res.json({ success: true, data: { user } });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { user, tokens } = await authService.register(req.body as RegisterInput);
  setAuthCookies(res, tokens);
  res.status(201);
  sendUser(res, user);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { user, tokens } = await authService.login(req.body as LoginInput);
  setAuthCookies(res, tokens);
  sendUser(res, user);
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthenticatedUser | undefined;
  if (!user) throw new UnauthorizedError("Authentication required");
  sendUser(res, await authService.getCurrentUser(user.id));
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { user, tokens } = await authService.refresh(readRefreshCookie(req));
  setAuthCookies(res, tokens);
  sendUser(res, user);
}

/**
 * Idempotent: sign-out returns 200 even with no valid session, because a customer
 * whose session is already dead clicking sign out should not see an error.
 */
export async function logout(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthenticatedUser | undefined;
  await authService.logout(readRefreshCookie(req), user ?? null);
  clearAuthCookies(res);
  res.json({ success: true, data: { loggedOut: true } });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const user = req.user as AuthenticatedUser | undefined;
  if (!user) throw new UnauthorizedError("Authentication required");

  const tokens = await authService.changePassword(user, req.body as ChangePasswordInput, readRefreshCookie(req));
  setAuthCookies(res, tokens);
  res.json({ success: true, data: { passwordChanged: true } });
}
