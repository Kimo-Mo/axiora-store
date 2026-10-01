import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../errors.js";
import { env } from "../../config/env.js";

function prismaErrorToResponse(err: Prisma.PrismaClientKnownRequestError): {
  status: number;
  message: string;
  code: string;
} {
  switch (err.code) {
    case "P2002":
      return {
        status: 409,
        message: "Resource already exists",
        code: "CONFLICT",
      };
    case "P2025":
      return {
        status: 404,
        message: "Resource not found",
        code: "NOT_FOUND",
      };
    case "P2003":
      return {
        status: 400,
        message: "Invalid reference to a related resource",
        code: "VALIDATION_ERROR",
      };
    default:
      return {
        status: 500,
        message: "Database error",
        code: "DATABASE_ERROR",
      };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: err.flatten(),
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = prismaErrorToResponse(err);
    res.status(mapped.status).json({
      success: false,
      error: {
        message: mapped.message,
        code: mapped.code,
      },
    });
    return;
  }

  if (env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  });
}
