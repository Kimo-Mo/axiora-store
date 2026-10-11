/**
 * Payment domain types (Phase 10 — Online Payments).
 *
 * Aligns with `backend/src/modules/payments/payments.types.ts` and
 * contracts/payment-api.md. All monetary values are 2-decimal major units
 * (EGP) — never the provider's cents.
 */

/** Widen this and mirror `PaymentMethod` in `backend/src/modules/orders/orders.types.ts`. */
export type StorePaymentMethod = 'COD' | 'ONLINE';

export interface PaymentMethodAvailabilityDto {
  method: StorePaymentMethod;
  enabled: boolean;
}

export interface PaymentMethodsDto {
  methods: PaymentMethodAvailabilityDto[];
  currency: string;
}

export interface InitiatePaymentResponse {
  orderNumber: string;
  /** Provider hosted-checkout entry point; navigate the browser to this URL. */
  redirectUrl: string;
  /** True when an already-active session was returned instead of a new one. */
  reused: boolean;
  expiresAt: string | null;
}