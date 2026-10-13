import { Prisma } from "@prisma/client";
import { FRONTEND_ORIGIN } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { AppError, NotFoundError, ValidationError } from "../../shared/errors.js";
import { logSecurityEvent } from "../../shared/logger.js";
import { round2 } from "../../shared/utils/currency.js";
import { releaseOrderReservations } from "../orders/orders.service.js";
import { DEFAULT_CURRENCY, type PaymentMethod } from "../orders/orders.types.js";
import {
  getPaymentProvider,
  isPaymentProviderConfigured,
} from "./payment-provider.factory.js";
import type { CreatePaymentInput } from "./payment-provider.interface.js";
import type { InitiatePaymentInput } from "./payments.schemas.js";
import type {
  InitiatePaymentDto,
  PaymentMethodAvailabilityDto,
  PaymentMethodsDto,
  SettlementResult,
  StorePaymentMethod,
} from "./payments.types.js";

/** Fallback when the expiry setting is absent or malformed (research D-2/D-7). */
const DEFAULT_EXPIRY_MINUTES = 30;
/** Minutes a setting value may hold before it is treated as malformed. */
const MAX_EXPIRY_MINUTES = 24 * 60;

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/** An attempt row with the order items needed to release its reservation. */
const settlementInclude = {
  order: { include: { items: true } },
} satisfies Prisma.PaymentTransactionInclude;

// ── Settings (business toggles — constitution Principle IV) ──────────────────

/**
 * Payment-method enablement from `Setting.PAYMENT_METHODS_ENABLED`.
 *
 * An absent or malformed setting degrades to "the method is off" rather than
 * throwing: a storefront that cannot read a business setting should offer less,
 * not fail to load.
 */
async function getEnabledMethodFlags(): Promise<Record<StorePaymentMethod, boolean>> {
  const setting = await prisma.setting.findUnique({ where: { key: "PAYMENT_METHODS_ENABLED" } });
  const value = setting?.value;
  const read = (method: StorePaymentMethod): boolean =>
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)[method] === true
      : false;
  return { COD: read("COD"), ONLINE: read("ONLINE") };
}

/**
 * Online availability = the business flag AND the technical capability
 * (credentials present). Both are required — see `isPaymentProviderConfigured`.
 */
export async function isOnlinePaymentEnabled(): Promise<boolean> {
  const flags = await getEnabledMethodFlags();
  return flags.ONLINE && isPaymentProviderConfigured();
}

/** Abandoned-payment window in minutes (research D-2). */
async function getExpiryMinutes(): Promise<number> {
  const setting = await prisma.setting.findUnique({ where: { key: "ONLINE_PAYMENT_EXPIRY_MINUTES" } });
  const value = setting?.value;
  const minutes =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as { minutes?: unknown }).minutes
      : undefined;
  if (typeof minutes !== "number" || !Number.isFinite(minutes) || minutes <= 0) {
    return DEFAULT_EXPIRY_MINUTES;
  }
  return Math.min(Math.round(minutes), MAX_EXPIRY_MINUTES);
}

// ── Payment-method listing (FR-016) ─────────────────────────────────────────

export async function listEnabledMethods(): Promise<PaymentMethodsDto> {
  const flags = await getEnabledMethodFlags();
  const methods: PaymentMethodAvailabilityDto[] = [
    { method: "COD" as PaymentMethod, enabled: flags.COD },
    // The flag alone would offer a payment the backend cannot complete.
    { method: "ONLINE" as PaymentMethod, enabled: flags.ONLINE && isPaymentProviderConfigured() },
  ];
  return { methods, currency: DEFAULT_CURRENCY };
}

// ── Initiation (FR-003/FR-005/FR-006, research D-1) ─────────────────────────

/** Read a stored redirect URL out of an attempt's metadata blob. */
function storedRedirectUrl(metadata: Prisma.JsonValue | null): string | null {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const url = (metadata as { redirectUrl?: unknown }).redirectUrl;
    return typeof url === "string" && url.length > 0 ? url : null;
  }
  return null;
}

/** Merge keys onto an attempt's metadata without discarding what is already there. */
function withMetadata(
  existing: Prisma.JsonValue | null,
  additions: Record<string, string | number | boolean>,
): Prisma.InputJsonObject {
  const base =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? (existing as Record<string, Prisma.InputJsonValue>)
      : {};
  return { ...base, ...additions };
}

export async function initiatePayment(
  userId: string,
  input: InitiatePaymentInput,
): Promise<InitiatePaymentDto> {
  // Ownership-scoped: a foreign order number is indistinguishable from an unknown
  // one, so this endpoint is not an existence oracle for other customers' orders.
  const order = await prisma.order.findFirst({
    where: { orderNumber: input.orderNumber, userId },
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (!(await isOnlinePaymentEnabled())) {
    logSecurityEvent("payment.initiation.rejected", "rejected", "ONLINE_PAYMENT_UNAVAILABLE", {
      actor: userId,
      role: "CUSTOMER",
      detail: { orderNumber: order.orderNumber },
    });
    throw new AppError(
      "Online payment is currently unavailable",
      409,
      "ONLINE_PAYMENT_UNAVAILABLE",
      true,
    );
  }

  if (
    order.paymentMethod !== "ONLINE" ||
    order.status !== "PENDING" ||
    order.paymentStatus !== "PENDING"
  ) {
    logSecurityEvent("payment.initiation.rejected", "rejected", "PAYMENT_NOT_ATTEMPTABLE", {
      actor: userId,
      role: "CUSTOMER",
      detail: { orderNumber: order.orderNumber, status: order.status },
    });
    throw new AppError(
      "This order is not awaiting payment",
      409,
      "PAYMENT_NOT_ATTEMPTABLE",
      true,
    );
  }

  const timeoutMinutes = await getExpiryMinutes();
  const latestAttempt = await prisma.paymentTransaction.findFirst({
    where: { orderId: order.id },
    orderBy: { createdAt: "desc" },
  });

  // One active session per order (FR-005). Returning the existing session is what
  // makes "never charged twice" structurally true: two payable sessions cannot
  // coexist, so a double-clicked "Pay now" cannot become two charges.
  const reuseUrl = latestAttempt?.status === "PENDING" ? storedRedirectUrl(latestAttempt.metadata) : null;
  const windowEndsAt = latestAttempt
    ? new Date(latestAttempt.createdAt.getTime() + timeoutMinutes * 60_000)
    : null;
  if (reuseUrl && windowEndsAt && windowEndsAt > new Date()) {
    return {
      orderNumber: order.orderNumber,
      redirectUrl: reuseUrl,
      reused: true,
      expiresAt: windowEndsAt.toISOString(),
    };
  }

  const account = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!account) {
    throw new NotFoundError("Order not found");
  }

  const snapshot = order.shippingAddressSnapshot as unknown as {
    fullName?: string;
    phone?: string;
    street?: string;
    building?: string | null;
    floor?: string | null;
    apartment?: string | null;
    city?: string;
    governorate?: string;
  };

  const locale = input.locale ?? "ar";
  const returnQuery = `?order=${encodeURIComponent(order.orderNumber)}`;
  const createInput: CreatePaymentInput = {
    orderNumber: order.orderNumber,
    amount: round2(Number(order.total)),
    currency: order.currency,
    customer: {
      fullName: snapshot.fullName ?? "",
      email: account.email,
      phone: snapshot.phone ?? "",
      address: {
        street: snapshot.street ?? "",
        building: snapshot.building ?? null,
        floor: snapshot.floor ?? null,
        apartment: snapshot.apartment ?? null,
        city: snapshot.city ?? "",
        state: snapshot.governorate ?? "",
        country: "EGY",
      },
    },
    successUrl: `${FRONTEND_ORIGIN}/${locale}/payment-success${returnQuery}`,
    cancelUrl: `${FRONTEND_ORIGIN}/${locale}/payment-cancel${returnQuery}`,
    webhookUrl: `${FRONTEND_ORIGIN}/api/v1/payments/webhook`,
  };

  const created = await getPaymentProvider().createPayment(createInput);

  // Derived from the order's own history rather than from the request: a second
  // initiation for an order that already has an attempt is a retry by definition,
  // whether it comes from the confirmation screen or a re-visit to checkout. The
  // request carries no source flag because a client-supplied one would be a lie the
  // server would have to trust.
  const isRetry = Boolean(latestAttempt);

  // Persisted only after the provider call succeeded, so a provider outage leaves
  // no phantom session row to mislead the reuse branch.
  const attempt = await prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      provider: "paymob",
      providerTransactionId: created.providerReference,
      amount: order.total,
      currency: order.currency,
      status: "PENDING",
      metadata: {
        redirectUrl: created.redirectUrl,
        initiatedFrom: isRetry ? "retry" : "checkout",
        locale,
      },
    },
  });

  const expiresAt = new Date(attempt.createdAt.getTime() + timeoutMinutes * 60_000).toISOString();
  return {
    orderNumber: order.orderNumber,
    redirectUrl: created.redirectUrl,
    reused: false,
    expiresAt: created.expiresAt ?? expiresAt,
  };
}

// ── Webhook settlement (research D-3/D-4/D-5) ───────────────────────────────

export interface WebhookRequest {
  rawBody: Buffer;
  headers: Record<string, string | string[] | undefined>;
  payload: unknown;
  query: Record<string, string | undefined>;
}

export async function handleWebhook(request: WebhookRequest): Promise<SettlementResult> {
  // A signature failure throws a 401 from inside the adapter and is logged by the
  // controller; no state is read or written on that path.
  const outcome = await getPaymentProvider().parseWebhook(request);

  if (outcome.kind === "IGNORED") {
    logSecurityEvent("payment.webhook.ignored", "denied", "PAYMENT_NOT_ATTEMPTABLE", {
      detail: { reason: outcome.reason ?? "UNRECOGNISED_EVENT" },
    });
    return { kind: "ignored", reason: outcome.reason ?? "UNRECOGNISED_EVENT" };
  }

  const orderNumber = outcome.merchantOrderId;
  if (!orderNumber) {
    // Authentic but uncorrelatable. Recorded, never applied.
    logSecurityEvent("payment.webhook.ignored", "denied", "PAYMENT_NOT_ATTEMPTABLE", {
      detail: { reason: "MISSING_MERCHANT_ORDER_ID" },
    });
    return { kind: "ignored", reason: "MISSING_MERCHANT_ORDER_ID" };
  }

  const order = await prisma.order.findFirst({ where: { orderNumber } });
  if (!order) {
    logSecurityEvent("payment.webhook.ignored", "denied", "PAYMENT_NOT_ATTEMPTABLE", {
      detail: { orderNumber, reason: "UNKNOWN_ORDER" },
    });
    return { kind: "ignored", orderNumber, reason: "UNKNOWN_ORDER" };
  }

  const attempt = await prisma.paymentTransaction.findFirst({
    where: { orderId: order.id },
    orderBy: { createdAt: "desc" },
    include: settlementInclude,
  });

  if (!attempt || attempt.status !== "PENDING") {
    // Already terminal, or never initiated: a duplicate delivery or a superseded
    // attempt. Both are no-ops (FR-012).
    logSecurityEvent("payment.webhook.processed", "success", "OK", {
      detail: { orderNumber, reason: "NO_PENDING_ATTEMPT" },
    });
    return { kind: "duplicate", orderNumber, reason: "NO_PENDING_ATTEMPT" };
  }

  // Amount reconciliation happens before anything is confirmed (FR-011). The
  // attempt records the discrepancy for review and the order is left alone.
  if (
    outcome.amount !== null &&
    (round2(outcome.amount) !== round2(Number(order.total)) ||
      (outcome.currency ?? order.currency) !== order.currency)
  ) {
    await prisma.paymentTransaction.update({
      where: { id: attempt.id },
      data: {
        metadata: withMetadata(attempt.metadata, {
          requiresReview: true,
          reason: "AMOUNT_MISMATCH",
          expected: String(round2(Number(order.total))),
          received: String(round2(outcome.amount)),
        }),
      },
    });
    logSecurityEvent("payment.webhook.processed", "denied", "AMOUNT_MISMATCH", {
      detail: { orderNumber },
    });
    return { kind: "needs-review", orderNumber, reason: "AMOUNT_MISMATCH" };
  }

  return outcome.kind === "SUCCEEDED"
    ? settleSuccess(attempt, order, outcome.providerTransactionId)
    : settleFailure(attempt, order, outcome.reason);
}

type PendingAttempt = Prisma.PaymentTransactionGetPayload<{ include: typeof settlementInclude }>;
type AwaitingOrder = { id: string; total: Prisma.Decimal; currency: string };

/**
 * Verified success. Confirms the order; stock is deliberately NOT touched — the
 * reservation is retained until fulfilment converts reserved → sold (constitution
 * Principle III).
 */
async function settleSuccess(
  attempt: PendingAttempt,
  order: AwaitingOrder,
  providerTransactionId: string | null,
): Promise<SettlementResult> {
  const orderNumber = attempt.order.orderNumber;

  const applied = await prisma.$transaction(async (tx) => {
    // Conditional transition on the current attempt status — the idempotency
    // primitive. Zero rows means a concurrent delivery already settled it.
    const attemptUpdate = await tx.paymentTransaction.updateMany({
      where: { id: attempt.id, status: "PENDING" },
      data: {
        status: "SUCCESS",
        ...(providerTransactionId ? { providerTransactionId } : {}),
        metadata: withMetadata(attempt.metadata, { settledAt: new Date().toISOString() }),
      },
    });
    if (attemptUpdate.count === 0) return false;

    const orderUpdate = await tx.order.updateMany({
      where: { id: order.id, status: "PENDING", paymentStatus: "PENDING" },
      data: { status: "CONFIRMED", paymentStatus: "PAID" },
    });

    if (orderUpdate.count === 0) {
      // The order left the awaiting state before this delivery. If a customer
      // cancelled it first (Phase 11 FR-008/FR-016), the captured money is
      // recorded as a refund owed — the order itself stays CANCELLED and the
      // original attempt row keeps its SUCCESS state plus this marker.
      const current = await tx.order.findUnique({
        where: { id: order.id },
        select: { status: true, paymentStatus: true },
      });
      if (current?.status === "CANCELLED" && current.paymentStatus !== "REFUNDED") {
        await tx.order.update({ where: { id: order.id }, data: { paymentStatus: "REFUNDED" } });
        await tx.paymentTransaction.create({
          data: {
            orderId: order.id,
            provider: "manual",
            amount: order.total,
            currency: order.currency,
            status: "REFUNDED",
            metadata: { reason: "late_payment_after_cancel", settlesAttempt: attempt.id },
          },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: "CANCELLED",
            actor: "SYSTEM",
            note: "Late payment recorded as refund owed",
          },
        });
        return { refundOwed: true };
      }
      // Money was captured against an order that had already closed. Record the
      // attempt as a success that needs a human, and never resurrect the order
      // (research D-5 / FR-015).
      await tx.paymentTransaction.update({
        where: { id: attempt.id },
        data: {
          metadata: withMetadata(attempt.metadata, {
            requiresReview: true,
            reason: "ORDER_ALREADY_CLOSED",
          }),
        },
      });
      return { refundOwed: false };
    }

    await tx.orderStatusHistory.create({
      data: { orderId: order.id, status: "CONFIRMED", actor: "SYSTEM", note: "Payment confirmed" },
    });
    return true;
  });

  if (applied === false) {
    logSecurityEvent("payment.webhook.processed", "denied", "ORDER_NOT_IN_AWAITABLE_STATE", {
      detail: { orderNumber },
    });
    return { kind: "needs-review", orderNumber, reason: "ORDER_ALREADY_CLOSED" };
  }
  if (typeof applied === "object" && applied.refundOwed) {
    logSecurityEvent("payment.webhook.processed", "success", "REFUND_OWED", {
      detail: { orderNumber },
    });
    return { kind: "needs-review", orderNumber, reason: "REFUND_OWED" };
  }

  logSecurityEvent("payment.webhook.processed", "success", "OK", {
    detail: { orderNumber },
  });
  return { kind: "applied-success", orderNumber };
}

/** Verified failure: fail the order and release its reservation atomically. */
async function settleFailure(
  attempt: PendingAttempt,
  order: AwaitingOrder,
  reason: string | null,
): Promise<SettlementResult> {
  const orderNumber = attempt.order.orderNumber;

  const applied = await prisma.$transaction(async (tx) => {
    const attemptUpdate = await tx.paymentTransaction.updateMany({
      where: { id: attempt.id, status: "PENDING" },
      data: {
        status: "FAILED",
        metadata: withMetadata(attempt.metadata, { providerStatus: reason ?? "PROVIDER_DECLINED" }),
      },
    });
    if (attemptUpdate.count === 0) return false;

    const orderUpdate = await tx.order.updateMany({
      where: { id: order.id, status: "PENDING", paymentStatus: "PENDING" },
      data: { status: "FAILED", paymentStatus: "FAILED" },
    });
    // Zero rows means the order had already left the awaiting state — the attempt
    // is still recorded as failed, but the order keeps whatever state it has.
    if (orderUpdate.count === 0) return false;

    await releaseOrderReservations(tx, attempt.order.items);
    await tx.orderStatusHistory.create({
      data: { orderId: order.id, status: "FAILED", actor: "SYSTEM", note: "Payment failed" },
    });
    return true;
  });

  logSecurityEvent(
    "payment.webhook.processed",
    applied ? "success" : "denied",
    applied ? "OK" : "ORDER_NOT_IN_AWAITABLE_STATE",
    { detail: { orderNumber } },
  );

  return applied
    ? { kind: "applied-failure", orderNumber }
    : { kind: "duplicate", orderNumber, reason: "ORDER_NOT_IN_AWAITABLE_STATE" };
}

/**
 * Re-exported for the expiry job, which shares the same window semantics and the
 * same stock-release implementation as the settlement path above.
 */
export { getExpiryMinutes };

/** Guards against a raw-body-less request reaching signature verification. */
export function assertRawBodyPresent(rawBody: Buffer | undefined): Buffer {
  if (!rawBody || rawBody.length === 0) {
    throw new ValidationError("Empty payment notification");
  }
  return rawBody;
}