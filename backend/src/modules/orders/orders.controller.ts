import type { Request, Response } from "express";
import * as ordersService from "./orders.service.js";

export async function quote(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const result = await ordersService.quote(userId, req.body);
  res.status(200).json({ success: true, data: result });
}

export async function create(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const result = await ordersService.createOrder(userId, req.body);
  // A replay returns the already-created order with 200 (not 201) and an
  // in-body flag, per contracts/checkout-api.md §4.1.
  const data = result.idempotentReplay ? { ...result.order, idempotentReplay: true } : result.order;
  res.status(result.idempotentReplay ? 200 : 201).json({ success: true, data });
}

export async function list(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const result = await ordersService.listOrders(userId, req.query);
  res.status(200).json({ success: true, data: result });
}

export async function detail(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { orderNumber } = req.params;
  const order = await ordersService.getOrderByNumber(userId, orderNumber);
  res.status(200).json({ success: true, data: order });
}

export async function cancel(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { orderNumber } = req.params;
  const order = await ordersService.cancelOrder(userId, orderNumber);
  res.status(200).json({ success: true, data: order });
}
