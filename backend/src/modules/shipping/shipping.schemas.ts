import { z } from "zod";

export const governorateParamSchema = z.object({
  governorate: z.string().trim().min(2).max(60),
});

export const zoneIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const createShippingZoneSchema = z.object({
  governorate: z.string().trim().min(2).max(60),
  zone: z.string().trim().min(2).max(60).optional().nullable(),
  deliveryFee: z.number().positive(),
  estimatedDays: z.number().int().positive(),
  isActive: z.boolean().optional(),
});

export const updateShippingZoneSchema = z.object({
  governorate: z.string().trim().min(2).max(60).optional(),
  zone: z.string().trim().min(2).max(60).optional().nullable(),
  deliveryFee: z.number().positive().optional(),
  estimatedDays: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});
