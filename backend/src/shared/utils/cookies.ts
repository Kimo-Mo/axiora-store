import type { Response } from "express";
import type { SessionTokens } from "../types.js";
import {
  ACCESS_COOKIE_NAME,
  AUTH_COOKIE_BASE,
  REFRESH_COOKIE_NAME,
} from "./tokens.js";

/**
 * Issue the auth cookie pair.
 *
 * The access cookie outlives neither the refresh token nor the pair's own
 * rotation, so it is always written with a fixed 15-minute lifetime and re-issued
 * on every call. `maxAge` mirrors `expires` because browsers and proxies disagree
 * about which one they honour.
 */
export function setAuthCookies(res: Response, tokens: SessionTokens): void {
  res.cookie(ACCESS_COOKIE_NAME, tokens.accessToken, {
    ...AUTH_COOKIE_BASE,
    maxAge: tokens.accessExpiresAt.getTime() - Date.now(),
    expires: tokens.accessExpiresAt,
  });

  res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
    ...AUTH_COOKIE_BASE,
    maxAge: tokens.refreshExpiresAt.getTime() - Date.now(),
    expires: tokens.refreshExpiresAt,
  });
}

/**
 * Clear both cookies. The options must be byte-identical to the ones used when
 * setting them — a mismatched `path` or `domain` silently fails to remove the
 * original, which is the usual cause of "sign out doesn't stick".
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE_NAME, { ...AUTH_COOKIE_BASE, maxAge: 0 });
  res.clearCookie(REFRESH_COOKIE_NAME, { ...AUTH_COOKIE_BASE, maxAge: 0 });
}
