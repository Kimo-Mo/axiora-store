import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { getLowStockThreshold } from "../inventory/inventory.service.js";

export interface DashboardStats {
  orders: {
    total: number;
    pending: number;
    processing: number;
    delivered: number;
    cancelled: number;
    returned: number;
  };
  revenue: {
    total: string;
    thisMonth: string;
    currency: string;
  };
  products: {
    total: number;
    active: number;
    inactive: number;
  };
  inventory: {
    lowStockCount: number;
    threshold: number;
  };
  paymentSplit: {
    codCount: number;
    codAmount: string;
    onlineCount: number;
    onlineAmount: string;
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Money KPIs recognise exactly these statuses, so revenue and the payment
  // split agree on what counts as "worth counting": pending money is not yet
  // revenue and cancelled/returned money is not collected at all.
  const revenueWhere: Prisma.OrderWhereInput = {
    status: { in: ["DELIVERED", "PROCESSING", "CONFIRMED"] },
  };

  // Fetch low-stock threshold from shared inventory service (S-8)
  const threshold = await getLowStockThreshold();

  // Execute all aggregations concurrently in <50ms
  const [
    totalOrders,
    orderStatusGroups,
    totalRevenueAgg,
    monthRevenueAgg,
    totalProducts,
    activeProducts,
    lowStockQuery,
    paymentMethodGroups,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: revenueWhere,
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        ...revenueWhere,
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
      SELECT COUNT(*)::bigint AS count
      FROM "ProductVariant" pv
      JOIN "Product" p ON p."id" = pv."productId"
      WHERE pv."isActive" = true
        AND p."isActive" = true
        AND (pv."stockQuantity" - pv."reservedQuantity") <= ${threshold}
    `),
    prisma.order.groupBy({
      by: ["paymentMethod"],
      _count: { id: true },
      _sum: { total: true },
      // Same scope as the revenue KPIs — see `revenueWhere` above.
      where: revenueWhere,
    }),
  ]);

  // Map order status counts
  const statusMap = new Map<string, number>();
  for (const group of orderStatusGroups) {
    statusMap.set(group.status, group._count.id);
  }

  // Map payment method splits
  let codCount = 0;
  let codAmount = new Prisma.Decimal(0);
  let onlineCount = 0;
  let onlineAmount = new Prisma.Decimal(0);

  for (const group of paymentMethodGroups) {
    if (group.paymentMethod === "COD") {
      codCount = group._count.id;
      codAmount = group._sum.total ?? new Prisma.Decimal(0);
    } else if (group.paymentMethod === "ONLINE") {
      onlineCount = group._count.id;
      onlineAmount = group._sum.total ?? new Prisma.Decimal(0);
    }
  }

  const lowStockCount = Number(lowStockQuery[0]?.count ?? 0);

  return {
    orders: {
      total: totalOrders,
      pending: statusMap.get("PENDING") ?? 0,
      processing: statusMap.get("PROCESSING") ?? 0,
      delivered: statusMap.get("DELIVERED") ?? 0,
      cancelled: statusMap.get("CANCELLED") ?? 0,
      returned: statusMap.get("RETURNED") ?? 0,
    },
    revenue: {
      total: (totalRevenueAgg._sum.total ?? new Prisma.Decimal(0)).toFixed(2),
      thisMonth: (monthRevenueAgg._sum.total ?? new Prisma.Decimal(0)).toFixed(2),
      currency: "EGP",
    },
    products: {
      total: totalProducts,
      active: activeProducts,
      inactive: Math.max(0, totalProducts - activeProducts),
    },
    inventory: {
      lowStockCount,
      threshold,
    },
    paymentSplit: {
      codCount,
      codAmount: codAmount.toFixed(2),
      onlineCount,
      onlineAmount: onlineAmount.toFixed(2),
    },
  };
}
