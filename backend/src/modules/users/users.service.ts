import { prisma } from "../../config/prisma.js";
import { NotFoundError } from "../../shared/errors.js";
import { logSecurityEvent } from "../../shared/logger.js";
import type { AuthUser } from "../../shared/types.js";
import { authUserSelect, toAuthUser } from "../auth/auth.service.js";
import type { CreateAddressInput, UpdateAddressInput, UpdateProfileInput } from "./users.schema.js";

export type AddressRecord = Awaited<ReturnType<typeof listAddresses>>[number];

export async function getProfile(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: authUserSelect });
  if (!user) throw new NotFoundError("Account not found");
  return toAuthUser({ ...user, defaultAddress: user.addresses[0] ?? null });
}

export async function updateProfile(
  user: { id: string; email: string; role: "CUSTOMER" | "ADMIN" },
  input: UpdateProfileInput,
): Promise<AuthUser> {
  // The verification reset is bound to an actual value change inside one
  // conditional UPDATE: re-saving the same number keeps its verified state
  // (spec §8 — reusable until the phone is changed), while any real change
  // carries the reset in the same statement, so no interleaving — including
  // one racing verifyOtp — can leave a number flagged as verified that never
  // was. The comparison is exact-string against the stored value; a legacy
  // row saved in a pre-canonicalization form re-verifies once, which is
  // safe, merely annoying.
  if (input.phone !== undefined) {
    await prisma.user.updateMany({
      where: {
        id: user.id,
        ...(input.phone === null
          ? { phone: { not: null } }
          : { OR: [{ phone: null }, { phone: { not: input.phone } }] }),
      },
      data: { phone: input.phone, phoneVerified: false },
    });
  }

  const updated =
    input.fullName !== undefined
      ? await prisma.user.update({
          where: { id: user.id },
          data: { fullName: input.fullName },
          select: authUserSelect,
        })
      : await prisma.user.findUnique({ where: { id: user.id }, select: authUserSelect });
  if (!updated) throw new NotFoundError("Account not found");

  logSecurityEvent("account.profile_updated", "success", "OK", { actor: user.email, role: user.role });
  return toAuthUser({ ...updated, defaultAddress: updated.addresses[0] ?? null });
}

/**
 * `Address` has no `createdAt` column — the spec's entity deliberately carries no
 * timestamp — so "newest first" is not expressible. Ordering is default-first,
 * then alphabetical, which is at least stable: without a tiebreak, PostgreSQL gives
 * no ordering guarantee and the list could reshuffle between requests.
 */
const addressOrder = [{ isDefault: "desc" as const }, { label: "asc" as const }, { fullName: "asc" as const }];

export async function listAddresses(userId: string) {
  // An account with no saved addresses returns an empty list, never null.
  return prisma.address.findMany({ where: { userId }, orderBy: addressOrder });
}

/**
 * Every `:id` operation filters on the owner inside the query. A foreign id must
 * therefore look identical to a nonexistent one — a 403 would confirm the record
 * exists, which FR-025 forbids.
 */
async function findOwnedAddress(userId: string, id: string) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw new NotFoundError("Address not found");
  return address;
}

export async function createAddress(
  user: { id: string; email: string; role: "CUSTOMER" | "ADMIN" },
  input: CreateAddressInput,
) {
  const count = await prisma.address.count({ where: { userId: user.id } });
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      label: input.label,
      fullName: input.fullName,
      phone: input.phone,
      governorate: input.governorate,
      city: input.city,
      street: input.street,
      area: input.area,
      building: input.building,
      floor: input.floor,
      apartment: input.apartment,
      landmark: input.landmark,
      notes: input.notes,
      // A customer's first address becomes their default automatically; every
      // later one starts unflagged so the choice is never made for them.
      isDefault: count === 0,
    },
  });
  logSecurityEvent("account.address_created", "success", "OK", { actor: user.email, role: user.role });
  return address;
}

export async function updateAddress(
  user: { id: string; email: string; role: "CUSTOMER" | "ADMIN" },
  id: string,
  input: UpdateAddressInput,
) {
  const existing = await findOwnedAddress(user.id, id);

  const address = await prisma.$transaction(async (tx) => {
    if (input.isDefault === true) {
      // Clear-then-set must be atomic. Without the transaction two concurrent
      // promotions would each clear and then set, leaving two rows flagged.
      await tx.address.updateMany({ where: { userId: user.id, NOT: { id } }, data: { isDefault: false } });
    }
    return tx.address.update({
      where: { id: existing.id },
      data: {
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.governorate !== undefined ? { governorate: input.governorate } : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
        ...(input.street !== undefined ? { street: input.street } : {}),
        ...(input.area !== undefined ? { area: input.area } : {}),
        ...(input.building !== undefined ? { building: input.building } : {}),
        ...(input.floor !== undefined ? { floor: input.floor } : {}),
        ...(input.apartment !== undefined ? { apartment: input.apartment } : {}),
        ...(input.landmark !== undefined ? { landmark: input.landmark } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      },
    });
  });

  logSecurityEvent("account.address_updated", "success", "OK", { actor: user.email, role: user.role });
  return address;
}

export async function deleteAddress(
  user: { id: string; email: string; role: "CUSTOMER" | "ADMIN" },
  id: string,
): Promise<void> {
  const existing = await findOwnedAddress(user.id, id);
  await prisma.address.delete({ where: { id: existing.id } });
  // Deliberately no successor is promoted: picking one would silently choose an
  // address the customer did not select. Checkout falls back to asking.
  logSecurityEvent("account.address_deleted", "success", "OK", { actor: user.email, role: user.role });
}
