import type { Request, Response } from "express";
import * as dashboardService from "./dashboard.service.js";

export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  const stats = await dashboardService.getDashboardStats();
  res.json({
    success: true,
    data: stats,
  });
}
