import type { Request, Response } from "express";
import * as categoriesService from "./categories.service.js";
import type { CreateCategoryInput, UpdateCategoryInput } from "./categories.schemas.js";

export async function listCategories(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as { tree: boolean; flat: boolean };
  res.json({ success: true, data: await categoriesService.listCategories(query) });
}

export async function getCategory(req: Request, res: Response): Promise<void> {
  const { slug } = req.params as { slug: string };
  res.json({ success: true, data: await categoriesService.getCategoryDetail(slug) });
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const category = await categoriesService.createCategory(req.body as CreateCategoryInput);
  res.status(201).json({ success: true, data: category });
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const category = await categoriesService.updateCategory(id, req.body as UpdateCategoryInput);
  res.json({ success: true, data: category });
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  await categoriesService.deleteCategory(id);
  res.json({ success: true, data: { deleted: true, id } });
}