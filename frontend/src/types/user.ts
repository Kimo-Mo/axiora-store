/**
 * `AuthUser`, `AddressSummary`, and `UserRole` are defined once in `./auth` and
 * exported to `@/types` from there. They are deliberately NOT re-exported here:
 * `index.ts` star-exports both modules, and a name present in both becomes an
 * ambiguous export that TypeScript silently drops.
 */

/** A reusable delivery address belonging to exactly one account. */
export interface Address {
  id: string;
  userId: string;
  label: string | null;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  area: string | null;
  street: string;
  building: string | null;
  floor: string | null;
  apartment: string | null;
  landmark: string | null;
  notes: string | null;
  isDefault: boolean;
}

export type NewAddress = Omit<Address, "id" | "userId" | "isDefault">;

export type AddressUpdate = Partial<Omit<Address, "id" | "userId">>;

/**
 * Profile patch. `email` and `username` are intentionally absent: they are
 * immutable (FR-020), and the backend rejects them by name rather than ignoring
 * them, so there is no way for a caller to believe a change took effect.
 */
export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string | null;
}
