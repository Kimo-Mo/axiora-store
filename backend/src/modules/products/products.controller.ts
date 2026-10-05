import type { Request, Response } from "express";
import * as productsService from "./products.service.js";
import type {
  AddProductImageInput,
  CatalogQueryInput,
  CreateProductInput,
  CreateVariantInput,
  ReplaceSpecificationsInput,
  UpdateProductInput,
  UpdateVariantInput,
} from "./products.schemas.js";

export async function listProducts(req: Request, res: Response): Promise<void> {
  // `validate({ query: catalogQuerySchema })` has already coerced every string into
  // the typed shape, so this is a cast rather than a re-parse.
  const result = await productsService.listProducts(req.query as unknown as CatalogQueryInput);
  res.json(result);
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const { slug } = req.params as { slug: string };
  res.json({ success: true, data: await productsService.getProductDetail(slug) });
}

export async function getRelatedProducts(req: Request, res: Response): Promise<void> {
  const { slug } = req.params as { slug: string };
  res.json({ success: true, data: await productsService.getRelatedProducts(slug) });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function listAdminProducts(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: await productsService.listAdminProducts() });
}

export async function getAdminProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  res.json({ success: true, data: await productsService.getAdminProductById(id) });
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const product = await productsService.createProduct(req.body as CreateProductInput);
  res.status(201).json({ success: true, data: product });
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const product = await productsService.updateProduct(id, req.body as UpdateProductInput);
  res.json({ success: true, data: product });
}

export async function updateProductStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { isActive } = req.body as { isActive: boolean };
  res.json({ success: true, data: await productsService.setProductActiveStatus(id, isActive) });
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  await productsService.deleteProduct(id);
  res.json({ success: true, data: { deleted: true, id } });
}

export async function createVariant(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const product = await productsService.createVariant(id, req.body as CreateVariantInput);
  res.status(201).json({ success: true, data: product });
}

export async function updateVariant(req: Request, res: Response): Promise<void> {
  const { id, variantId } = req.params as { id: string; variantId: string };
  const product = await productsService.updateVariant(id, variantId, req.body as UpdateVariantInput);
  res.json({ success: true, data: product });
}

export async function deleteVariant(req: Request, res: Response): Promise<void> {
  const { id, variantId } = req.params as { id: string; variantId: string };
  await productsService.deleteVariant(id, variantId);
  res.json({ success: true, data: { deleted: true, variantId } });
}

export async function replaceSpecifications(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const product = await productsService.replaceSpecifications(id, req.body as ReplaceSpecificationsInput);
  res.status(201).json({ success: true, data: product });
}

export async function addProductImage(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const image = await productsService.addProductImage(id, req.body as AddProductImageInput);
  res.status(201).json({ success: true, data: image });
}

export async function deleteProductImage(req: Request, res: Response): Promise<void> {
  const { id, imageId } = req.params as { id: string; imageId: string };
  await productsService.deleteProductImage(id, imageId);
  res.json({ success: true, data: { deleted: true, imageId } });
}

export async function reorderProductImages(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { images } = req.body as { images: string[] };
  await productsService.reorderProductImages(id, images);
  res.json({ success: true, data: { reordered: images.length } });
}