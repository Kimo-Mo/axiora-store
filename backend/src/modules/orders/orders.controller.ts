import type { Request, Response } from "express";
import * as ordersService from "./orders.service.js";
import type { OrderStatus } from "./orders.types.js";

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
  const { order, refundRecorded } = await ordersService.cancelOrder(userId, orderNumber);
  res.status(200).json({ success: true, data: { ...order, refundRecorded } });
}

// ---------------------------------------------------------------------------
// Admin order management (Phase 11: API only — the admin UI ships in Phase 13)
// ---------------------------------------------------------------------------

export async function listAdmin(req: Request, res: Response): Promise<void> {
  const result = await ordersService.listAdminOrders(req.query);
  res.status(200).json({ success: true, data: result });
}

export async function detailAdmin(req: Request, res: Response): Promise<void> {
  const { orderNumber } = req.params;
  const order = await ordersService.getAdminOrderByNumber(orderNumber);
  res.status(200).json({ success: true, data: order });
}

export async function changeStatus(req: Request, res: Response): Promise<void> {
  const adminUserId = req.user!.id;
  const { orderNumber } = req.params;
  const { status, note } = req.body as { status: OrderStatus; note?: string };
  const order = await ordersService.changeOrderStatus({ orderNumber, adminUserId, status, note });
  res.status(200).json({ success: true, data: order });
}
