/**
 * Single source of truth for order status transitions (spec FR-011, research.md D-1).
 *
 * Every state-changing path — customer cancellation, admin fulfillment, payment
 * webhook settlement, payment-window expiry — must validate through
 * `assertTransition` before writing. Terminal states have no outgoing edges.
 */

import { AppError } from "../../shared/errors.js";
import type { OrderStatus } from "./orders.types.js";

/** Who is allowed to perform a transition. */
export type TransitionActor = "CUSTOMER" | "ADMIN" | "SYSTEM";

/** One permitted edge: target status + the actors allowed to take it. */
export interface TransitionEdge {
  to: OrderStatus;
  actors: readonly TransitionActor[];
}

/**
 * Full transition table (data-model.md). Read as: TRANSITIONS[from] = allowed edges.
 *
 * - PENDING → CONFIRMED: admin COD confirmation or system payment success.
 * - PENDING → CANCELLED: customer, admin, or system (expiry).
 * - PENDING → FAILED: system (payment failure).
 * - CONFIRMED → PROCESSING / CANCELLED: admin / customer+admin.
 * - PROCESSING → SHIPPED / CANCELLED: admin only.
 * - SHIPPED → DELIVERED / RETURNED: admin only.
 * - DELIVERED → RETURNED: admin only.
 * - CANCELLED / FAILED / RETURNED: terminal.
 */
export const TRANSITIONS: Record<OrderStatus, readonly TransitionEdge[]> = {
  PENDING: [
    { to: "CONFIRMED", actors: ["ADMIN", "SYSTEM"] },
    { to: "CANCELLED", actors: ["CUSTOMER", "ADMIN", "SYSTEM"] },
    { to: "FAILED", actors: ["SYSTEM"] },
  ],
  CONFIRMED: [
    { to: "PROCESSING", actors: ["ADMIN"] },
    { to: "CANCELLED", actors: ["CUSTOMER", "ADMIN"] },
  ],
  PROCESSING: [
    { to: "SHIPPED", actors: ["ADMIN"] },
    { to: "CANCELLED", actors: ["ADMIN"] },
  ],
  SHIPPED: [
    { to: "DELIVERED", actors: ["ADMIN"] },
    { to: "RETURNED", actors: ["ADMIN"] },
  ],
  DELIVERED: [{ to: "RETURNED", actors: ["ADMIN"] }],
  CANCELLED: [],
  FAILED: [],
  RETURNED: [],
};

/** All statuses an order may move to from `from` (regardless of actor). */
export function allowedNextStatuses(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from].map((edge) => edge.to);
}

/**
 * Whether `actor` may move an order from `from` to `to`.
 * Used by every transition path; customer callers additionally pass through
 * `isCustomerCancellable` so admin-only branches stay unreachable from the storefront.
 */
export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
  actor: TransitionActor,
): boolean {
  return TRANSITIONS[from].some(
    (edge) => edge.to === to && edge.actors.includes(actor),
  );
}

/**
 * Throw a 409 error naming the valid next statuses when the
 * transition is not permitted. Never returns for invalid pairs.
 */
export function assertTransition(
  from: OrderStatus,
  to: OrderStatus,
  actor: TransitionActor,
  code = "CONFLICT",
): void {
  if (canTransition(from, to, actor)) return;
  const valid = allowedNextStatuses(from);
  const hint =
    valid.length > 0
      ? `Valid next statuses from ${from}: ${valid.join(", ")}.`
      : `Order is in terminal status ${from}; no further transitions are allowed.`;
  throw new AppError(
    `Cannot move order from ${from} to ${to}. ${hint}`,
    409,
    code,
    true,
    { from, to, actor, validNext: valid },
  );
}

/**
 * Customer self-service cancellation scope (spec FR-008/FR-009).
 * Customers may cancel only PENDING or CONFIRMED orders — never PROCESSING
 * or later, even though the matrix permits admin cancellation from PROCESSING.
 */
export function isCustomerCancellable(status: OrderStatus): boolean {
  return status === "PENDING" || status === "CONFIRMED";
}
