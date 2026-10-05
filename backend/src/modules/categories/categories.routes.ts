import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { validate } from "../../shared/middleware/validate.js";
import * as controller from "./categories.controller.js";
import {
  categoryIdParamSchema,
  categorySlugParamSchema,
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from "./categories.schemas.js";

/**
 * Mounted twice by `app.ts`: read-only at `/api/v1/categories`, and the mutation
 * half under `/api/v1/admin/categories` behind `requireAuth` + `requireAdmin`.
 *
 * Splitting the two routers rather than guarding individual handlers means a new
 * write route cannot be added to the public router without someone noticing the
 * missing `requireAdmin`.
 */
export const categoriesRouter = Router();

categoriesRouter.get("/", validate({ query: listCategoriesQuerySchema }), asyncHandler(controller.listCategories));
categoriesRouter.get(
  "/:slug",
  validate({ params: categorySlugParamSchema }),
  asyncHandler(controller.getCategory),
);

export const adminCategoriesRouter = Router();

adminCategoriesRouter.post(
  "/",
  validate({ body: createCategorySchema }),
  asyncHandler(controller.createCategory),
);
adminCategoriesRouter.put(
  "/:id",
  validate({ params: categoryIdParamSchema, body: updateCategorySchema }),
  asyncHandler(controller.updateCategory),
);
adminCategoriesRouter.delete(
  "/:id",
  validate({ params: categoryIdParamSchema }),
  asyncHandler(controller.deleteCategory),
);