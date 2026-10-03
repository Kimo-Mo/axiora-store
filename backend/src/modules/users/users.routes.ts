import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { validate } from "../../shared/middleware/validate.js";
import * as controller from "./users.controller.js";
import {
  addressIdSchema,
  createAddressSchema,
  updateAddressSchema,
  updateProfileSchema,
} from "./users.schema.js";

/**
 * Mounted at `/api/v1`, serving `/profile` and `/addresses`.
 *
 * Every route sits behind `requireAuth`; ownership is enforced in the service
 * queries, never here. `requireAdmin` is deliberately absent — a customer manages
 * only their own records, and the admin namespace has its own router.
 */
export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get("/profile", asyncHandler(controller.getProfile));
usersRouter.patch("/profile", validate({ body: updateProfileSchema }), asyncHandler(controller.updateProfile));

usersRouter.get("/addresses", asyncHandler(controller.listAddresses));
usersRouter.post("/addresses", validate({ body: createAddressSchema }), asyncHandler(controller.createAddress));
usersRouter.patch(
  "/addresses/:id",
  validate({ params: addressIdSchema, body: updateAddressSchema }),
  asyncHandler(controller.updateAddress),
);
usersRouter.delete("/addresses/:id", validate({ params: addressIdSchema }), asyncHandler(controller.deleteAddress));
