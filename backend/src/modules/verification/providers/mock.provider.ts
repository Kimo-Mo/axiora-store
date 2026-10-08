import { isProduction } from "../../../config/env.js";
import { AppError } from "../../../shared/errors.js";
import type { SmsProvider } from "../sms-provider.interface.js";

/**
 * Development provider: prints the OTP to the server console so the manual
 * checklist works with zero cost and no carrier. Deliberately refuses to run
 * in production — a real vendor replaces it via `SMS_PROVIDER`, never silence.
 */
export const mockSmsProvider: SmsProvider = {
  async sendOtp(phone: string, otp: string): Promise<void> {
    if (isProduction) {
      throw new AppError("SMS provider is not configured", 502, "SMS_SEND_FAILED", true);
    }
    console.log(`[sms:mock] to ${phone}: code ${otp}`);
  },
};
