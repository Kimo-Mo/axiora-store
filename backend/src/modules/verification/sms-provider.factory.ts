import { env } from "../../config/env.js";
import { mockSmsProvider } from "./providers/mock.provider.js";
import type { SmsProvider } from "./sms-provider.interface.js";

/**
 * Resolves the provider named by the `SMS_PROVIDER` env var. The env schema
 * only admits known values, so reaching the default arm is impossible at
 * runtime — it exists to exhaust the switch.
 */
export function getSmsProvider(): SmsProvider {
  switch (env.SMS_PROVIDER) {
    case "mock":
      return mockSmsProvider;
    default:
      throw new Error(`Unknown SMS_PROVIDER: ${env.SMS_PROVIDER}`);
  }
}
