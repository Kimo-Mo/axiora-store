import multer from "multer";
import type { Request, RequestHandler } from "express";
import { ValidationError } from "../errors.js";
import type { UploadedImageFile } from "../../modules/products/products.types.js";

/** FR-018: five megabytes, JPEG/PNG/WebP only. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const REJECTION_MESSAGE = "Only JPEG, PNG, and WebP images up to 5MB are allowed.";

/**
 * Memory storage, not disk.
 *
 * The buffer is streamed straight to Cloudinary and never written to the
 * filesystem, so there is no upload directory to size-limit, clean up, or keep in
 * sync across horizontally scaled instances (research.md D-5).
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if ((ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new ValidationError(REJECTION_MESSAGE, { file: { reason: "UNSUPPORTED_IMAGE_TYPE" } }));
  },
});

/**
 * Multer signals an oversize part by rejecting the stream mid-flight. That is a
 * `MulterError`, not one of our `AppError`s, so without this translation it would
 * fall through the error handler as an opaque 500 — a client mistake reported as
 * a server fault.
 */
function translateMulterError(err: unknown): unknown {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return new ValidationError(REJECTION_MESSAGE, { file: { reason: "FILE_TOO_LARGE" } });
    }
    return new ValidationError("The upload could not be processed.", { file: { reason: err.code } });
  }
  return err;
}

/**
 * Single-file middleware for the `file` form field.
 *
 * Declared as a `RequestHandler` because Multer's own middleware signature is not
 * assignable to Express's under `strictFunctionTypes`.
 */
export const uploadSingleImage: RequestHandler = (req, _res, next) => {
  upload.single("file")(req, _res, (err?: unknown) => {
    if (err) {
      next(translateMulterError(err));
      return;
    }
    next();
  });
};

/** Narrow a request that has been through {@link uploadSingleImage} to its file. */
export function requireUploadedFile(req: Request): UploadedImageFile {
  const file = req.file;
  if (!file) {
    throw new ValidationError("An image file is required in the `file` field.");
  }
  return {
    buffer: file.buffer,
    mimetype: file.mimetype,
    size: file.size,
    originalname: file.originalname,
  };
}