import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { NotFoundError, ValidationError } from "../../shared/errors.js";
import { buildAdminListResult } from "../../shared/utils/pagination.js";
import type {
  AdjustmentsQueryInput,
  InventoryQueryInput,
  StockAdjustmentInput,
} from "./inventory.schemas.js";

const DEFAULT_LOW_STOCK_THRESHOLD = 5;
const SETTING_LOW_STOCK_KEY = "low_stock_threshold";

export async function getLowStockThreshold(): Promise<number> {
  const setting = await prisma.setting.findUnique({
    where: { key: SETTING_LOW_STOCK_KEY },
  });

  if (!setting || setting.value === null || setting.value === undefined) {
    return DEFAULT_LOW_STOCK_THRESHOLD;
  }

  if (typeof setting.value === "number") {
    return setting.value;
  }

  if (typeof setting.value === "object" && "threshold" in (setting.value as Record<string, unknown>)) {
    const threshold = (setting.value as { threshold: unknown }).threshold;
    return typeof threshold === "number" ? threshold : DEFAULT_LOW_STOCK_THRESHOLD;
  }

  return DEFAULT_LOW_STOCK_THRESHOLD;
}

export async function updateLowStockThreshold(threshold: number): Promise<{ lowStockThreshold: number }> {
  await prisma.setting.upsert({
    where: { key: SETTING_LOW_STOCK_KEY },
    create: {
      key: SETTING_LOW_STOCK_KEY,
      value: { threshold },
    },
    update: {
      value: { threshold },
    },
  });

  return { lowStockThreshold: threshold };
}

const inventoryVariantInclude = {
  product: {
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  },
  attributeValues: {
    include: {
      attribute: true,
    },
  },
} as const;

type InventoryVariantRecord = Prisma.ProductVariantGetPayload<{
  include: typeof inventoryVariantInclude;
}>;

function mapInventoryVariant(v: InventoryVariantRecord, threshold: number) {
  const availableQuantity = v.stockQuantity - v.reservedQuantity;
  const isLowStock = availableQuantity <= threshold;
  const primaryImg = v.product.images[0]?.url ?? null;

  return {
    variantId: v.id,
    sku: v.sku,
    productId: v.product.id,
    productSlug: v.product.slug,
    productNameAr: v.product.nameAr,
    productNameEn: v.product.nameEn,
    primaryImageUrl: primaryImg,
    price: v.price.toString(),
    stockQuantity: v.stockQuantity,
    reservedQuantity: v.reservedQuantity,
    availableQuantity,
    isLowStock,
    isActive: v.isActive,
    attributes: v.attributeValues.map((av) => ({
      attributeSlug: av.attribute.slug,
      attributeNameAr: av.attribute.nameAr,
      attributeNameEn: av.attribute.nameEn,
      valueAr: av.valueAr,
      valueEn: av.valueEn,
    })),
  };
}

export async function listInventory(input: InventoryQueryInput) {
  const threshold = await getLowStockThreshold();
  const page = input.page;
  const limit = input.limit;
  const skip = (page - 1) * limit;

  if (input.lowStockOnly) {
    const term = input.search?.trim();
    const searchPattern = term ? `%${term}%` : null;
    const searchCondition = searchPattern
      ? Prisma.sql`AND (
          pv."sku" ILIKE ${searchPattern} OR
          p."nameAr" ILIKE ${searchPattern} OR
          p."nameEn" ILIKE ${searchPattern}
        )`
      : Prisma.empty;

    const [countRows, idRows] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS count
        FROM "ProductVariant" pv
        JOIN "Product" p ON p."id" = pv."productId"
        WHERE (pv."stockQuantity" - pv."reservedQuantity") <= ${threshold}
        ${searchCondition}
      `),
      prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT pv."id"
        FROM "ProductVariant" pv
        JOIN "Product" p ON p."id" = pv."productId"
        WHERE (pv."stockQuantity" - pv."reservedQuantity") <= ${threshold}
        ${searchCondition}
        ORDER BY pv."stockQuantity" ASC, pv."sku" ASC
        LIMIT ${limit} OFFSET ${skip}
      `),
    ]);

    const total = Number(countRows[0]?.count ?? 0n);
    const ids = idRows.map((r) => r.id);

    if (ids.length === 0) {
      return buildAdminListResult([], total, page, limit);
    }

    const rawVariants = await prisma.productVariant.findMany({
      where: { id: { in: ids } },
      include: inventoryVariantInclude,
    });

    const idOrderMap = new Map(ids.map((id, idx) => [id, idx]));
    rawVariants.sort((a, b) => (idOrderMap.get(a.id) ?? 0) - (idOrderMap.get(b.id) ?? 0));

    const results = rawVariants.map((v) => mapInventoryVariant(v, threshold));

    return buildAdminListResult(results, total, page, limit);
  }

  // Pure Prisma database query with skip/take
  const where: Prisma.ProductVariantWhereInput = {};

  if (input.search && input.search.trim()) {
    const term = input.search.trim();
    where.OR = [
      { sku: { contains: term, mode: "insensitive" } },
      { product: { nameAr: { contains: term, mode: "insensitive" } } },
      { product: { nameEn: { contains: term, mode: "insensitive" } } },
    ];
  }

  const [total, rawVariants] = await Promise.all([
    prisma.productVariant.count({ where }),
    prisma.productVariant.findMany({
      where,
      include: inventoryVariantInclude,
      orderBy: [
        { stockQuantity: "asc" },
        { sku: "asc" },
      ],
      skip,
      take: limit,
    }),
  ]);

  const results = rawVariants.map((v) => mapInventoryVariant(v, threshold));

  return buildAdminListResult(results, total, page, limit);
}

/**
 * Apply a manual stock adjustment atomically.
 *
 * The mutation is a single conditional `UPDATE`: the WHERE clause re-checks the
 * current stock at write time, so a reservation committed between the
 * administrator opening the form and pressing "apply" cannot be silently
 * clobbered by a read-modify-write. The row is updated only when the result
 * satisfies both invariants (never negative, never below reservation) — and a
 * losing candidate fails with zero rows updated rather than corrupting stock.
 *
 * The audit-log insert runs inside the same transaction, so an adjustment can
 * never exist without its log entry.
 */
export async function adjustStock(input: StockAdjustmentInput, adjustedBy: string) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.$queryRaw<Array<{ stockQuantity: number; reservedQuantity: number }>>`
      UPDATE "ProductVariant"
      SET "stockQuantity" = "stockQuantity" + ${input.quantityChange}
      WHERE "id" = ${input.variantId}
        AND "stockQuantity" + ${input.quantityChange} >= 0
        AND "stockQuantity" + ${input.quantityChange} >= "reservedQuantity"
      RETURNING "stockQuantity", "reservedQuantity"
    `;

    if (updated.length === 0) {
      // No row changed: either the variant is gone, or an invariant would have
      // been violated. Re-read to produce the precise error.
      const variant = await tx.productVariant.findUnique({
        where: { id: input.variantId },
        select: { reservedQuantity: true, stockQuantity: true },
      });

      if (!variant) {
        throw new NotFoundError("Variant not found");
      }

      if (variant.stockQuantity + input.quantityChange < 0) {
        throw new ValidationError("Resulting stock quantity cannot fall below zero", {
          code: "INVALID_STOCK_ADJUSTMENT",
        });
      }

      throw new ValidationError(
        `Stock quantity cannot fall below reserved quantity (${variant.reservedQuantity})`,
        { code: "INVALID_STOCK_ADJUSTMENT" },
      );
    }

    const { stockQuantity: newStock, reservedQuantity } = updated[0];
    const previousStock = newStock - input.quantityChange;

    // Create adjustment audit log
    const adjustment = await tx.inventoryAdjustment.create({
      data: {
        variantId: input.variantId,
        quantityChange: input.quantityChange,
        reason: input.reason,
        adjustedBy,
      },
    });

    return {
      adjustment: {
        id: adjustment.id,
        variantId: adjustment.variantId,
        quantityChange: adjustment.quantityChange,
        previousStock,
        newStock,
        reason: adjustment.reason,
        adjustedBy: adjustment.adjustedBy,
        createdAt: adjustment.createdAt.toISOString(),
      },
      variant: {
        id: input.variantId,
        stockQuantity: newStock,
        reservedQuantity,
        availableQuantity: newStock - reservedQuantity,
      },
    };
  });
}

export async function listAdjustments(input: AdjustmentsQueryInput) {
  const page = input.page;
  const limit = input.limit;
  const skip = (page - 1) * limit;

  const where: Prisma.InventoryAdjustmentWhereInput = {};
  if (input.variantId) {
    where.variantId = input.variantId;
  }

  const [total, adjustments] = await Promise.all([
    prisma.inventoryAdjustment.count({ where }),
    prisma.inventoryAdjustment.findMany({
      where,
      include: {
        variant: {
          include: {
            product: {
              select: { nameAr: true, nameEn: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  const results = adjustments.map((adj) => ({
    id: adj.id,
    variantId: adj.variantId,
    variantSku: adj.variant.sku,
    productNameAr: adj.variant.product.nameAr,
    productNameEn: adj.variant.product.nameEn,
    quantityChange: adj.quantityChange,
    reason: adj.reason,
    adjustedBy: adj.adjustedBy,
    createdAt: adj.createdAt.toISOString(),
  }));

  return buildAdminListResult(results, total, page, limit);
}
