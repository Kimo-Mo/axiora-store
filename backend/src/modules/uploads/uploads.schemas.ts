import { z } from "zod";

/**
 * Upload boundary schema (research.md D-5).
 *
 * Only the optional destination folder is validated here. The file itself is
 * checked by the Multer middleware, which is the only layer that sees the
 * MIME type and byte count — a Zod schema cannot inspect a multipart part.
 */

export const UPLOAD_FOLDERS = ["axiora/products", "axiora/categories", "axiora/brands"] as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const DEFAULT_UPLOAD_FOLDER: UploadFolder = "axiora/products";

export const uploadBodySchema = z
  .object({
    folder: z.enum(UPLOAD_FOLDERS).default(DEFAULT_UPLOAD_FOLDER),
  })
  .strict();

/**
 * Cloudinary public ids are folder-prefixed, so `axiora/products/photo.webp` has
 * two path separators in it. Express cannot bind that to a single `:param`
 * segment — hence the wildcard route in `uploads.routes.ts`, which hands the raw
 * remainder to this schema.
 *
 * The pattern anchors the shape instead of just forbidding traversal: only the
 * known folder prefixes and a safe filename are accepted, so a crafted id cannot
 * address an asset outside the store's own folders.
 */
export const uploadPublicIdSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^axiora\/[a-z-]+\/[A-Za-z0-9_-]+(?:\.[A-Za-z0-9]+)?$/, "Not a valid Cloudinary public id");

export type UploadBodyInput = z.infer<typeof uploadBodySchema>;