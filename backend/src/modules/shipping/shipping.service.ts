import { prisma } from "../../config/prisma.js";
import { NotFoundError } from "../../shared/errors.js";
import { round2 } from "../../shared/utils/currency.js";
import type {
  CreateShippingZoneInput,
  ShippingRateDto,
  ShippingZoneAdminDto,
  ShippingZoneRecord,
  UpdateShippingZoneInput,
} from "./shipping.types.js";

function hydrateRate(zone: ShippingZoneRecord): ShippingRateDto {
  return {
    id: zone.id,
    governorate: zone.governorate,
    zone: zone.zone,
    deliveryFee: round2(Number(zone.deliveryFee)),
    estimatedDays: zone.estimatedDays,
  };
}

function hydrateAdminZone(zone: ShippingZoneRecord): ShippingZoneAdminDto {
  return {
    ...hydrateRate(zone),
    isActive: zone.isActive ?? true,
  };
}

/**
 * List active shipping zones ordered by governorate (public — drives the
 * checkout governorate dropdown). Only `isActive = true` zones are returned.
 */
export async function listActiveRates(): Promise<ShippingRateDto[]> {
  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    orderBy: { governorate: "asc" },
  });
  return zones.map(hydrateRate);
}

/**
 * Delivery fee + estimate for one governorate. 404 when the governorate has no
 * active zone — delivery is unavailable there.
 */
export async function getRateByGovernorate(governorate: string): Promise<ShippingRateDto> {
  const zone = await prisma.shippingZone.findFirst({
    where: { governorate, isActive: true },
  });
  if (!zone) {
    throw new NotFoundError(`No active shipping zone for governorate: ${governorate}`);
  }
  return hydrateRate(zone);
}

// --- Admin CRUD methods (PLAN.md Phase 8 Task 1) ---

/** List all shipping zones including inactive (admin). */
export async function listAllZones(): Promise<ShippingZoneAdminDto[]> {
  const zones = await prisma.shippingZone.findMany({
    orderBy: { governorate: "asc" },
  });
  return zones.map(hydrateAdminZone);
}

/** Get a single shipping zone by id (admin). */
export async function getZoneById(id: string): Promise<ShippingZoneAdminDto> {
  const zone = await prisma.shippingZone.findUnique({
    where: { id },
  });
  if (!zone) {
    throw new NotFoundError(`Shipping zone not found with id: ${id}`);
  }
  return hydrateAdminZone(zone);
}

/** Create a new shipping zone (admin). */
export async function createZone(input: CreateShippingZoneInput): Promise<ShippingZoneAdminDto> {
  const created = await prisma.shippingZone.create({
    data: {
      governorate: input.governorate.trim().toLowerCase(),
      zone: input.zone?.trim() ?? null,
      deliveryFee: round2(input.deliveryFee),
      estimatedDays: input.estimatedDays,
      isActive: input.isActive ?? true,
    },
  });
  return hydrateAdminZone(created);
}

/** Update an existing shipping zone (admin). */
export async function updateZone(
  id: string,
  input: UpdateShippingZoneInput,
): Promise<ShippingZoneAdminDto> {
  const existing = await prisma.shippingZone.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`Shipping zone not found with id: ${id}`);
  }

  const updated = await prisma.shippingZone.update({
    where: { id },
    data: {
      ...(input.governorate ? { governorate: input.governorate.trim().toLowerCase() } : {}),
      ...(input.zone !== undefined ? { zone: input.zone?.trim() ?? null } : {}),
      ...(input.deliveryFee !== undefined ? { deliveryFee: round2(input.deliveryFee) } : {}),
      ...(input.estimatedDays !== undefined ? { estimatedDays: input.estimatedDays } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });
  return hydrateAdminZone(updated);
}

/** Delete a shipping zone (admin). */
export async function deleteZone(id: string): Promise<void> {
  const existing = await prisma.shippingZone.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`Shipping zone not found with id: ${id}`);
  }
  await prisma.shippingZone.delete({ where: { id } });
}
