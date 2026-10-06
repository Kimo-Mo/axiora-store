import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { validate } from "../../shared/middleware/validate.js";
import * as controller from "./carts.controller.js";
import {
  addCartItemBodySchema,
  mergeCartBodySchema,
  removeCartItemParamSchema,
  updateCartItemBodySchema,
  updateCartItemParamSchema,
} from "./carts.schemas.js";

export const cartsRouter = Router();

// All cart endpoints require an authenticated user
cartsRouter.use(requireAuth);

cartsRouter.get("/", asyncHandler(controller.getCart));

cartsRouter.post(
  "/items",
  validate({ body: addCartItemBodySchema }),
  asyncHandler(controller.addItem)
);

cartsRouter.patch(
  "/items/:id",
  validate({ params: updateCartItemParamSchema, body: updateCartItemBodySchema }),
  asyncHandler(controller.updateItem)
);

cartsRouter.delete(
  "/items/:id",
  validate({ params: removeCartItemParamSchema }),
  asyncHandler(controller.removeItem)
);

cartsRouter.delete("/", asyncHandler(controller.clearCart));

cartsRouter.post(
  "/merge",
  validate({ body: mergeCartBodySchema }),
  asyncHandler(controller.mergeCart)
);
