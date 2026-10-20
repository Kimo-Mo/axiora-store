import type { Request, Response } from "express";
import { ValidationError } from "../../shared/errors.js";
import { requireUploadedFile, requireUploadedFiles } from "../../shared/middleware/upload.js";
import * as uploadsService from "./uploads.service.js";
import {
  DEFAULT_UPLOAD_FOLDER,
  UPLOAD_FOLDERS,
  uploadPublicIdSchema,
  type UploadBodyInput,
  type UploadFolder,
} from "./uploads.schemas.js";

/**
 * Multipart text fields are plain client input, so the folder is re-validated at
 * the trust boundary instead of cast to the branded type: casting cannot reject
 * a folder the client invented, and `streamUpload` would then hand an
 * unwhitelisted path straight to Cloudinary.
 */
export function parseUploadFolder(raw: unknown): UploadFolder {
  if (raw === undefined || raw === "") {
    return DEFAULT_UPLOAD_FOLDER;
  }

  const folder = typeof raw === "string" ? raw : String(raw);
  if ((UPLOAD_FOLDERS as readonly string[]).includes(folder)) {
    return folder as UploadFolder;
  }

  throw new ValidationError(`Invalid upload folder. Allowed folders: ${UPLOAD_FOLDERS.join(", ")}`);
}

export async function uploadImage(req: Request, res: Response): Promise<void> {
  // The Multer middleware has already enforced MIME type and the size ceiling, so
  // by this point the buffer is safe to hand to Cloudinary.
  const file = requireUploadedFile(req);
  const folder = parseUploadFolder((req.body as Partial<UploadBodyInput>).folder);

  res.status(201).json({ success: true, data: await uploadsService.uploadImage(file, folder) });
}

export async function uploadBatch(req: Request, res: Response): Promise<void> {
  const files = requireUploadedFiles(req);
  const folder = parseUploadFolder((req.body as Partial<UploadBodyInput>).folder);

  const data = await uploadsService.uploadImagesBatch(files, folder);
  res.status(201).json({ success: true, data });
}


export async function destroyImage(req: Request, res: Response): Promise<void> {
  // Express 4 does not name wildcard captures, so the raw remainder arrives as
  // index `0` (see the route comment). A trailing slash is trimmed because
  // `/axiora/products/photo.webp/` is the same asset as the path without it.
  const publicId = uploadPublicIdSchema.parse((req.params as unknown as string[])[0].replace(/\/+$/, ""));

  await uploadsService.destroyImage(publicId);
  res.json({ success: true, data: { result: "ok", publicId } });
}