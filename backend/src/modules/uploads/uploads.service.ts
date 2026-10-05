import cloudinary from "../../config/cloudinary.js";
import { NotFoundError, ValidationError } from "../../shared/errors.js";
import type { UploadFolder } from "./uploads.schemas.js";
import type { UploadedImageFile } from "../products/products.types.js";

export interface UploadedAsset {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Cloudinary rejections arrive as plain `Error`s carrying an `http_code`.
 *
 * Left alone they would fall through the error handler as a 500, which blames our
 * server for something the *request* got wrong — a truncated or corrupt image, say.
 * A 4xx from the provider is mapped back to a 400 so the client learns the truth;
 * anything else (a provider outage, a network fault) stays a 500, because that one
 * really is not the caller's fault.
 */
function translateProviderError(error: unknown): never {
  const httpCode = (error as { http_code?: number })?.http_code;
  const message = (error as { message?: string })?.message;

  if (typeof httpCode === "number" && httpCode >= 400 && httpCode < 500) {
    throw new ValidationError(
      `Cloudinary rejected the image: ${message ?? 'unreadable or unsupported image data'}`,
      { provider: 'CLOUDINARY', httpCode },
    );
  }

  throw error;
}

/**
 * Buffered bytes and Cloudinary's result are bridged through callbacks, so the
 * promise is the only ergonomic way to await the upload. Settling it from the
 * callbacks is what keeps the route handler a plain `await` rather than an
 * event-emitter dance.
 */
function streamUpload(file: UploadedImageFile, folder: UploadFolder): Promise<UploadedAsset> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          try {
            translateProviderError(error ?? new Error("Cloudinary returned no result"));
          } catch (translated) {
            reject(translated);
          }
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width ?? 0,
          height: result.height ?? 0,
          format: result.format ?? "",
          bytes: result.bytes ?? file.size,
        });
      },
    );

    stream.on("error", reject);
    stream.end(file.buffer);
  });
}

/**
 * Push a validated in-memory image to Cloudinary (research.md D-5).
 *
 * Nothing is written to the local filesystem — the server stays stateless, which
 * is what lets it scale horizontally without shared storage.
 */
export async function uploadImage(file: UploadedImageFile, folder: UploadFolder): Promise<UploadedAsset> {
  return streamUpload(file, folder);
}

/**
 * Destroy a remote asset by public id.
 *
 * Returns `false` rather than throwing when Cloudinary reports `not found`: the
 * desired end state — the asset is gone — already holds, and a database row being
 * deleted must not fail because the remote copy was cleaned up manually.
 */
export async function destroyImage(publicId: string): Promise<boolean> {
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  if (result.result === "ok" || result.result === "not found") {
    return true;
  }
  throw new NotFoundError(`Cloudinary refused to delete ${publicId} (${result.result})`);
}