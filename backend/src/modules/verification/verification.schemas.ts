import { egyptianPhoneSchema, normalizeDigits } from "../../shared/utils/phone.js";
import { z } from "zod";

/**
 * Both objects are `.strict()` (codebase convention): an unrecognised key is a
 * validation failure, not a silently dropped field.
 */

export const sendOtpSchema = z.object({ phone: egyptianPhoneSchema }).strict();

export const verifyOtpSchema = z
  .object({
    phone: egyptianPhoneSchema,
    code: z
      .string()
      .trim()
      .transform(normalizeDigits)
      .refine((value) => /^\d{6}$/.test(value), {
        message: "Enter the 6-digit code",
      }),
  })
  .strict();

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
