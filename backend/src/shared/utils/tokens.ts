import { createHash, randomBytes } from "node:crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import {
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
  env,
  isProduction,
} from "../../config/env.js";
import type { UserRole } from "../types.js";

const ACCESS_TOKEN_TYPE = "access";

/**
 * Access token — short-lived and self-describing so authorization can be decided
 * without a database read on every request.
 */
export interface AccessTokenClaims extends JwtPayload {
  sub: string;
  role: UserRole;
  type: typeof ACCESS_TOKEN_TYPE;
}

export function signAccessToken(user: { id: string; role: UserRole }): {
  token: string;
  expiresAt: Date;
} {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
    subject: user.id,
  };
  const token = jwt.sign({ role: user.role, type: ACCESS_TOKEN_TYPE }, env.JWT_ACCESS_SECRET, options);
  return { token, expiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_MS) };
}

/**
 * Verify the access token. Returns `null` for every failure mode — bad signature,
 * expiry, wrong type, malformed — so callers cannot accidentally branch on the
 * reason and leak it to the client.
 */
export function verifyAccessToken(token: string): AccessTokenClaims | null {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ["HS256"] });
    if (typeof decoded === "string") return null;
    if (decoded.type !== ACCESS_TOKEN_TYPE) return null;
    if (typeof decoded.sub !== "string" || typeof decoded.role !== "string") return null;
    return decoded as AccessTokenClaims;
  } catch {
    return null;
  }
}

/**
 * Refresh token — opaque by design. Nothing needs to be read out of it, so it
 * carries no claims and cannot leak its contents. This is what makes instant
 * server-side revocation possible: rotation marks the stored row revoked.
 */
export function generateRefreshToken(): { token: string; expiresAt: Date } {
  return {
    token: randomBytes(64).toString("hex"),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  };
}

/**
 * SHA-256 is correct here, not bcrypt: the input is 128 hex characters of
 * full-entropy random data, so there is nothing to brute-force. bcrypt's 72-byte
 * limit would also truncate it. Lookup happens on every refresh, so a fast digest
 * matters.
 */
export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Cookie flags shared by setting and clearing, so a clear always matches. */
export const AUTH_COOKIE_BASE = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: isProduction,
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
} as const;

export const ACCESS_COOKIE_NAME = "access";
export const REFRESH_COOKIE_NAME = "refresh";
