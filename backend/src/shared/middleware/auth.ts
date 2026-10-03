import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import { ForbiddenError, UnauthorizedError } from "../errors.js";
import { logSecurityEvent } from "../logger.js";
import type { UserRole } from "../types.js";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "../utils/tokens.js";

/** The authenticated principal attached by `requireAuth`. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone: string | null;
  phoneVerified: boolean;
  role: UserRole;
  createdAt: Date;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Reject the request unless it carries a valid access token.
 *
 * The token is only the first gate: the user is re-read from the database so a
 * stale token cannot outlive a role change indefinitely, and so the request never
 * acts on claims the server would not itself trust.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.[ACCESS_COOKIE_NAME];
  if (typeof token !== "string" || token.length === 0) {
    logSecurityEvent("authz.access_denied", "denied", "SESSION_NOT_FOUND", { detail: { path: req.path } });
    next(new UnauthorizedError("Authentication required"));
    return;
  }

  const claims = verifyAccessToken(token);
  if (!claims) {
    logSecurityEvent("authz.access_denied", "denied", "SESSION_NOT_FOUND", { detail: { path: req.path } });
    next(new UnauthorizedError("Invalid or expired session"));
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        phoneVerified: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      logSecurityEvent("authz.access_denied", "denied", "SESSION_NOT_FOUND", { actor: claims.sub });
      next(new UnauthorizedError("Invalid or expired session"));
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    // A database fault is inconclusive, not a rejection: the session may well be
    // valid. Let it surface as a 5xx so the client keeps the session (FR-015).
    next(err);
  }
}

/**
 * Require administrator privileges. Must be mounted after `requireAuth` — it reads
 * the principal that middleware attached.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const user = req.user;
  if (!user) {
    next(new UnauthorizedError("Authentication required"));
    return;
  }
  if (user.role !== "ADMIN") {
    logSecurityEvent("authz.access_denied", "denied", "ROLE_INSUFFICIENT", {
      actor: user.email,
      role: user.role,
      detail: { path: req.path },
    });
    next(new ForbiddenError("Administrator privileges required"));
    return;
  }
  next();
}
