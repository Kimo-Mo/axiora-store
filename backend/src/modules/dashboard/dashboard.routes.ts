import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as controller from "./dashboard.controller.js";

export const adminDashboardRouter = Router();

adminDashboardRouter.get("/stats", asyncHandler(controller.getDashboardStats));
