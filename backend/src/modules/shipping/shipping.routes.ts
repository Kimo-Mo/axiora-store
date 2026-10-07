import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { validate } from "../../shared/middleware/validate.js";
import * as controller from "./shipping.controller.js";
import {
  createShippingZoneSchema,
  governorateParamSchema,
  updateShippingZoneSchema,
  zoneIdParamSchema,
} from "./shipping.schemas.js";

/** Public customer shipping routes (mounted at `/api/v1/shipping`). */
export const shippingRouter = Router();

shippingRouter.get("/rates", asyncHandler(controller.getRates));

shippingRouter.get(
  "/rates/:governorate",
  validate({ params: governorateParamSchema }),
  asyncHandler(controller.getRate),
);

/** Admin shipping zone management routes (mounted under `/api/v1/admin/shipping`). */
export const adminShippingRouter = Router();

adminShippingRouter.get("/", asyncHandler(controller.adminListZones));

adminShippingRouter.post(
  "/",
  validate({ body: createShippingZoneSchema }),
  asyncHandler(controller.adminCreateZone),
);

adminShippingRouter.get(
  "/:id",
  validate({ params: zoneIdParamSchema }),
  asyncHandler(controller.adminGetZone),
);

adminShippingRouter.patch(
  "/:id",
  validate({ params: zoneIdParamSchema, body: updateShippingZoneSchema }),
  asyncHandler(controller.adminUpdateZone),
);

adminShippingRouter.delete(
  "/:id",
  validate({ params: zoneIdParamSchema }),
  asyncHandler(controller.adminDeleteZone),
);
