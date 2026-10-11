import { z } from "zod";

/**
 * Body of `POST /api/v1/payments/create`.
 *
 * `.strict()` so an unexpected key is a 400 rather than a silently ignored field:
 * this endpoint moves money, and a typo'd `order_number` must not look like a
 * caller who simply meant the correct field.
 */
export const InitiatePaymentSchema = z
  .object({
    orderNumber: z.string().trim().min(4).max(40),
    /**
     * Display routing only — it composes the success/cancel URLs handed to the
     * provider. It never influences amounts, eligibility, or any state transition
     * (research D-1); the server owns all of those.
     */
    locale: z.enum(["ar", "en"]).optional(),
  })
  .strict();

export type InitiatePaymentInput = z.infer<typeof InitiatePaymentSchema>;

/**
 * The webhook route intentionally has NO body schema.
 *
 * Its payload is provider-owned, and the provider — not this application — is
 * the authority on which fields exist (research D-5). The adapter verifies the
 * signature and extracts the handful of fields it needs, treating anything
 * unrecognised as `IGNORED`. Validating the body against a Zod schema here would
 * silently reject a future vendor field addition as a 400, which is the
 * provider's change breaking our settlement — the wrong failure direction.
 */