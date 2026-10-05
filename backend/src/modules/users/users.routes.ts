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
 *
 * `requireAuth` is attached per route rather than once for the whole router. A
 * router-level guard on a router mounted at `/api/v1` would run for *every* path
 * that reaches it, including the public catalog routes — silently turning them
 * into authenticated endpoints.
 */
export const usersRouter = Router();

usersRouter.get("/profile", requireAuth, asyncHandler(controller.getProfile));
usersRouter.patch(
  "/profile",
  requireAuth,
  validate({ body: updateProfileSchema }),
  asyncHandler(controller.updateProfile),
);

usersRouter.get("/addresses", requireAuth, asyncHandler(controller.listAddresses));
usersRouter.post(
  "/addresses",
  requireAuth,
  validate({ body: createAddressSchema }),
  asyncHandler(controller.createAddress),
);
usersRouter.patch(
  "/addresses/:id",
  requireAuth,
  validate({ params: addressIdSchema, body: updateAddressSchema }),
  asyncHandler(controller.updateAddress),
);
usersRouter.delete(
  "/addresses/:id",
  requireAuth,
  validate({ params: addressIdSchema }),
  asyncHandler(controller.deleteAddress),
);
