import type { NextFunction, Request, Response } from "express";
import { FRONTEND_ORIGIN, isProduction } from "../../config/env.js";
import { ForbiddenError } from "../errors.js";
import { logSecurityEvent } from "../logger.js";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Reduce a URL to its origin, or null when it cannot be parsed. */
function toOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Cross-site request forgery guard.
 *
 * This is the second of two layers. The first is `SameSite=Lax` on both auth
 * cookies, which already prevents a browser from attaching credentials to a
 * cross-site mutating request. This layer catches what that misses and gives a
 * clear rejection instead of a confusing 401.
 *
 * Order of checks:
 *   1. `Origin` present and allowlisted  → allow
 *   2. `Origin` present, not allowlisted → 403
 *   3. `Origin` absent, `Referer` checked the same way
 *   4. Neither header → allow in development, 403 in production
 *
 * Rule 4 exists because browsers always send `Origin` on cross-origin mutating
 * requests, so a request with neither header is either same-origin-non-browser
 * (curl, server-to-server, the manual verification checklist) or a non-browser
 * client that has no cookie to steal. Rejecting it unconditionally would break the
 * phase's own verification procedure while blocking no real attack.
 */
export function csrfGuard(req: Request, _res: Response, next: NextFunction): void {
  if (!MUTATING_METHODS.has(req.method)) {
    next();
    return;
  }

  const originHeader = req.get("origin");
  if (originHeader) {
    if (toOrigin(originHeader) === FRONTEND_ORIGIN) {
      next();
      return;
    }
    logSecurityEvent("authz.access_denied", "denied", "FOREIGN_ORIGIN", {
      detail: { path: req.path, source: "origin" },
    });
    next(new ForbiddenError("Cross-origin request rejected"));
    return;
  }

  const refererHeader = req.get("referer");
  if (refererHeader) {
    if (toOrigin(refererHeader) === FRONTEND_ORIGIN) {
      next();
      return;
    }
    logSecurityEvent("authz.access_denied", "denied", "FOREIGN_ORIGIN", {
      detail: { path: req.path, source: "referer" },
    });
    next(new ForbiddenError("Cross-origin request rejected"));
    return;
  }

  if (!isProduction) {
    next();
    return;
  }

  logSecurityEvent("authz.access_denied", "denied", "FOREIGN_ORIGIN", {
    detail: { path: req.path, source: "missing" },
  });
  next(new ForbiddenError("Cross-origin request rejected"));
}
