import type { Request, Response } from "express";
import { requireUploadedFile } from "../../shared/middleware/upload.js";
import * as uploadsService from "./uploads.service.js";
import {
  DEFAULT_UPLOAD_FOLDER,
  uploadPublicIdSchema,
  type UploadBodyInput,
  type UploadFolder,
} from "./uploads.schemas.js";

export async function uploadImage(req: Request, res: Response): Promise<void> {
  // The Multer middleware has already enforced MIME type and the size ceiling, so
  // by this point the buffer is safe to hand to Cloudinary.
  const file = requireUploadedFile(req);
  const folder: UploadFolder = (req.body as Partial<UploadBodyInput>).folder ?? DEFAULT_UPLOAD_FOLDER;

  res.status(201).json({ success: true, data: await uploadsService.uploadImage(file, folder) });
}

export async function destroyImage(req: Request, res: Response): Promise<void> {
  // Express 4 does not name wildcard captures, so the raw remainder arrives as
  // index `0` (see the route comment). A trailing slash is trimmed because
  // `/axiora/products/photo.webp/` is the same asset as the path without it.
  const publicId = uploadPublicIdSchema.parse((req.params as unknown as string[])[0].replace(/\/+$/, ""));

  await uploadsService.destroyImage(publicId);
  res.json({ success: true, data: { result: "ok", publicId } });
}