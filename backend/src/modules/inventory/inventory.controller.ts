import type { Request, Response } from "express";
import * as inventoryService from "./inventory.service.js";
import { UnauthorizedError } from "../../shared/errors.js";
import {
  type AdjustmentsQueryInput,
  type InventoryQueryInput,
  stockAdjustmentSchema,
  updateLowStockThresholdSchema,
} from "./inventory.schemas.js";

export async function listInventory(req: Request, res: Response): Promise<void> {
  // `validate({ query: inventoryQuerySchema })` has already coerced every string into
  // the typed shape, so this is a cast rather than a re-parse.
  const result = await inventoryService.listInventory(req.query as unknown as InventoryQueryInput);
  res.json({ success: true, data: result });
}

export async function adjustStock(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }
  const body = stockAdjustmentSchema.parse(req.body);
  const result = await inventoryService.adjustStock(body, req.user.email);
  res.status(201).json({ success: true, data: result });
}

export async function listAdjustments(req: Request, res: Response): Promise<void> {
  // `validate({ query: adjustmentsQuerySchema })` has already coerced every string into
  // the typed shape, so this is a cast rather than a re-parse.
  const result = await inventoryService.listAdjustments(
    req.query as unknown as AdjustmentsQueryInput,
  );
  res.json({ success: true, data: result });
}

export async function getSettings(_req: Request, res: Response): Promise<void> {
  const threshold = await inventoryService.getLowStockThreshold();
  res.json({ success: true, data: { lowStockThreshold: threshold } });
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const { lowStockThreshold } = updateLowStockThresholdSchema.parse(req.body);
  const result = await inventoryService.updateLowStockThreshold(lowStockThreshold);
  res.json({ success: true, data: result });
}


