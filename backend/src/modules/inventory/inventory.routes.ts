import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { validate } from "../../shared/middleware/validate.js";
import * as controller from "./inventory.controller.js";
import {
  adjustmentsQuerySchema,
  inventoryQuerySchema,
  stockAdjustmentSchema,
  updateLowStockThresholdSchema,
} from "./inventory.schemas.js";

export const adminInventoryRouter = Router();

adminInventoryRouter.get(
  "/",
  validate({ query: inventoryQuerySchema }),
  asyncHandler(controller.listInventory),
);

adminInventoryRouter.post(
  "/adjustments",
  validate({ body: stockAdjustmentSchema }),
  asyncHandler(controller.adjustStock),
);

adminInventoryRouter.get(
  "/adjustments",
  validate({ query: adjustmentsQuerySchema }),
  asyncHandler(controller.listAdjustments),
);

adminInventoryRouter.get(
  "/settings",
  asyncHandler(controller.getSettings),
);

adminInventoryRouter.put(
  "/settings",
  validate({ body: updateLowStockThresholdSchema }),
  asyncHandler(controller.updateSettings),
);
