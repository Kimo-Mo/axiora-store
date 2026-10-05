import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { validate } from "../../shared/middleware/validate.js";
import * as controller from "./brands.controller.js";
import { brandIdParamSchema, createBrandSchema, updateBrandSchema } from "./brands.schemas.js";

/**
 * The public router is read-only; every mutation lives on the admin router that
 * `app.ts` mounts behind `requireAuth` + `requireAdmin`.
 */
export const brandsRouter = Router();

brandsRouter.get("/", asyncHandler(controller.listBrands));

export const adminBrandsRouter = Router();

adminBrandsRouter.post("/", validate({ body: createBrandSchema }), asyncHandler(controller.createBrand));
adminBrandsRouter.put(
  "/:id",
  validate({ params: brandIdParamSchema, body: updateBrandSchema }),
  asyncHandler(controller.updateBrand),
);
adminBrandsRouter.delete(
  "/:id",
  validate({ params: brandIdParamSchema }),
  asyncHandler(controller.deleteBrand),
);