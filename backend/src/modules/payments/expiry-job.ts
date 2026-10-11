import { prisma } from "../../config/prisma.js";
import { logSecurityEvent } from "../../shared/logger.js";
import { releaseOrderReservations } from "../orders/orders.service.js";
import { getExpiryMinutes } from "./payments.service.js";

/**
 * Abandoned-payment expiry sweep (research D-6).
 *
 * An interval timer rather than a cron dependency: no scheduler exists in this
 * backend, and a timer that starts with the server is trivially observable and
 * resettable in development — which is exactly what the manual checklist needs.
 *
 * The interval is a constant, not an env knob: the *timeout* is a business setting
 * (`ONLINE_PAYMENT_EXPIRY_MINUTES`), but silently retuning how often the sweep runs
 * is not an operator decision — it is an implementation detail.
 */
const SWEEP_INTERVAL_MS = 60_000;

/**
 * Cap on orders settled per tick. A large backlog is worked through over several
 * ticks instead of producing one enormous transaction burst.
 */
const BATCH_SIZE = 50;

/**
 * Overlapping-tick guard. A sweep that runs longer than the interval must not be
 * started again on top of itself — correctness does not rely on this (the
 * conditional status predicate below is the real guard) but a self-inflicted
 * duplicate sweep is pure load.
 */
let ticking = false;

async function sweepOnce(): Promise<{ examined: number; cancelled: number }> {
  const timeoutMinutes = await getExpiryMinutes();
  // Read once per tick, not per order (research D-6).
  const timeoutMs = timeoutMinutes * 60_000;
  const now = Date.now();

  const candidates = await prisma.order.findMany({
    where: { paymentMethod: "ONLINE", status: "PENDING", paymentStatus: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: BATCH_SIZE,
    include: {
      items: true,
      transactions: { orderBy: { createdAt: "desc" as const }, take: 1 },
    },
  });

  let cancelled = 0;

  for (const order of candidates) {
    // Expiry reference is max(order.createdAt, latest attempt) so that
    // re-initiation restarts the window — a customer who clicks "Pay now" at
    // minute 29 must not be cancelled mid-card-entry (research D-2).
    const latestAttemptAt = order.transactions[0]?.createdAt?.getTime() ?? 0;
    const reference = Math.max(order.createdAt.getTime(), latestAttemptAt);
    if (reference + timeoutMs > now) continue;

    const latestAttempt = order.transactions[0];
    const settled = await prisma.$transaction(async (tx) => {
      // Conditional transition: whoever wins this predicate settles the order
      // exactly once, so a webhook racing this tick cannot both apply and cancel.
      const updated = await tx.order.updateMany({
        where: { id: order.id, status: "PENDING", paymentStatus: "PENDING" },
        data: { status: "CANCELLED", paymentStatus: "FAILED" },
      });
      if (updated.count === 0) return false;

      // An order can expire without ever having been initiated, so the attempt
      // update is conditional on one existing.
      if (latestAttempt && latestAttempt.status === "PENDING") {
        await tx.paymentTransaction.update({
          where: { id: latestAttempt.id },
          data: {
            status: "FAILED",
            metadata: { reason: "expired" },
          },
        });
      }

      await releaseOrderReservations(tx, order.items);
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: "CANCELLED", note: "Payment window expired" },
      });
      return true;
    });

    if (settled) cancelled += 1;
  }

  return { examined: candidates.length, cancelled };
}

/**
 * Start the sweep. Idempotent per process: calling it twice does not leave two
 * timers running, which matters because `tsx watch` re-executes `server.ts` on
 * every save in development.
 */
let jobStarted = false;

export function startPaymentExpiryJob(): void {
  if (jobStarted) return;
  jobStarted = true;

  const timer = setInterval(() => {
    if (ticking) return;
    ticking = true;
    void sweepOnce()
      .then(({ examined, cancelled }) => {
        // One summary event per tick carries the evidence that the sweep ran
        // (SC-005) without turning the log into one line per order (research D-12).
        logSecurityEvent("payment.expiry.swept", "success", "OK", {
          detail: { examined, cancelled },
        });
      })
      .catch(() => {
        // One bad order must never kill the schedule; the next tick retries.
      })
      .finally(() => {
        ticking = false;
      });
  }, SWEEP_INTERVAL_MS);

  // Do not hold the event loop open on its own account.
  timer.unref();
}