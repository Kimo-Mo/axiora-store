import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Paymob webhook signature verification (research D-8, verified against the
 * vendor's "HMAC Transaction Callback" documentation).
 *
 * The scheme is deliberately unforgiving, and every part below is load-bearing:
 *
 *  - **SHA-512**, not SHA-256.
 *  - Exactly 20 fields, concatenated with **no separator**, in the vendor's
 *    documented order — which is *not* alphabetical.
 *  - Values are stringified from the **raw received values**: a reformatted
 *    date, a rounded number, or a normalized boolean breaks the digest.
 *  - The signature arrives as the `hmac` **query parameter**, not a header and
 *    not a body field.
 *
 * This lives alone in its own file so the recipe has exactly one auditable
 * location: a mistake here is a silent authentication failure, and a future
 * provider must not be tempted to reuse it (principle IV).
 */

/**
 * The documented concatenation order for the Transaction Processed callback.
 * Indexed by dotted path into the callback body so a missing field is explicit
 * rather than silently skipped — a skipped field produces a valid-looking but
 * wrong digest, which is the worst possible failure for a signature check.
 */
const TRANSACTION_HMAC_FIELDS: readonly string[] = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order.id",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
] as const;

type CallbackObject = Record<string, unknown>;

/** Read a dotted path out of the callback object, or null when absent. */
function readPath(source: CallbackObject, path: string): unknown {
  let cursor: unknown = source;
  for (const segment of path.split(".")) {
    if (typeof cursor !== "object" || cursor === null) return null;
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return cursor ?? null;
}

/**
 * Stringify a raw callback value the way the vendor does.
 *
 * Booleans become `true`/`false` and numbers their plain form. `null`/`undefined`
 * become the empty string: the vendor still concatenates a slot for the field,
 * so omitting it entirely would shift every subsequent value.
 */
function stringifyField(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

/** Build the exact string the vendor signed. Exported for the manual checklist. */
export function buildTransactionHmacPayload(callback: CallbackObject): string {
  return TRANSACTION_HMAC_FIELDS.map((path) => stringifyField(readPath(callback, path))).join("");
}

/**
 * Verify a Transaction Processed callback signature.
 *
 * Returns false — never throws — for a missing or malformed signature, so the
 * caller can answer 401 without a provider-triggered retry storm.
 */
export function verifyTransactionHmac(
  callback: CallbackObject,
  receivedHmac: string | undefined,
  hmacSecret: string,
): boolean {
  if (!receivedHmac || !hmacSecret) return false;

  const computed = createHmac("sha512", hmacSecret)
    .update(buildTransactionHmacPayload(callback))
    .digest("hex");

  const received = receivedHmac.trim().toLowerCase();
  // `timingSafeEqual` throws on a length mismatch, and the length of a hex digest
  // is itself a fact about the secret — so compare lengths first and only then use
  // the constant-time comparison.
  if (received.length !== computed.length) return false;
  return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(received, "hex"));
}