import type { Request, Response } from "express";
import * as brandsService from "./brands.service.js";
import type { CreateBrandInput, UpdateBrandInput } from "./brands.schemas.js";

export async function listBrands(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: await brandsService.listBrands() });
}

export async function createBrand(req: Request, res: Response): Promise<void> {
  const brand = await brandsService.createBrand(req.body as CreateBrandInput);
  res.status(201).json({ success: true, data: brand });
}

export async function updateBrand(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const brand = await brandsService.updateBrand(id, req.body as UpdateBrandInput);
  res.json({ success: true, data: brand });
}

export async function deleteBrand(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  await brandsService.deleteBrand(id);
  res.json({ success: true, data: { deleted: true, id } });
}