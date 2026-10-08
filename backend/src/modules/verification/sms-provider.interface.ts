/**
 * Constitution Principle IV: SMS delivery sits behind this interface so the
 * vendor can be replaced by configuration alone. Business rules never reference
 * a concrete provider.
 */
export interface SmsProvider {
  sendOtp(phone: string, otp: string): Promise<void>;
}
