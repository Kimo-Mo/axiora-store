import type { Request, Response } from "express";
import * as shippingService from "./shipping.service.js";

export async function getRates(_req: Request, res: Response): Promise<void> {
  const rates = await shippingService.listActiveRates();
  res.status(200).json({ success: true, data: { rates } });
}

export async function getRate(req: Request, res: Response): Promise<void> {
  const { governorate } = req.params;
  const rate = await shippingService.getRateByGovernorate(governorate);
  res.status(200).json({ success: true, data: rate });
}

// --- Admin Shipping Controllers (PLAN.md Phase 8 Task 1) ---

export async function adminListZones(_req: Request, res: Response): Promise<void> {
  const zones = await shippingService.listAllZones();
  res.status(200).json({ success: true, data: { zones } });
}

export async function adminGetZone(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const zone = await shippingService.getZoneById(id);
  res.status(200).json({ success: true, data: zone });
}

export async function adminCreateZone(req: Request, res: Response): Promise<void> {
  const zone = await shippingService.createZone(req.body);
  res.status(201).json({ success: true, data: zone });
}

export async function adminUpdateZone(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const zone = await shippingService.updateZone(id, req.body);
  res.status(200).json({ success: true, data: zone });
}

export async function adminDeleteZone(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await shippingService.deleteZone(id);
  res.status(200).json({ success: true, message: "Shipping zone deleted successfully" });
}
