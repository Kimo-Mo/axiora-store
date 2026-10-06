import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { NotFoundError, ValidationError } from "../../shared/errors.js";
import { LOW_STOCK_THRESHOLD } from "../products/products.types.js";
import type {
  AddToCartInput,
  CartItemDto,
  CartNotice,
  CartResponseDto,
  MergeCartItemInput,
} from "./carts.types.js";
import { DEFAULT_CURRENCY } from "./carts.types.js";

type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/** Include clause for fetching cart with all nested items, variants, attributes, and images. */
const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: {
                orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
              },
            },
          },
          attributeValues: {
            include: {
              attribute: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

type CartWithRelations = Prisma.CartGetPayload<{ include: typeof cartInclude }>;
type CartItemWithRelations = CartWithRelations["items"][number];

/**
 * Compute real available variant inventory considering reserved stock.
 */
function getAvailableStock(variant: { stockQuantity: number; reservedQuantity: number }): number {
  return Math.max(0, variant.stockQuantity - variant.reservedQuantity);
}

/**
 * Factory for creating bilingual cart notices during cart merge.
 */
function buildNotice(
  type: "OUT_OF_STOCK" | "STOCK_CAPPED" | "PRICE_CHANGED",
  variantId: string,
  productNameAr: string,
  productNameEn: string,
  opts?: { oldValue?: number; newValue?: number; reason?: "UNAVAILABLE" | "OUT_OF_STOCK" }
): CartNotice {
  if (type === "OUT_OF_STOCK") {
    const isUnavailable = opts?.reason === "UNAVAILABLE";
    return {
      type: "OUT_OF_STOCK",
      variantId,
      productNameAr,
      productNameEn,
      messageAr: isUnavailable
        ? "هذا المنتج لم يعد متوفراً وتم حذفه من السلة."
        : `نفد مخزون ${productNameAr} وتم حذفه من السلة.`,
      messageEn: isUnavailable
        ? "This product is no longer available and was excluded from your cart."
        : `${productNameEn} is out of stock and was excluded from your cart.`,
    };
  }

  if (type === "STOCK_CAPPED") {
    return {
      type: "STOCK_CAPPED",
      variantId,
      productNameAr,
      productNameEn,
      oldValue: opts?.oldValue,
      newValue: opts?.newValue,
      messageAr: `تم تعديل كمية ${productNameAr} إلى ${opts?.newValue} بناءً على المخزون المتاح.`,
      messageEn: `Quantity for ${productNameEn} was adjusted to ${opts?.newValue} based on available stock.`,
    };
  }

  return {
    type: "PRICE_CHANGED",
    variantId,
    productNameAr,
    productNameEn,
    oldValue: opts?.oldValue,
    newValue: opts?.newValue,
    messageAr: `تم تحديث سعر ${productNameAr}.`,
    messageEn: `Price for ${productNameEn} was updated.`,
  };
}

/**
 * Hydrate a CartItem Prisma model into the authoritative CartItemDto
 */
function hydrateCartItem(item: CartItemWithRelations): CartItemDto {
  const variant = item.variant;
  const product = variant.product;
  const availableStock = getAvailableStock(variant);

  let stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" = "IN_STOCK";
  if (availableStock <= 0) {
    stockStatus = "OUT_OF_STOCK";
  } else if (availableStock <= LOW_STOCK_THRESHOLD) {
    stockStatus = "LOW_STOCK";
  }

  const unitPrice = Number(variant.price);
  const compareAtPrice =
    variant.compareAtPrice && Number(variant.compareAtPrice) > unitPrice
      ? Number(variant.compareAtPrice)
      : null;
  const lineTotal = unitPrice * item.quantity;
  const isAvailable = Boolean(variant.isActive && product.isActive && availableStock >= item.quantity);

  const attributes: Record<string, { nameAr: string; nameEn: string }> = {};
  if (Array.isArray(variant.attributeValues)) {
    for (const attrVal of variant.attributeValues) {
      if (attrVal.attribute) {
        attributes[attrVal.attribute.slug] = {
          nameAr: attrVal.valueAr,
          nameEn: attrVal.valueEn,
        };
      }
    }
  }

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    null;

  return {
    id: item.id,
    variantId: item.variantId,
    quantity: item.quantity,
    unitPrice,
    compareAtPrice,
    lineTotal,
    availableStock,
    stockStatus,
    isAvailable,
    product: {
      id: product.id,
      slug: product.slug,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      primaryImage,
    },
    variant: {
      id: variant.id,
      sku: variant.sku,
      attributes,
    },
  };
}

/**
 * Get or create cart for an authenticated user.
 */
export async function getOrCreateCart(
  userId: string,
  tx: PrismaTransactionClient = prisma
): Promise<CartResponseDto> {
  let cart: CartWithRelations | null = await tx.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  if (!cart) {
    cart = await tx.cart.create({
      data: { userId },
      include: cartInclude,
    });
  }

  const items: CartItemDto[] = cart.items.map(hydrateCartItem);
  const subtotal = items.reduce((sum: number, item: CartItemDto) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum: number, item: CartItemDto) => sum + item.quantity, 0);
  const hasUnavailableItems = items.some((item: CartItemDto) => !item.isAvailable);

  return {
    id: cart.id,
    items,
    subtotal,
    itemCount,
    currency: DEFAULT_CURRENCY,
    hasUnavailableItems,
    notices: [],
  };
}

/**
 * Add a variant to the user's cart (or increment quantity if already present).
 */
export async function addToCart(userId: string, input: AddToCartInput): Promise<CartResponseDto> {
  const quantity = input.quantity ?? 1;

  const variant = await prisma.productVariant.findUnique({
    where: { id: input.variantId },
    include: { product: true },
  });

  if (!variant || !variant.isActive || !variant.product.isActive) {
    throw new NotFoundError("Product variant not found or unavailable");
  }

  const availableStock = getAvailableStock(variant);
  if (availableStock <= 0) {
    throw new ValidationError("This variant is currently out of stock");
  }

  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId: variant.id,
      },
    },
  });

  const targetQuantity = existingItem ? existingItem.quantity + quantity : quantity;
  if (targetQuantity > availableStock) {
    throw new ValidationError(
      `Requested quantity (${targetQuantity}) exceeds available stock (${availableStock} available)`
    );
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: targetQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: variant.id,
        quantity: targetQuantity,
      },
    });
  }

  return getOrCreateCart(userId);
}

/**
 * Update an existing cart item's quantity.
 */
export async function updateCartItem(
  userId: string,
  cartItemId: string,
  quantity: number
): Promise<CartResponseDto> {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
      variant: true,
    },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new NotFoundError("Cart item not found");
  }

  const availableStock = getAvailableStock(cartItem.variant);

  if (quantity > availableStock) {
    throw new ValidationError(
      `Requested quantity (${quantity}) exceeds available stock (${availableStock} available)`
    );
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  return getOrCreateCart(userId);
}

/**
 * Remove an item from the user's cart.
 */
export async function removeCartItem(userId: string, cartItemId: string): Promise<CartResponseDto> {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new NotFoundError("Cart item not found");
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  return getOrCreateCart(userId);
}

/**
 * Clear all items from the user's cart.
 */
export async function clearCart(userId: string): Promise<CartResponseDto> {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  return getOrCreateCart(userId);
}

/**
 * Atomically merge guest cart items into the authenticated customer's server cart.
 */
export async function mergeGuestCart(
  userId: string,
  guestItems: MergeCartItemInput[]
): Promise<CartResponseDto> {
  if (!Array.isArray(guestItems) || guestItems.length === 0) {
    return getOrCreateCart(userId);
  }

  return prisma.$transaction(async (tx) => {
    let cart = await tx.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await tx.cart.create({ data: { userId } });
    }

    const existingItems = await tx.cartItem.findMany({
      where: { cartId: cart.id },
    });
    const existingMap = new Map(existingItems.map((item) => [item.variantId, item]));

    const variantIds = Array.from(new Set(guestItems.map((item) => item.variantId)));
    const variants = await tx.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    const notices: CartNotice[] = [];

    for (const guestItem of guestItems) {
      const variant = variantMap.get(guestItem.variantId);
      if (!variant || !variant.isActive || !variant.product.isActive) {
        notices.push(
          buildNotice(
            "OUT_OF_STOCK",
            guestItem.variantId,
            variant?.product.nameAr || "منتج غير متوفر",
            variant?.product.nameEn || "Unavailable item",
            { reason: "UNAVAILABLE" }
          )
        );
        continue;
      }

      const availableStock = getAvailableStock(variant);
      if (availableStock <= 0) {
        notices.push(
          buildNotice("OUT_OF_STOCK", variant.id, variant.product.nameAr, variant.product.nameEn, {
            reason: "OUT_OF_STOCK",
          })
        );
        continue;
      }

      const existing = existingMap.get(variant.id);
      if (existing) {
        const desiredQuantity = existing.quantity + guestItem.quantity;
        const mergedQuantity = Math.min(desiredQuantity, availableStock);

        if (mergedQuantity < desiredQuantity) {
          notices.push(
            buildNotice("STOCK_CAPPED", variant.id, variant.product.nameAr, variant.product.nameEn, {
              oldValue: desiredQuantity,
              newValue: mergedQuantity,
            })
          );
        }

        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: mergedQuantity },
        });
      } else {
        const mergedQuantity = Math.min(guestItem.quantity, availableStock);

        if (mergedQuantity < guestItem.quantity) {
          notices.push(
            buildNotice("STOCK_CAPPED", variant.id, variant.product.nameAr, variant.product.nameEn, {
              oldValue: guestItem.quantity,
              newValue: mergedQuantity,
            })
          );
        }

        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            variantId: variant.id,
            quantity: mergedQuantity,
          },
        });
      }
    }

    const updatedCart = await getOrCreateCart(userId, tx);
    updatedCart.notices = notices;
    return updatedCart;
  });
}
