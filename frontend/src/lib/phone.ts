/**
 * The frontend mirror of `backend/src/shared/utils/phone.ts` — one
 * Egyptian-mobile rule shared by checkout, the address form, and the
 * verification panel. The server remains the authority; these helpers only
 * pre-validate for UX and canonicalize for equality checks.
 */

/** Arabic-Indic digits (٠-٩) to ASCII so digit shape never causes a false failure. */
export function normalizeDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

/** Canonical form `1XXXXXXXXX`: trims, drops separators, `+20` and trunk `0`. */
export function canonicalizePhone(value: string): string {
  return normalizeDigits(value.trim())
    .replace(/[\s-]/g, '')
    .replace(/^\+?20(?=1)/, '')
    .replace(/^0(?=1)/, '');
}

/** Mirrors the backend's `egyptianPhoneSchema` accept rule. */
export function isEgyptianMobile(value: string): boolean {
  return /^1[0125]\d{8}$/.test(canonicalizePhone(value));
}
