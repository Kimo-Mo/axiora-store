import { env } from "../../config/env.js";
import { paymobProvider } from "./providers/paymob.provider.js";
import type { PaymentProvider } from "./payment-provider.interface.js";

/**
 * Whether the configured provider has every credential it needs.
 *
 * This is the *technical* half of online availability; the `Setting` flag is the
 * *business* half, and both must hold before the storefront offers online payment
 * (research D-7). Using either alone produces a broken checkout — a method
 * offered that cannot complete, or a working method silently missing.
 *
 * Credentials are deliberately optional in the env schema so a developer machine
 * without merchant credentials still boots (and keeps COD working); this function
 * is what turns their absence into a reported "disabled" rather than a crash.
 */
export function isPaymentProviderConfigured(): boolean {
  switch (env.PAYMENT_PROVIDER) {
    case "paymob":
      return Boolean(
        env.PAYMOB_API_KEY &&
          env.PAYMOB_SECRET_KEY &&
          env.PAYMOB_PUBLIC_KEY &&
          env.PAYMOB_HMAC_SECRET &&
          (env.PAYMOB_INTEGRATION_ID ?? "").trim(),
      );
    default:
      return false;
  }
}

/**
 * Resolves the provider named by the `PAYMENT_PROVIDER` env var. The env schema
 * only admits known values, so reaching the default arm is impossible at
 * runtime — it exists to exhaust the switch.
 *
 * Callers must gate on `isPaymentProviderConfigured()` first: resolution does not
 * validate credentials, and a provider with absent keys fails on its first call
 * rather than here.
 */
export function getPaymentProvider(): PaymentProvider {
  switch (env.PAYMENT_PROVIDER) {
    case "paymob":
      return paymobProvider;
    default:
      throw new Error(`Unknown PAYMENT_PROVIDER: ${env.PAYMENT_PROVIDER}`);
  }
}