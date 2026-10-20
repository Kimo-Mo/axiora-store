import { z } from "zod";

const uuid = z.string().uuid("Must be a valid id");

const booleanish = z
  .enum(["true", "false", "1", "0"])
  .transform((value) => value === "true" || value === "1");

export const inventoryQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().trim().max(120).optional(),
    lowStockOnly: booleanish.optional(),
  })
  .strict();

export const stockAdjustmentSchema = z
  .object({
    variantId: uuid,
    quantityChange: z
      .number()
      .int("Quantity change must be an integer")
      .refine((n) => n !== 0, "Quantity change cannot be zero"),
    reason: z
      .string()
      .trim()
      .min(3, "Adjustment reason must be at least 3 characters")
      .max(500, "Reason is too long"),
  })
  .strict();

export const adjustmentsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    variantId: uuid.optional(),
  })
  .strict();

export const updateLowStockThresholdSchema = z
  .object({
    lowStockThreshold: z
      .number()
      .int("Threshold must be an integer")
      .min(0, "Threshold cannot be negative")
      .max(100_000, "Threshold is too large"),
  })
  .strict();

export type InventoryQueryInput = z.infer<typeof inventoryQuerySchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
export type AdjustmentsQueryInput = z.infer<typeof adjustmentsQuerySchema>;
export type UpdateLowStockThresholdInput = z.infer<typeof updateLowStockThresholdSchema>;
