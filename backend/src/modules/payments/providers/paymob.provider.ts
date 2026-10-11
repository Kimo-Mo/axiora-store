import { env } from "../../../config/env.js";
import { AppError } from "../../../shared/errors.js";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  WebhookOutcome,
} from "../payment-provider.interface.js";
import { verifyTransactionHmac } from "./paymob-hmac.js";

/**
 * Paymob Accept hosted-checkout adapter (research D-8).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * VERIFIED FIELD SHAPES — research D-8 verification checklist (T003)
 * Retrieved 2026-10-08 from developers.paymob.com (Getting Started → Overview,
 * APIs integration path, Intention APIs → Create Intention, Webhook callbacks &
 * HMAC → HMAC Transaction Callback). Confirmed against the vendor's own Node
 * reference implementation and a third-party OpenAPI mirror; where they disagreed
 * the vendor's reference won (noted at the auth header below).
 *
 * 1. INTENTION REQUEST — `POST {baseUrl}v1/intention`
 *    - `amount`          integer, in CENTS (10000 = 100.00 EGP) — not major units.
 *    - `currency`        must match the currency configured on the Integration ID.
 *    - `payment_methods` Integration ID(s) as integers; their test/live status
 *                        must match the Secret Key in use.
 *    - `items[]`         each needs `name` + `amount`; the sum MUST equal `amount`.
 *    - `billing_data`    `phone_number` is REQUIRED (omitting it is a 400); the rest
 *                        are optional. `country` is ISO 3166-1 alpha-3 ("EGY").
 *    - `special_reference` our order number; returned as `merchant_order_id`.
 *    - `notification_url`  webhook endpoint — Card Integration IDs only.
 *    - `redirection_url`   post-payment redirect — Card/Wallet only, and
 *                        explicitly NOT authenticated, so it is display-only here.
 *    - `expiration`      seconds (vendor default 3600).
 *
 * 2. RESPONSE — the field that matters is `client_secret` (plus `id`,
 *    `intention_order_id`, `status`).
 *
 * 3. CREDENTIALS — the flow needs ALL FIVE env keys: API Key (mint an auth
 *    token), Secret Key (call the Intention API), Public Key (build the hosted
 *    URL), Integration ID (allowed methods), HMAC Secret (verify callbacks).
 *    The HMAC Secret is a SEPARATE secret from the API/Secret/Public keys.
 *
 * 4. HOSTED CHECKOUT URL —
 *    `{baseUrl}unifiedcheckout/?publicKey={PUBLIC_KEY}&clientSecret={client_secret}`
 *    The Public Key belongs in the URL (the vendor documents it as safe to
 *    expose); the Secret Key never leaves the backend. `client_secret` is
 *    single-use, so each attempt needs its own intention.
 *
 * 5. TRANSACTION WEBHOOK — body is `{ "obj": { … } }`, signature in the `hmac`
 *    QUERY parameter, HMAC-SHA512 over 20 concatenated fields (see
 *    `paymob-hmac.ts` for the exact order).
 *    Settlement fields: `obj.success`, `obj.pending`, `obj.amount_cents`,
 *    `obj.currency`, `obj.merchant_order_id` (our `special_reference`),
 *    `obj.id`, `obj.order.id`, `obj.data.message`, `obj.txn_response_code`.
 *
 * 6. DUPLICATE DELIVERY — the vendor retries callbacks on their own schedule,
 *    so delivery is assumed to repeat. Settlement must therefore be driven by
 *    state predicates, never by "have I seen this one before" (research D-4).
 *
 * NOTE: the payload carries a masked PAN (`source_data.pan`). This is why the
 * raw callback is never logged — it would put partial cardholder data in the
 * logs (FR/NFR-003).
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Egypt regional base URL. A regional fact, not a tuning knob (research D-8). */
const PAYMOB_BASE_URL = "https://accept.paymob.com";
const AUTH_TOKEN_PATH = "/api/auth/tokens";
const INTENTION_PATH = "/v1/intention";
/** Vendor's documented auth-token lifetime. */
const AUTH_TOKEN_TTL_MS = 60 * 60 * 1000;

/**
 * The Intention API accepts either a `Token` or a `Bearer` prefix; the vendor's
 * own reference implementation uses `Token`, so that is what this adapter sends.
 * A 401 from this endpoint with otherwise-valid credentials is the signal to
 * check here first.
 */
const AUTH_SCHEME = "Token";

/** Guard so a provider outage cannot exhaust the Node fetch pool indefinitely. */
const REQUEST_TIMEOUT_MS = 10_000;

/** ISO 3166-1 alpha-3. `billing_data.country` expects this, not "EG". */
const COUNTRY_ISO3 = "EGY";

/**
 * Parsed integration IDs. The vendor takes `payment_methods` as an array of
 * integers, so a merchant may enable several methods; the env var accepts a
 * comma-separated list for that.
 */
function integrationIds(): number[] {
  return (env.PAYMOB_INTEGRATION_ID ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);
}

/**
 * Split a snapshot full name. The Intention API wants `first_name`/`last_name`
 * separately, and only `phone_number` is actually mandatory — so an unsplittable
 * name degrades to an empty last name rather than failing the payment.
 */
function splitFullName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: "", last_name: "" };
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  return { first_name: parts.slice(0, -1).join(" "), last_name: parts[parts.length - 1] };
}

/** EGP has no minor unit in practice, but the API is cent-based regardless. */
function toCents(amount: number): number {
  return Math.round(amount * 100);
}

function toMajorUnits(amountCents: number): number {
  return amountCents / 100;
}

/** Mint a short-lived auth token from the API Key. */
async function fetchAuthToken(): Promise<string> {
  const response = await fetch(`${PAYMOB_BASE_URL}${AUTH_TOKEN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: env.PAYMOB_API_KEY }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new AppError("Could not start the payment", 502, "PAYMENT_PROVIDER_ERROR", true);
  }
  const body = (await response.json()) as { token?: string };
  if (!body.token) {
    throw new AppError("Could not start the payment", 502, "PAYMENT_PROVIDER_ERROR", true);
  }
  return body.token;
}

/**
 * Cache the auth token for its lifetime. Minting one per initiation would double
 * the provider round-trips on the checkout path for a token that is valid for an
 * hour.
 */
let cachedAuthToken: { token: string; expiresAt: number } | null = null;

async function getAuthToken(): Promise<string> {
  const now = Date.now();
  if (cachedAuthToken && cachedAuthToken.expiresAt > now) {
    return cachedAuthToken.token;
  }
  const token = await fetchAuthToken();
  cachedAuthToken = { token, expiresAt: now + AUTH_TOKEN_TTL_MS };
  return token;
}

interface PaymobIntentionResponse {
  id?: string;
  client_secret?: string;
  intention_order_id?: string | number;
  status?: string;
}

export const paymobProvider: PaymentProvider = {
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const amountCents = toCents(input.amount);
    const { first_name, last_name } = splitFullName(input.customer.fullName);

    // `items` is required and its amounts must sum to the top-level `amount`.
    // A single line for the order total satisfies both without inventing line
    // detail the provider has no use for.
    const intention = {
      amount: amountCents,
      currency: input.currency,
      payment_methods: integrationIds(),
      items: [
        {
          name: `Order ${input.orderNumber}`,
          amount: amountCents,
          quantity: 1,
        },
      ],
      billing_data: {
        first_name,
        last_name,
        email: input.customer.email,
        phone_number: input.customer.phone,
        street: input.customer.address.street,
        building: input.customer.address.building ?? "NA",
        floor: input.customer.address.floor ?? "NA",
        apartment: input.customer.address.apartment ?? "NA",
        city: input.customer.address.city,
        state: input.customer.address.state,
        country: input.customer.address.country || COUNTRY_ISO3,
      },
      // The correlation key: the callback returns this as `merchant_order_id`.
      special_reference: input.orderNumber,
      notification_url: input.webhookUrl,
      redirection_url: input.successUrl,
    };

    const token = await getAuthToken();
    const response = await fetch(`${PAYMOB_BASE_URL}${INTENTION_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${AUTH_SCHEME} ${token}`,
      },
      body: JSON.stringify(intention),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      // The provider's error body is deliberately not propagated: it can echo
      // back request fields, and the caller learns nothing actionable from it.
      throw new AppError("Could not start the payment", 502, "PAYMENT_PROVIDER_ERROR", true);
    }

    const created = (await response.json()) as PaymobIntentionResponse;
    const clientSecret = created.client_secret;
    if (!clientSecret) {
      throw new AppError("Could not start the payment", 502, "PAYMENT_PROVIDER_ERROR", true);
    }

    const params = new URLSearchParams({
      publicKey: env.PAYMOB_PUBLIC_KEY ?? "",
      clientSecret,
    });

    return {
      redirectUrl: `${PAYMOB_BASE_URL}/unifiedcheckout/?${params.toString()}`,
      providerReference:
        created.intention_order_id !== undefined
          ? String(created.intention_order_id)
          : (created.id ?? clientSecret),
      expiresAt: null,
    };
  },

  async parseWebhook(input): Promise<WebhookOutcome> {
    const payload = input.payload as { obj?: Record<string, unknown> } | undefined;
    const callback = payload?.obj;

    // No transaction object → nothing to authenticate or act on. Answered as
    // IGNORED (a 200) rather than 400 so an unrecognised callback shape does not
    // provoke a retry storm.
    if (!callback || typeof callback !== "object") {
      return {
        kind: "IGNORED",
        merchantOrderId: null,
        amount: null,
        currency: null,
        providerTransactionId: null,
        reason: "NO_TRANSACTION_OBJECT",
      };
    }

    // Authenticity gate. Nothing below this line may be trusted until it passes.
    if (!verifyTransactionHmac(callback, input.query.hmac, env.PAYMOB_HMAC_SECRET ?? "")) {
      throw new AppError("Invalid payment notification", 401, "WEBHOOK_SIGNATURE_INVALID", true);
    }

    const amountCents = typeof callback.amount_cents === "number" ? callback.amount_cents : null;
    const currency = typeof callback.currency === "string" ? callback.currency : null;
    const merchantOrderId =
      typeof callback.merchant_order_id === "string" && callback.merchant_order_id.length > 0
        ? callback.merchant_order_id
        : null;
    const providerTransactionId = typeof callback.id === "string" ? callback.id : null;

    // A transaction that is still processing is not an outcome. The vendor sends
    // a further callback once it settles, so settling on this one would confirm
    // an order against a payment that has not actually completed.
    if (callback.pending === true) {
      return {
        kind: "IGNORED",
        merchantOrderId,
        amount: amountCents === null ? null : toMajorUnits(amountCents),
        currency,
        providerTransactionId,
        reason: "TRANSACTION_PENDING",
      };
    }

    if (callback.success === true) {
      return {
        kind: "SUCCEEDED",
        merchantOrderId,
        amount: amountCents === null ? null : toMajorUnits(amountCents),
        currency,
        providerTransactionId,
        reason: null,
      };
    }

    if (callback.success === false) {
      return {
        kind: "FAILED",
        merchantOrderId,
        amount: amountCents === null ? null : toMajorUnits(amountCents),
        currency,
        providerTransactionId,
        reason:
          typeof (callback.data as { message?: unknown } | undefined)?.message === "string"
            ? String((callback.data as { message: string }).message)
            : "PROVIDER_DECLINED",
      };
    }

    // Anything else (refund/void events, a payload shape we do not model) is
    // recorded and left alone — see research D-5.
    return {
      kind: "IGNORED",
      merchantOrderId,
      amount: amountCents === null ? null : toMajorUnits(amountCents),
      currency,
      providerTransactionId,
      reason: "UNRECOGNISED_EVENT",
    };
  },
};