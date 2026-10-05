import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { validate } from "../../shared/middleware/validate.js";
import * as controller from "./products.controller.js";
import {
  addProductImageSchema,
  catalogQuerySchema,
  createProductSchema,
  createVariantSchema,
  productIdParamSchema,
  productImageParamSchema,
  productSlugParamSchema,
  productVariantParamSchema,
  reorderProductImagesSchema,
  replaceSpecificationsSchema,
  updateProductSchema,
  updateProductStatusSchema,
  updateVariantSchema,
} from "./products.schemas.js";

/**
 * Public storefront router. Read-only and unauthenticated; `app.ts` mounts it at
 * `/api/v1/products`.
 *
 * `/:slug/related` is declared before `/:slug` so the two-segment path is not
 * swallowed by the single-segment wildcard.
 */
export const productsRouter = Router();

productsRouter.get("/", validate({ query: catalogQuerySchema }), asyncHandler(controller.listProducts));
productsRouter.get("/:slug/related", validate({ params: productSlugParamSchema }), asyncHandler(controller.getRelatedProducts));
productsRouter.get("/:slug", validate({ params: productSlugParamSchema }), asyncHandler(controller.getProduct));

/**
 * Admin router, mounted under `/api/v1/admin/products` behind `requireAuth` +
 * `requireAdmin`.
 *
 * Writes address products by id, not slug, so renaming a product (and with it its
 * slug) cannot break an administrator's saved link.
 */
export const adminProductsRouter = Router();

adminProductsRouter.get("/", asyncHandler(controller.listAdminProducts));
adminProductsRouter.post("/", validate({ body: createProductSchema }), asyncHandler(controller.createProduct));
adminProductsRouter.get("/:id", validate({ params: productIdParamSchema }), asyncHandler(controller.getAdminProduct));
adminProductsRouter.put(
  "/:id",
  validate({ params: productIdParamSchema, body: updateProductSchema }),
  asyncHandler(controller.updateProduct),
);
adminProductsRouter.patch(
  "/:id/status",
  validate({ params: productIdParamSchema, body: updateProductStatusSchema }),
  asyncHandler(controller.updateProductStatus),
);
adminProductsRouter.delete(
  "/:id",
  validate({ params: productIdParamSchema }),
  asyncHandler(controller.deleteProduct),
);

adminProductsRouter.post(
  "/:id/variants",
  validate({ params: productIdParamSchema, body: createVariantSchema }),
  asyncHandler(controller.createVariant),
);
adminProductsRouter.put(
  "/:id/variants/:variantId",
  validate({ params: productVariantParamSchema, body: updateVariantSchema }),
  asyncHandler(controller.updateVariant),
);
adminProductsRouter.delete(
  "/:id/variants/:variantId",
  validate({ params: productVariantParamSchema }),
  asyncHandler(controller.deleteVariant),
);

adminProductsRouter.post(
  "/:id/images",
  validate({ params: productIdParamSchema, body: addProductImageSchema }),
  asyncHandler(controller.addProductImage),
);
adminProductsRouter.put(
  "/:id/images/order",
  validate({ params: productIdParamSchema, body: reorderProductImagesSchema }),
  asyncHandler(controller.reorderProductImages),
);
adminProductsRouter.delete(
  "/:id/images/:imageId",
  validate({ params: productImageParamSchema }),
  asyncHandler(controller.deleteProductImage),
);

adminProductsRouter.post(
  "/:id/specifications",
  validate({ params: productIdParamSchema, body: replaceSpecificationsSchema }),
  asyncHandler(controller.replaceSpecifications),
);