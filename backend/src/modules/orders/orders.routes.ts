import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { validate } from "../../shared/middleware/validate.js";
import * as controller from "./orders.controller.js";
import {
  AdminListOrdersQuerySchema,
  CheckoutQuoteSchema,
  CreateOrderSchema,
  ListOrdersQuerySchema,
  OrderNumberParamSchema,
  StatusChangeSchema,
} from "./orders.schemas.js";

/**
 * The checkout quote router (mounted at `/api/v1/checkout`). The quote is the
 * pre-order projection of the order domain, so it lives in the orders module
 * while sharing the checkout base path (plan.md structure decision).
 */
export const checkoutRouter = Router();

checkoutRouter.post(
  "/quote",
  requireAuth,
  validate({ body: CheckoutQuoteSchema }),
  asyncHandler(controller.quote),
);

/**
 * Customer order endpoints (mounted at `/api/v1/orders`). List, detail, and
 * cancellation are backend interfaces this phase; the self-service orders UI
 * arrives in Phase 11.
 */
export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.post(
  "/",
  validate({ body: CreateOrderSchema }),
  asyncHandler(controller.create),
);

ordersRouter.get(
  "/",
  validate({ query: ListOrdersQuerySchema }),
  asyncHandler(controller.list),
);

ordersRouter.get(
  "/:orderNumber",
  validate({ params: OrderNumberParamSchema }),
  asyncHandler(controller.detail),
);

ordersRouter.post(
  "/:orderNumber/cancel",
  validate({ params: OrderNumberParamSchema }),
  asyncHandler(controller.cancel),
);

/**
 * Admin order endpoints (mounted at `/api/v1/admin/orders` behind the
 * admin router's `requireAuth + requireAdmin`). Phase 11 ships these as
 * API only — the admin UI arrives in Phase 13.
 */
export const adminOrdersRouter = Router();

adminOrdersRouter.get(
  "/",
  validate({ query: AdminListOrdersQuerySchema }),
  asyncHandler(controller.listAdmin),
);

adminOrdersRouter.get(
  "/:orderNumber",
  validate({ params: OrderNumberParamSchema }),
  asyncHandler(controller.detailAdmin),
);

adminOrdersRouter.patch(
  "/:orderNumber/status",
  validate({ params: OrderNumberParamSchema, body: StatusChangeSchema }),
  asyncHandler(controller.changeStatus),
);
