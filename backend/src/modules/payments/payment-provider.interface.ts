/**
 * Constitution Principle IV: online payment sits behind this interface so the
 * vendor can be replaced by configuration alone. Business rules never reference a
 * concrete provider — the orders module and the settlement transactions below
 * speak only these store-domain types.
 *
 * Deliberately provider-agnostic: no Paymob field name, status string, or unit
 * appears here. The adapter translates the vendor payload into these types, which
 * is what makes a future provider additive rather than a rewrite.
 */
export interface CreatePaymentInput {
  /** The store's own order number — echoed back on the provider callback. */
  orderNumber: string;
  /** Authoritative order total in MAJOR units (2-decimal EGP), never cents. */
  amount: number;
  currency: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    /** Snapshot address parts; adapters map only what their API requires. */
    address: {
      street: string;
      building: string | null;
      floor: string | null;
      apartment: string | null;
      city: string;
      state: string;
      country: string;
    };
  };
  /** Where the provider returns the customer after a successful attempt. Display only. */
  successUrl: string;
  /** Where the provider returns the customer after abandoning the attempt. Display only. */
  cancelUrl: string;
  /**
   * Absolute URL the provider posts settlement notifications to. Explicit rather
   * than derived from `successUrl`: the two are different endpoints with different
   * trust levels, and string-manipulating a display URL into a webhook address is
   * a mistake waiting to happen when a locale segment changes.
   */
  webhookUrl: string;
}

export interface CreatePaymentResult {
  /** Cross-origin hosted-checkout entry point the storefront navigates to. */
  redirectUrl: string;
  /**
   * The provider's own identifier for the session just created, stored in
   * `PaymentTransaction.providerTransactionId`. Note this is NOT what the
   * callback correlates on — see `WebhookOutcome.merchantOrderId`.
   */
  providerReference: string;
  /** Absolute expiry of the provider session, when the provider reports one. */
  expiresAt: string | null;
}

export type WebhookOutcomeKind = "SUCCEEDED" | "FAILED" | "IGNORED";

export interface WebhookOutcome {
  kind: WebhookOutcomeKind;
  /**
   * The store's own order number, echoed by the provider from the reference we
   * supplied at initiation. This — not the provider's transaction id — is what
   * identifies the attempt to settle, because the provider reference does not
   * exist yet at initiation time.
   */
  merchantOrderId: string | null;
  /** Major units (EGP), converted from the provider's minor units by the adapter. */
  amount: number | null;
  currency: string | null;
  /** The provider's transaction id, recorded on the attempt for investigation. */
  providerTransactionId: string | null;
  /** Why the event was ignored (unrecognised type, still processing, …). */
  reason: string | null;
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /**
   * Verify the provider's signature over the exact bytes received and translate
   * the payload into a store-domain outcome. Must reject an unverifiable
   * signature — authenticity is this method's responsibility, never a session,
   * cookie, or header of our own choosing (FR-008).
   */
  parseWebhook(input: {
    rawBody: Buffer;
    headers: Record<string, string | string[] | undefined>;
    /** Parsed body for field extraction; the raw bytes above remain authoritative. */
    payload: unknown;
    /** Parsed query string — providers commonly deliver the signature here. */
    query: Record<string, string | undefined>;
  }): Promise<WebhookOutcome>;
}