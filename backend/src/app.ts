import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { FRONTEND_ORIGIN } from "./config/env.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import {
  adminBrandsRouter,
  brandsRouter,
} from "./modules/brands/brands.routes.js";
import {
  adminCategoriesRouter,
  categoriesRouter,
} from "./modules/categories/categories.routes.js";
import { adminProductsRouter, productsRouter } from "./modules/products/products.routes.js";
import { cartsRouter } from "./modules/carts/carts.routes.js";
import { checkoutRouter, ordersRouter } from "./modules/orders/orders.routes.js";
import { adminShippingRouter, shippingRouter } from "./modules/shipping/shipping.routes.js";
import { uploadsRouter } from "./modules/uploads/uploads.routes.js";
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
app.use("/api/v1/cart", cartsRouter);
app.use("/api/v1", usersRouter);

// Public storefront catalog. Read-only and unauthenticated — every price, "from"
// price and stock status in these responses is computed server-side, so there is
// nothing here a client could not have derived for itself, and nothing here that
// needs a session to be correct.
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/brands", brandsRouter);
app.use("/api/v1/products", productsRouter);

// Public shipping coverage. Read-only and unauthenticated — delivery fees and
// estimates come from seeded ShippingZone records, so nothing here is hardcoded.
app.use("/api/v1/shipping", shippingRouter);

// Authenticated customer checkout + order interfaces.
app.use("/api/v1/checkout", checkoutRouter);
app.use("/api/v1/orders", ordersRouter);

/**
 * Administrator namespace. `requireAuth` + `requireAdmin` are mounted before any
 * route, so every admin router below inherits the authorization boundary — a new
 * admin router added later is guarded by being *mounted here*, not by remembering
 * to add middleware to it.
 */
const adminRouter = express.Router();
adminRouter.use(requireAuth, requireAdmin);
adminRouter.use("/categories", adminCategoriesRouter);
adminRouter.use("/brands", adminBrandsRouter);
adminRouter.use("/products", adminProductsRouter);
adminRouter.use("/shipping", adminShippingRouter);
adminRouter.use("/uploads", uploadsRouter);
app.use("/api/v1/admin", adminRouter);

app.use("/api/v1", () => {
  throw new NotFoundError("Route not found");
});

app.use(errorHandler);

export default app;
