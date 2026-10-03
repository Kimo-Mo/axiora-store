import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { FRONTEND_ORIGIN } from "./config/env.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { NotFoundError } from "./shared/errors.js";
import { requireAdmin, requireAuth } from "./shared/middleware/auth.js";
import { csrfGuard } from "./shared/middleware/csrf.js";
import { errorHandler } from "./shared/middleware/errorHandler.js";

export const app = express();

// Required so `req.ip` is the real client address forwarded by Next.js rather than
// the proxy's loopback address. Without it every customer shares one rate-limit
// budget and one of them throttles everyone.
app.set("trust proxy", 1);

app.use(helmet());

// A credentialed API must never send a wildcard origin. Browsers refuse to attach
// credentials to `*` anyway, so the wildcard is simultaneously useless and a
// signal of an unset policy. The storefront is same-origin through `proxy.ts`, so
// this is defence in depth for direct backend access and future consumers.
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

// Applies to every mutating request across all routers.
app.use("/api/v1", csrfGuard);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1", usersRouter);

/**
 * Administrator namespace. It has no routes yet, so it answers 404 — but the guard
 * is mounted for real, which makes the authorization boundary something a request
 * must pass rather than something a later phase remembers to add.
 */
const adminRouter = express.Router();
adminRouter.use(requireAuth, requireAdmin);
app.use("/api/v1/admin", adminRouter);

app.use("/api/v1", () => {
  throw new NotFoundError("Route not found");
});

app.use(errorHandler);

export default app;
