import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { uploadSingleImage } from "../../shared/middleware/upload.js";
import * as controller from "./uploads.controller.js";

/**
 * Admin media router, mounted under `/api/v1/admin/uploads`.
 */
export const uploadsRouter = Router();

uploadsRouter.post("/", uploadSingleImage, asyncHandler(controller.uploadImage));

/**
 * `DELETE /api/v1/admin/uploads/axiora/products/photo.webp`
 *
 * A wildcard rather than `:publicId` because a Cloudinary public id is
 * folder-prefixed and therefore contains slashes, which a single path segment
 * cannot hold. The captured remainder is validated in the controller against
 * `uploadPublicIdSchema` — the route layer cannot do it, since Express 4 does not
 * name wildcard captures.
 */
uploadsRouter.delete("/*", asyncHandler(controller.destroyImage));