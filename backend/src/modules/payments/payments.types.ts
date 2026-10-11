/**
 * Payment DTOs (data-model.md §5.1).
 *
 * Store-facing shapes only — no provider types. Keep in sync with
 * `frontend/src/types/payment.ts`.
 */

export type StorePaymentMethod = "COD" | "ONLINE";

export interface PaymentMethodAvailabilityDto {
  method: StorePaymentMethod;
  enabled: boolean;
}

export interface PaymentMethodsDto {
  methods: PaymentMethodAvailabilityDto[];
  currency: string;
}

export interface InitiatePaymentDto {
  orderNumber: string;
  /** Provider hosted-checkout entry point; navigate the browser to this URL. */
  redirectUrl: string;
  /** True when an already-active session was returned instead of a new one (FR-005). */
  reused: boolean;
  /** ISO expiry of the returned session, when one is known. */
  expiresAt: string | null;
}

/**
 * How one verified webhook delivery was applied. Not exposed to customers — it
 * is the internal vocabulary of the settlement path (research D-4/D-5).
 *
 *   applied-success     order moved to CONFIRMED/PAID
 *   applied-failure     order moved to FAILED/FAILED, stock released
 *   duplicate           attempt was already terminal; no-op (FR-012)
 *   needs-review        authentic but not settleable (amount mismatch, late payment)
 *   ignored             unrecognised event, or an unknown attempt reference
 */
export type SettlementResultKind =
  | "applied-success"
  | "applied-failure"
  | "duplicate"
  | "needs-review"
  | "ignored";

export interface SettlementResult {
  kind: SettlementResultKind;
  /** Present whenever the attempt was located; used for log correlation only. */
  orderNumber?: string;
  /** Why a delivery was not settleable. Logged, never returned to the caller. */
  reason?: string;
}