import type { Request, Response } from "express";
import * as cartsService from "./carts.service.js";

export async function getCart(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const cart = await cartsService.getOrCreateCart(userId);
  res.status(200).json({ success: true, data: cart });
}

export async function addItem(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const cart = await cartsService.addToCart(userId, req.body);
  res.status(200).json({ success: true, data: cart });
}

export async function updateItem(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;
  const { quantity } = req.body;
  const cart = await cartsService.updateCartItem(userId, id, quantity);
  res.status(200).json({ success: true, data: cart });
}

export async function removeItem(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;
  const cart = await cartsService.removeCartItem(userId, id);
  res.status(200).json({ success: true, data: cart });
}

export async function clearCart(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const cart = await cartsService.clearCart(userId);
  res.status(200).json({ success: true, data: cart });
}

export async function mergeCart(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { items } = req.body;
  const cart = await cartsService.mergeGuestCart(userId, items);
  res.status(200).json({ success: true, data: cart });
}
