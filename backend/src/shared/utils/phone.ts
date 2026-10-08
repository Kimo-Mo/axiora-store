import { z } from "zod";

/**
 * Canonical storage form for Egyptian mobiles: `1XXXXXXXXX` — country code
 * and trunk zero stripped, separators removed. New writes converge on it so
 * phone equality (the COD gate, change detection) is a plain string
 * comparison; values stored before canonicalization are passed through it
 * again at compare time so legacy rows still match.
 */
export const canonicalizePhone = (value: string): string =>
  value.replace(/[\s-]/g, "").replace(/^\+?20(?=1)/, "").replace(/^0(?=1)/, "");

/**
 * The one Egyptian-mobile rule for the whole backend. Accepts `+20`-prefixed
 * and bare `01…` forms, tolerating spaces and hyphens; everything else fails
 * with a single shared message. Extracted from the users module so the rule
 * exists exactly once — the verification and orders modules validate the same
 * numbers.
 */
export const egyptianPhoneSchema = z
  .string()
  .trim()
  .transform(canonicalizePhone)
  .refine((value) => /^1[0125]\d{8}$/.test(value), {
    message: "Enter a valid Egyptian mobile number",
  });

/**
 * Normalizes Arabic-Indic digits (٠-٩) to ASCII digits so digit shape never
 * causes a false failure. The verification schemas apply this to submitted
 * codes before the format rule runs.
 */
export const normalizeDigits = (value: string): string =>
  value.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
