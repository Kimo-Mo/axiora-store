import type { Prisma } from "@prisma/client";

/**
 * Shipping domain DTOs (data-model.md §6, contracts/checkout-api.md §2).
 *
 * `governorate` is a canonical lowercase identifier (research.md D-7); display
 * labels are resolved client-side from the bilingual checkout dictionary.
 */
export interface ShippingRateDto {
  id: string;
  governorate: string;
  zone: string | null;
  deliveryFee: number;
  estimatedDays: number;
}

export interface ShippingZoneAdminDto extends ShippingRateDto {
  isActive: boolean;
}

export type ShippingZoneRecord = {
  id: string;
  governorate: string;
  zone: string | null;
  deliveryFee: Prisma.Decimal;
  estimatedDays: number;
  isActive?: boolean;
};

export interface CreateShippingZoneInput {
  governorate: string;
  zone?: string | null;
  deliveryFee: number;
  estimatedDays: number;
  isActive?: boolean;
}

export interface UpdateShippingZoneInput {
  governorate?: string;
  zone?: string | null;
  deliveryFee?: number;
  estimatedDays?: number;
  isActive?: boolean;
}
