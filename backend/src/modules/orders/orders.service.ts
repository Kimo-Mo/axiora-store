import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError, NotFoundError, ValidationError } from "../../shared/errors.js";
import { round2 } from "../../shared/utils/currency.js";
import { canonicalizePhone } from "../../shared/utils/phone.js";
import { getOrCreateCart } from "../carts/carts.service.js";
import { nextOrderNumber } from "./order-number.js";
import { DEFAULT_CURRENCY } from "./orders.types.js";
import type {
  CheckoutQuoteDto,
  CreateOrderInput,
  OrderDto,
  OrderItemDto,
  OrderListResultDto,
  OrderStatusHistoryDto,
  OrderSummaryDto,
  OrderStatus,
  ShippingAddressSnapshot,
  UnavailableItemDto,
  VariantSnapshot,
} from "./orders.types.js";

type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/** Include clause for hydrating a full order with items and history. */
const orderInclude = {
  items: true,
  statusHistory: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.OrderInclude;

type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;



/** Read a `{ amount: number }` setting payload (research D-4: fallback 0). */
function getSettingAmount(value: Prisma.JsonValue | null | undefined): number {
  if (value && typeof value === "object" && !Array.isArray(value) && "amount" in value) {
    const amount = (value as { amount?: unknown }).amount;
    if (typeof amount === "number") return amount;
  }
  return 0;
}

function hydrateOrderItem(item: OrderWithRelations["items"][number]): OrderItemDto {
  return {
    id: item.id,
    productNameSnapshot: item.productNameSnapshot,
    skuSnapshot: item.skuSnapshot,
    variantSnapshot: item.variantSnapshot as unknown as VariantSnapshot,
    unitPrice: round2(Number(item.unitPrice)),
    quantity: item.quantity,
    lineTotal: round2(Number(item.lineTotal)),
    imageSnapshot: item.imageSnapshot,
  };
}

function hydrateHistoryEntry(
  entry: OrderWithRelations["statusHistory"][number],
): OrderStatusHistoryDto {
  return {
    id: entry.id,
    status: entry.status,
    note: entry.note,
    createdAt: entry.createdAt.toISOString(),
  };
}

function hydrateOrder(order: OrderWithRelations): OrderDto {
  const snapshot = order.shippingAddressSnapshot as unknown as ShippingAddressSnapshot;
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod as "COD",
    paymentStatus: order.paymentStatus,
    subtotal: round2(Number(order.subtotal)),
    discountTotal: round2(Number(order.discountTotal)),
    shippingFee: round2(Number(order.shippingFee)),
    codFee: round2(Number(order.codFee)),
    total: round2(Number(order.total)),
    currency: order.currency,
    shippingAddressSnapshot: snapshot,
    customerPhoneSnapshot: order.customerPhoneSnapshot,
    notes: order.notes,
    estimatedDeliveryDays: snapshot?.estimatedDeliveryDays ?? null,
    items: order.items.map(hydrateOrderItem),
    statusHistory: order.statusHistory.map(hydrateHistoryEntry),
    createdAt: order.createdAt.toISOString(),
  };
}

function unavailableFromCart(
  items: { variantId: string; isAvailable: boolean; product: { nameAr: string; nameEn: string } }[],
): UnavailableItemDto[] {
  return items
    .filter((item) => !item.isAvailable)
    .map((item) => ({
      variantId: item.variantId,
      productNameAr: item.product.nameAr,
      productNameEn: item.product.nameEn,
    }));
}

async function loadActiveZone(client: PrismaTransactionClient, governorate: string) {
  const zone = await client.shippingZone.findFirst({
    where: { governorate, isActive: true },
  });
  if (!zone) {
    throw new AppError(
      `Delivery is currently unavailable for governorate: ${governorate}`,
      400,
      "DELIVERY_UNAVAILABLE",
    );
  }
  return zone;
}

/**
 * Resolve the shipping address for the order. When the customer opted in to
 * saving a fresh address, the Address row is created in the same transaction
 * (clarification Q5: opt-in only, unchecked by default).
 */
async function resolveShippingAddress(
  tx: PrismaTransactionClient,
  userId: string,
  input: CreateOrderInput,
): Promise<Omit<ShippingAddressSnapshot, "estimatedDeliveryDays">> {
  if (input.shippingAddressId) {
    const address = await tx.address.findFirst({
      where: { id: input.shippingAddressId, userId },
    });
    if (!address) {
      throw new NotFoundError("Shipping address not found");
    }
    return {
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      governorate: address.governorate,
      city: address.city,
      area: address.area,
      street: address.street,
      building: address.building,
      floor: address.floor,
      apartment: address.apartment,
      landmark: address.landmark,
      notes: address.notes,
    };
  }

  const fresh = input.newAddress;
  if (!fresh) {
    throw new ValidationError("Provide either shippingAddressId or newAddress");
  }

  if (input.saveNewAddress === true) {
    const count = await tx.address.count({ where: { userId } });
    if (fresh.isDefault === true) {
      // Clear-then-set must be atomic — the order transaction provides that.
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    await tx.address.create({
      data: {
        userId,
        label: fresh.label ?? null,
        fullName: fresh.fullName,
        phone: fresh.phone,
        governorate: fresh.governorate,
        city: fresh.city,
        area: fresh.area ?? null,
        street: fresh.street,
        building: fresh.building ?? null,
        floor: fresh.floor ?? null,
        apartment: fresh.apartment ?? null,
        landmark: fresh.landmark ?? null,
        notes: fresh.notes ?? null,
        // First saved address becomes the default, mirroring the account
        // settings convention (users.service.createAddress).
        isDefault: fresh.isDefault === true || count === 0,
      },
    });
  }

  return {
    label: fresh.label ?? null,
    fullName: fresh.fullName,
    phone: fresh.phone,
    governorate: fresh.governorate,
    city: fresh.city,
    area: fresh.area ?? null,
    street: fresh.street,
    building: fresh.building ?? null,
    floor: fresh.floor ?? null,
    apartment: fresh.apartment ?? null,
    landmark: fresh.landmark ?? null,
    notes: fresh.notes ?? null,
  };
}

export interface CreateOrderResult {
  order: OrderDto;
  idempotentReplay: boolean;
}

/**
 * Server-computed pre-order totals for the caller's current cart and the
 * selected governorate (research.md D-4). Creates nothing, reserves nothing.
 */
export async function quote(
  userId: string,
  input: { governorate: string; paymentMethod: "COD" },
): Promise<CheckoutQuoteDto> {
  const cart = await getOrCreateCart(userId);
  const zone = await loadActiveZone(prisma, input.governorate);

  const subtotal = round2(cart.items.reduce((sum, item) => sum + item.lineTotal, 0));
  const shippingFee = round2(Number(zone.deliveryFee));
  const codSetting = await prisma.setting.findUnique({ where: { key: "COD_FEE" } });
  const codFee = input.paymentMethod === "COD" ? round2(getSettingAmount(codSetting?.value)) : 0;
  const discountTotal = 0;
  const total = round2(subtotal - discountTotal + shippingFee + codFee);

  const unavailableItems = unavailableFromCart(cart.items);

  return {
    subtotal,
    shippingFee,
    codFee,
    discountTotal,
    total,
    currency: DEFAULT_CURRENCY,
    estimatedDays: zone.estimatedDays,
    isOrderable: cart.items.length > 0 && unavailableItems.length === 0,
    unavailableItems,
  };
}

/**
 * Transactional, idempotent, atomically stock-reserving order creation
 * (research.md D-2/D-3/D-5, spec FR-009..FR-015).
 */
export async function createOrder(
  userId: string,
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  return prisma.$transaction(async (tx) => {
    // 1. Idempotency replay — a repeated submission returns the existing order
    //    without creating a duplicate or reserving stock twice. This check
    //    precedes every other validation: after the first success the cart is
    //    empty, so an empty-cart rejection must never shadow a replay.
    const existing = await tx.order.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      include: orderInclude,
    });
    if (existing) {
      if (existing.userId !== userId) {
        throw new ValidationError("Idempotency key already in use");
      }
      return { order: hydrateOrder(existing), idempotentReplay: true };
    }

    // 1.5 COD phone gate (FR-012). Inside the transaction so a phone change
    //     committing concurrently with this submission cannot slip a COD order
    //     through; after the replay check so replays of created orders are
    //     never blocked by a later phone change; before any stock reservation
    //     so a blocked order reserves nothing. Conditional on `paymentMethod`
    //     so the Phase 10 online path passes untouched (FR-017).
    //     Verified alone is not enough: the flag belongs to the account phone,
    //     so the delivery phone must be that same number — otherwise a
    //     customer verified on one mobile could take COD delivery on another.
    const orderUser = await tx.user.findUnique({
      where: { id: userId },
      select: { phone: true, phoneVerified: true },
    });
    if (input.paymentMethod === "COD") {
      if (!orderUser || !orderUser.phoneVerified) {
        throw new AppError(
          "Cash on Delivery requires a verified phone number",
          403,
          "PHONE_NOT_VERIFIED",
          true,
        );
      }
      // The stored value is canonicalized at compare time so rows written
      // before the canonical form existed still match.
      if (canonicalizePhone(orderUser.phone ?? "") !== input.customerPhone) {
        throw new AppError(
          "Cash on Delivery requires the delivery phone to be your verified number",
          403,
          "PHONE_MISMATCH",
          true,
        );
      }
    }

    // 2. Load the caller's cart (creates an empty cart row when absent, which
    //    the check below rejects — the API is the authority, FR-002).
    const cart = await getOrCreateCart(userId, tx);
    if (cart.items.length === 0) {
      throw new ValidationError("Your cart is empty");
    }

    // 3. Validate every item against active variants and available stock.
    //    Stale-cart failures are 400 (the cart is stale, not contested).
    const unavailableItems = unavailableFromCart(cart.items);
    if (unavailableItems.length > 0) {
      throw new ValidationError("Some items in your cart are no longer available", {
        items: unavailableItems,
      });
    }

    // 4. Resolve the shipping address first — its governorate drives the zone
    //    lookup, so the order's shipping is always derived from the stored
    //    address, never from a client-supplied string.
    const addressBase = await resolveShippingAddress(tx, userId, input);

    // 5. Resolve the active shipping zone by the address's governorate.
    const zone = await loadActiveZone(tx, addressBase.governorate);
    const shippingFee = round2(Number(zone.deliveryFee));

    const shippingAddressSnapshot: ShippingAddressSnapshot = {
      ...addressBase,
      estimatedDeliveryDays: zone.estimatedDays,
    };

    // 6. Server-side totals from authoritative prices, zone, and settings.
    const subtotal = round2(cart.items.reduce((sum, item) => sum + item.lineTotal, 0));
    const codSetting = await tx.setting.findUnique({ where: { key: "COD_FEE" } });
    const codFee = input.paymentMethod === "COD" ? round2(getSettingAmount(codSetting?.value)) : 0;
    const discountTotal = 0;
    const total = round2(subtotal - discountTotal + shippingFee + codFee);

    // 7. Atomic reservation per item (D-2). A single conditional UPDATE — no
    //    observable read-then-write window; 0 rows affected aborts everything.
    for (const item of cart.items) {
      const reserved = await tx.$executeRaw`
        UPDATE "ProductVariant"
        SET "reservedQuantity" = "reservedQuantity" + ${item.quantity}
        WHERE "id" = ${item.variantId}
          AND "isActive" = true
          AND "stockQuantity" - "reservedQuantity" >= ${item.quantity}
      `;
      if (reserved === 0) {
        throw new AppError(
          "Insufficient stock for one or more items in your order",
          409,
          "INSUFFICIENT_STOCK",
          true,
          {
            items: [
              {
                variantId: item.variantId,
                productNameAr: item.product.nameAr,
                productNameEn: item.product.nameEn,
              },
            ],
          },
        );
      }
    }

    // 8. Draw the order number from the PostgreSQL sequence (D-1).
    let orderNumber = await nextOrderNumber(tx);

    const baseOrderData = {
      idempotencyKey: input.idempotencyKey,
      userId,
      status: "PENDING" as const,
      paymentMethod: "COD" as const,
      paymentStatus: "PENDING" as const,
      subtotal,
      discountTotal,
      shippingFee,
      codFee,
      total,
      shippingAddressSnapshot: shippingAddressSnapshot as unknown as Prisma.InputJsonObject,
      customerPhoneSnapshot: input.customerPhone,
      notes: input.notes ?? null,
    };

    // 9. Create the order. Rare unique violations are distinguished by the
    //    constraint target: an idempotency-key race replays the existing order
    //    (D-3); an order-number collision redraws once (D-1).
    let created: Prisma.OrderGetPayload<Record<string, never>>;
    try {
      created = await tx.order.create({ data: { ...baseOrderData, orderNumber } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const target = (err.meta as { target?: string[] } | undefined)?.target ?? [];
        if (target.includes("idempotencyKey")) {
          const replayOrder = await tx.order.findUnique({
            where: { idempotencyKey: input.idempotencyKey },
            include: orderInclude,
          });
          if (replayOrder) {
            if (replayOrder.userId !== userId) {
              throw new ValidationError("Idempotency key already in use");
            }
            return { order: hydrateOrder(replayOrder), idempotentReplay: true };
          }
        }
        if (target.includes("orderNumber")) {
          orderNumber = await nextOrderNumber(tx);
          created = await tx.order.create({ data: { ...baseOrderData, orderNumber } });
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

    // 10. Immutable item snapshots — historical orders never depend on the
    //     current catalog (FR-013).
    await tx.orderItem.createMany({
      data: cart.items.map((item) => ({
        orderId: created.id,
        productNameSnapshot: item.product.nameEn,
        skuSnapshot: item.variant.sku,
        variantSnapshot: {
          variantId: item.variant.id,
          nameAr: item.product.nameAr,
          nameEn: item.product.nameEn,
          sku: item.variant.sku,
          attributes: item.variant.attributes,
        } satisfies VariantSnapshot,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
        imageSnapshot: item.product.primaryImage,
      })),
    });

    // 11. Initial status-history entry (FR-015).
    await tx.orderStatusHistory.create({
      data: { orderId: created.id, status: "PENDING", note: "Order placed" },
    });

    // 12. Clear the cart — the items became the order (SC-006).
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    // 13. Hydrate the authoritative OrderDto.
    const finalOrder = await tx.order.findUnique({
      where: { id: created.id },
      include: orderInclude,
    });
    if (!finalOrder) {
      throw new Error("Order vanished inside the creation transaction");
    }
    return { order: hydrateOrder(finalOrder), idempotentReplay: false };
  });
}

/**
 * Paginated list of the requesting customer's orders, newest first (FR-018).
 */
export async function listOrders(
  userId: string,
  query: { page?: number; limit?: number; status?: OrderStatus },
): Promise<OrderListResultDto> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const where: Prisma.OrderWhereInput = {
    userId,
    ...(query.status ? { status: query.status } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { items: { select: { quantity: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  const summaries: OrderSummaryDto[] = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod as "COD",
    total: round2(Number(order.total)),
    currency: order.currency,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt.toISOString(),
  }));

  return {
    orders: summaries,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

/**
 * Full detail for an order owned by the caller. Foreign or missing orders are
 * indistinguishable — no existence oracle for other customers' orders (FR-018).
 */
export async function getOrderByNumber(userId: string, orderNumber: string): Promise<OrderDto> {
  const order = await prisma.order.findFirst({
    where: { orderNumber, userId },
    include: orderInclude,
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  return hydrateOrder(order);
}

/**
 * Customer cancellation (research.md D-6, spec FR-017). Allowed only from
 * PENDING/CONFIRMED; releases reservations atomically and records history.
 */
export async function cancelOrder(userId: string, orderNumber: string): Promise<OrderDto> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { orderNumber, userId },
      include: { items: true },
    });
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      throw new AppError("This order can no longer be cancelled", 409, "ORDER_NOT_CANCELLABLE");
    }

    await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    await tx.orderStatusHistory.create({
      data: { orderId: order.id, status: "CANCELLED", note: "Cancelled by customer" },
    });

    // Release reservations atomically; the GREATEST guard plus the CHECK
    // constraint keeps the column non-negative even under double-cancel races.
    // OrderItem anchors its variant through the snapshot JSON (Phase 4
    // foundation has no variantId column on OrderItem).
    for (const item of order.items) {
      const variantId = (item.variantSnapshot as { variantId?: string } | null)?.variantId;
      if (!variantId) {
        throw new Error(`Order item ${item.id} has no variant reference in its snapshot`);
      }
      await tx.$executeRaw`
        UPDATE "ProductVariant"
        SET "reservedQuantity" = GREATEST("reservedQuantity" - ${item.quantity}, 0)
        WHERE "id" = ${variantId}
      `;
    }

    const refreshed = await tx.order.findUnique({ where: { id: order.id }, include: orderInclude });
    if (!refreshed) {
      throw new Error("Order vanished inside the cancellation transaction");
    }
    return hydrateOrder(refreshed);
  });
}
