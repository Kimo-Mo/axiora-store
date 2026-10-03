import { z } from "zod";
import { PASSWORD_MAX_BYTES, PASSWORD_MIN_LENGTH } from "../../shared/utils/password.js";

/**
 * Every object is `.strict()` so an unrecognised key is a validation failure.
 * For the profile patch that is load-bearing: sending `email` or `username` must
 * produce a field-named error, not be silently dropped, because a customer told
 * nothing would believe the change succeeded.
 */

const email = z.string().trim().toLowerCase().email().max(254);

const fullName = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters")
  .max(100, "Full name must be at most 100 characters");

/** Accepts +20 followed by 10 digits, tolerating spaces and hyphens. */
const phone = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .refine((value) => /^(\+?20)?1[0125]\d{8}$/.test(value), {
    message: "Enter a valid Egyptian mobile number",
  });

/** `null` and `""` both mean "no phone on file"; absent means "leave it alone". */
const optionalPhone = z
  .union([phone, z.literal(""), z.null()])
  .transform((value) => value || null)
  .optional();

/**
 * `null` and `""` both mean "no value on file", and an absent key must also pass —
 * a customer who skips the landmark field sends no key at all, which a bare union
 * would reject as "Invalid input".
 */
const optionalText = (max: number) =>
  z
    .union([z.string().trim().max(max), z.literal(""), z.null()])
    .transform((value) => value || null)
    .optional();

export const updateProfileSchema = z
  .object({
    fullName: fullName.optional(),
    phone: optionalPhone.optional(),
  })
  .strict()
  .refine((data) => data.fullName !== undefined || data.phone !== undefined, {
    message: "Provide at least one field to update",
    path: [],
  });

const addressRequired = {
  fullName: z.string().trim().min(2, "Recipient name is required").max(100),
  phone,
  governorate: z.string().trim().min(2, "Governorate is required").max(60),
  city: z.string().trim().min(2, "City is required").max(80),
  street: z.string().trim().min(2, "Street is required").max(160),
};

const addressOptional = {
  label: optionalText(40),
  area: optionalText(80),
  building: optionalText(20),
  floor: optionalText(10),
  apartment: optionalText(20),
  landmark: optionalText(160),
  notes: optionalText(240),
};

export const createAddressSchema = z.object({ ...addressRequired, ...addressOptional }).strict();

export const updateAddressSchema = z
  .object({
    ...addressRequired,
    ...addressOptional,
    isDefault: z.boolean().optional(),
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
    path: [],
  });

export const addressIdSchema = z.object({ id: z.string().uuid("Invalid address id") });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

export { PASSWORD_MAX_BYTES, PASSWORD_MIN_LENGTH };
