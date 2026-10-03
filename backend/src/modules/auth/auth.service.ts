import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ConflictError, UnauthorizedError, ValidationError } from "../../shared/errors.js";
import { logSecurityEvent } from "../../shared/logger.js";
import type { AuthUser, SessionTokens } from "../../shared/types.js";
import { hashPassword, verifyPassword } from "../../shared/utils/password.js";
import {
  generateRefreshToken,
  hashRefreshToken,
  signAccessToken,
} from "../../shared/utils/tokens.js";
import type { AddressSummary, UserRole } from "../../shared/types.js";
import type { ChangePasswordInput, LoginInput, RegisterInput } from "./auth.schema.js";

const HOUR = 60 * 60 * 1000;

/** Rate-limit the opportunistic cleanup so a busy refresh path cannot hammer the table. */
let lastCleanupAt = 0;
const CLEANUP_INTERVAL_MS = HOUR;

export async function sweepExpiredRefreshTokens(): Promise<void> {
  const now = Date.now();
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
  lastCleanupAt = now;
  try {
    await prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date(now) } } });
  } catch {
    // Housekeeping must never fail a request.
  }
}

export function toAuthUser(user: {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string | null;
  phoneVerified: boolean;
  role: UserRole;
  createdAt: Date;
  defaultAddress?: {
    id: string;
    label: string | null;
    fullName: string;
    phone: string;
    governorate: string;
    city: string;
    street: string;
  } | null;
}): AuthUser {
  const address: AddressSummary | null = user.defaultAddress
    ? {
        id: user.defaultAddress.id,
        label: user.defaultAddress.label,
        fullName: user.defaultAddress.fullName,
        phone: user.defaultAddress.phone,
        governorate: user.defaultAddress.governorate,
        city: user.defaultAddress.city,
        street: user.defaultAddress.street,
      }
    : null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    defaultAddress: address,
  };
}

/** Shape returned by every auth endpoint, including the default-address summary. */
export const authUserSelect = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  phone: true,
  phoneVerified: true,
  role: true,
  createdAt: true,
  addresses: {
    where: { isDefault: true },
    take: 1,
    select: {
      id: true,
      label: true,
      fullName: true,
      phone: true,
      governorate: true,
      city: true,
      street: true,
    },
  },
} satisfies Prisma.UserSelect;

export type AuthUserRecord = Prisma.UserGetPayload<{ select: typeof authUserSelect }>;

function toAuthUserWithAddress(user: AuthUserRecord): AuthUser {
  return toAuthUser({ ...user, defaultAddress: user.addresses[0] ?? null });
}

/**
 * Issue a brand-new session: an access JWT plus a stored opaque refresh token.
 * The plaintext refresh token exists only in the return value, on its way into a
 * cookie — the database only ever receives the digest.
 */
async function issueSession(user: { id: string; role: UserRole }): Promise<SessionTokens> {
  const access = signAccessToken({ id: user.id, role: user.role });
  const refresh = generateRefreshToken();
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hashRefreshToken(refresh.token), expiresAt: refresh.expiresAt },
  });
  return {
    accessToken: access.token,
    refreshToken: refresh.token,
    accessExpiresAt: access.expiresAt,
    refreshExpiresAt: refresh.expiresAt,
  };
}

export async function register(input: RegisterInput): Promise<{ user: AuthUser; tokens: SessionTokens }> {
  // Checked explicitly rather than relying on the unique constraint alone, so the
  // response can name the field that collided. The database constraint remains the
  // authoritative backstop.
  const [emailTaken, usernameTaken] = await Promise.all([
    prisma.user.findUnique({ where: { email: input.email }, select: { id: true } }),
    prisma.user.findUnique({ where: { username: input.username }, select: { id: true } }),
  ]);

  if (emailTaken) {
    logSecurityEvent("auth.register.rejected", "rejected", "EMAIL_TAKEN", { actor: input.email });
    throw new ConflictError("An account with this email already exists", { email: "Email already in use" });
  }
  if (usernameTaken) {
    logSecurityEvent("auth.register.rejected", "rejected", "USERNAME_TAKEN", { actor: input.email });
    throw new ConflictError("An account with this username already exists", {
      username: "Username already in use",
    });
  }

  const passwordHash = await hashPassword(input.password);
  const created = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      fullName: input.fullName,
      passwordHash,
      // Role is intentionally absent: registration always produces a customer.
    },
    select: authUserSelect,
  });

  // Registration signs the customer in immediately — no second sign-in step.
  const tokens = await issueSession({ id: created.id, role: created.role });
  logSecurityEvent("auth.register.succeeded", "success", "OK", { actor: created.email, role: created.role });
  logSecurityEvent("auth.session.issued", "success", "OK", { actor: created.email, role: created.role });

  return { user: toAuthUserWithAddress(created), tokens };
}

export async function login(input: LoginInput): Promise<{ user: AuthUser; tokens: SessionTokens }> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { ...authUserSelect, passwordHash: true },
  });

  if (!user) {
    // Same status, same code, same message as a wrong password — the client must
    // not be able to learn whether an account exists. The reason differs only in
    // the internal log.
    logSecurityEvent("auth.login.failed", "rejected", "UNKNOWN_ACCOUNT", { actor: input.email });
    throw new UnauthorizedError("Incorrect email or password");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    logSecurityEvent("auth.login.failed", "rejected", "INVALID_CREDENTIALS", {
      actor: user.email,
      role: user.role,
    });
    throw new UnauthorizedError("Incorrect email or password");
  }

  const tokens = await issueSession({ id: user.id, role: user.role });
  logSecurityEvent("auth.login.succeeded", "success", "OK", { actor: user.email, role: user.role });
  logSecurityEvent("auth.session.issued", "success", "OK", { actor: user.email, role: user.role });

  const { passwordHash: _discard, ...safe } = user;
  void _discard;
  return { user: toAuthUserWithAddress(safe), tokens };
}

export async function getCurrentUser(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: authUserSelect });
  if (!user) {
    throw new UnauthorizedError("Invalid or expired session");
  }
  return toAuthUserWithAddress(user);
}

/** Reasons the refresh contract distinguishes internally but collapses to one 401. */
type RefreshRejection = "REFRESH_MISSING" | "REFRESH_EXPIRED" | "REFRESH_REVOKED" | "REFRESH_REPLAYED";

export async function refresh(presentedToken: string | undefined): Promise<{ user: AuthUser; tokens: SessionTokens }> {
  if (!presentedToken) {
    logSecurityEvent("auth.session.refresh_rejected", "rejected", "REFRESH_MISSING");
    throw new UnauthorizedError("Session expired");
  }

  const tokenHash = hashRefreshToken(presentedToken);
  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: authUserSelect } },
  });

  if (!record) {
    logSecurityEvent("auth.session.refresh_rejected", "rejected", "REFRESH_MISSING");
    throw new UnauthorizedError("Session expired");
  }

  let rejection: RefreshRejection | null = null;
  if (record.revokedAt) {
    // The row is still here but already exchanged or explicitly revoked. A token
    // presented in this state has either been replayed by an attacker or stolen
    // and raced, so it is reported distinctly for investigation.
    rejection = record.revokedAt.getTime() < record.expiresAt.getTime() ? "REFRESH_REPLAYED" : "REFRESH_REVOKED";
  } else if (record.expiresAt.getTime() <= Date.now()) {
    rejection = "REFRESH_EXPIRED";
  }

  if (rejection) {
    logSecurityEvent("auth.session.refresh_rejected", "rejected", rejection, {
      actor: record.user.email,
      role: record.user.role,
    });
    throw new UnauthorizedError("Session expired");
  }

  const access = signAccessToken({ id: record.userId, role: record.user.role });
  const next = generateRefreshToken();

  // Insert-and-revoke must be atomic: a partial write would leave the customer
  // holding a revoked token with no replacement, unable to renew at all.
  await prisma.$transaction([
    prisma.refreshToken.create({
      data: { userId: record.userId, tokenHash: hashRefreshToken(next.token), expiresAt: next.expiresAt },
    }),
    prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } }),
  ]);

  logSecurityEvent("auth.session.rotated", "success", "OK", {
    actor: record.user.email,
    role: record.user.role,
  });

  void sweepExpiredRefreshTokens();

  return {
    user: toAuthUserWithAddress(record.user),
    tokens: {
      accessToken: access.token,
      refreshToken: next.token,
      accessExpiresAt: access.expiresAt,
      refreshExpiresAt: next.expiresAt,
    },
  };
}

export async function logout(presentedToken: string | undefined, actor: { email: string } | null): Promise<void> {
  if (presentedToken) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashRefreshToken(presentedToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  logSecurityEvent("auth.session.revoked", "success", "OK", { actor: actor?.email ?? null });
}

/** The principal fields this action needs — never the password hash. */
type PasswordChangeActor = { id: string; email: string; role: UserRole };

export async function changePassword(
  actor: PasswordChangeActor,
  input: ChangePasswordInput,
  _currentRefreshToken?: string | undefined,
): Promise<SessionTokens> {
  // The hash is fetched here rather than carried on the request principal:
  // `requireAuth` deliberately does not select it, so it never travels further
  // than this query.
  const record = await prisma.user.findUnique({
    where: { id: actor.id },
    select: { passwordHash: true },
  });
  if (!record) throw new UnauthorizedError("Invalid or expired session");

  const valid = await verifyPassword(input.currentPassword, record.passwordHash);
  if (!valid) {
    logSecurityEvent("auth.password.change_rejected", "rejected", "CURRENT_PASSWORD_WRONG", {
      actor: actor.email,
    });
    throw new UnauthorizedError("Current password is incorrect");
  }

  if (input.currentPassword === input.newPassword) {
    throw new ValidationError("New password must differ from the current one", {
      newPassword: "Choose a password you have not used here before",
    });
  }

  const passwordHash = await hashPassword(input.newPassword);
  const access = signAccessToken({ id: actor.id, role: actor.role });
  const next = generateRefreshToken();

  // Every previous session is terminated; the session making the change rotates
  // into a fresh credential pair. Revoking all existing active tokens first ensures
  // no stale credential (including the replaced one) remains valid, while the
  // newly created replacement is untouched.
  await prisma.$transaction([
    prisma.user.update({ where: { id: actor.id }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: {
        userId: actor.id,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: { userId: actor.id, tokenHash: hashRefreshToken(next.token), expiresAt: next.expiresAt },
    }),
  ]);

  logSecurityEvent("auth.password.changed", "success", "OK", { actor: actor.email, role: actor.role });
  logSecurityEvent("auth.session.revoked", "success", "OK", { actor: actor.email, role: actor.role });

  return {
    accessToken: access.token,
    refreshToken: next.token,
    accessExpiresAt: access.expiresAt,
    refreshExpiresAt: next.expiresAt,
  };
}
