import bcrypt from "bcrypt";
import { randomInt } from "node:crypto";
import {
  HOUR,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_SENDS_PER_HOUR,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
  env,
} from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { AppError, NotFoundError } from "../../shared/errors.js";
import { canonicalizePhone } from "../../shared/utils/phone.js";
import { getSmsProvider } from "./sms-provider.factory.js";
import type { SendOtpInput, VerifyOtpInput } from "./verification.schemas.js";
import type { SendOtpResult, VerifyOtpResult } from "./verification.types.js";

/**
 * Requests a one-time code for the submitted phone: already-verified guard,
 * per-phone abuse guards (cooldown + hourly cap), then generation, dispatch,
 * and the presentational mirrors. Never log or return the plaintext code
 * outside the mock provider's development console line.
 */
export async function sendOtp(userId: string, input: SendOtpInput): Promise<SendOtpResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true, phoneVerified: true },
  });
  if (!user) throw new NotFoundError("Account not found");
  // Legacy rows may hold a pre-canonicalization form of the same number, so
  // the comparison canonicalizes the stored value.
  if (
    user.phoneVerified === true &&
    user.phone !== null &&
    canonicalizePhone(user.phone) === input.phone
  ) {
    throw new AppError("Phone is already verified", 409, "PHONE_ALREADY_VERIFIED", true);
  }

  // Send-path abuse guards (FR-005/FR-006, research D-3): per-phone state is
  // counted from PhoneVerification rows, so the limits bind to the phone
  // number itself across sessions and devices and survive restarts. Deliberately
  // NOT an express-rate-limit layer — its in-memory store is per-process.
  const latestForPhone = await prisma.phoneVerification.findFirst({
    where: { phone: input.phone },
    orderBy: { createdAt: "desc" },
  });
  if (latestForPhone && Date.now() - latestForPhone.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
    throw new AppError("Please wait before requesting another code", 429, "OTP_RESEND_COOLDOWN", true, {
      retryAfterSeconds: Math.ceil(
        (OTP_RESEND_COOLDOWN_MS - (Date.now() - latestForPhone.createdAt.getTime())) / 1000,
      ),
    });
  }
  const hourAgo = new Date(Date.now() - HOUR);
  const sentInWindow = await prisma.phoneVerification.count({
    where: { phone: input.phone, createdAt: { gt: hourAgo } },
  });
  if (sentInWindow >= OTP_MAX_SENDS_PER_HOUR) {
    const oldestInWindow = await prisma.phoneVerification.findFirst({
      where: { phone: input.phone, createdAt: { gt: hourAgo } },
      orderBy: { createdAt: "asc" },
    });
    const retryAfterSeconds = oldestInWindow
      ? Math.ceil((oldestInWindow.createdAt.getTime() + HOUR - Date.now()) / 1000)
      : HOUR / 1000;
    throw new AppError("Too many codes requested. Try again later", 429, "OTP_SEND_LIMITED", true, {
      retryAfterSeconds,
    });
  }

  const code = String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
  const otpHash = await bcrypt.hash(code, env.BCRYPT_COST);

  const row = await prisma.phoneVerification.create({
    data: {
      userId,
      phone: input.phone,
      otpHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      attempts: 0,
    },
  });

  try {
    await getSmsProvider().sendOtp(input.phone, code);
  } catch {
    // A failed dispatch must not consume this phone's cooldown or hourly
    // budget — the guards above count *sends*, and nothing was sent. The
    // row is removed so the customer can retry immediately; if the delete
    // itself fails, the slot is simply spent (fail-safe, never fail-open).
    await prisma.phoneVerification.delete({ where: { id: row.id } }).catch(() => undefined);
    throw new AppError("Could not send the verification code", 502, "SMS_SEND_FAILED", true);
  }

  return {
    phone: input.phone,
    expiresInSeconds: Math.round(OTP_TTL_MS / 1000),
    resendAvailableInSeconds: Math.round(OTP_RESEND_COOLDOWN_MS / 1000),
    remainingAttempts: OTP_MAX_ATTEMPTS,
  };
}

/**
 * Checks the submitted code against the latest row for (userId, phone) — only
 * the newest code is ever authoritative (FR-007). Success deletes the row and
 * moves `phone` + `phoneVerified` together in one transaction (FR-011), the
 * exact inverse of the users-module phone-change reset. Failures are uniform
 * and non-enumerating: nothing reveals whether a row exists for another phone.
 */
export async function verifyOtp(userId: string, input: VerifyOtpInput): Promise<VerifyOtpResult> {
  const row = await prisma.phoneVerification.findFirst({
    where: { userId, phone: input.phone },
    orderBy: { createdAt: "desc" },
  });
  if (!row) throw new AppError("Invalid or expired code", 400, "OTP_INVALID", true);
  if (row.expiresAt < new Date()) {
    throw new AppError("This code has expired. Request a new one", 400, "OTP_EXPIRED", true);
  }
  // A code whose attempts are spent stays rejected even for the correct code
  // (spec US-3 scenario 2, research D-4's rejection ladder).
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    throw new AppError("Too many failed attempts. Request a new code", 400, "OTP_ATTEMPTS_EXHAUSTED", true);
  }

  if (await bcrypt.compare(input.code, row.otpHash)) {
    await prisma.$transaction([
      prisma.phoneVerification.delete({ where: { id: row.id } }),
      prisma.user.update({ where: { id: userId }, data: { phone: input.phone, phoneVerified: true } }),
    ]);
    return { phone: input.phone, phoneVerified: true };
  }

  // Atomic conditional increment: a parallel pair of wrong submissions cannot
  // both consume the same attempt (race-free cap, research D-4).
  const bumped = await prisma.phoneVerification.updateMany({
    where: { id: row.id, attempts: { lt: OTP_MAX_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });
  if (bumped.count === 0) {
    throw new AppError("Too many failed attempts. Request a new code", 400, "OTP_ATTEMPTS_EXHAUSTED", true);
  }

  const refreshed = await prisma.phoneVerification.findUnique({ where: { id: row.id } });
  throw new AppError("Invalid or expired code", 400, "OTP_INVALID", true, {
    remainingAttempts: Math.max(0, OTP_MAX_ATTEMPTS - (refreshed?.attempts ?? OTP_MAX_ATTEMPTS)),
  });
}
