import { z } from "zod";
import { MAX_CART_ITEM_QUANTITY } from "./carts.types.js";

export const addCartItemBodySchema = z.object({
  variantId: z.string().uuid({ message: "Valid variant ID is required" }),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int({ message: "Quantity must be an integer" })
    .min(1, { message: "Quantity must be at least 1" })
    .max(MAX_CART_ITEM_QUANTITY, { message: `Maximum quantity is ${MAX_CART_ITEM_QUANTITY}` })
    .default(1),
});

export const updateCartItemParamSchema = z.object({
  id: z.string().uuid({ message: "Valid cart item ID is required" }),
});

export const updateCartItemBodySchema = z.object({
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int({ message: "Quantity must be an integer" })
    .min(1, { message: "Quantity must be at least 1" })
    .max(MAX_CART_ITEM_QUANTITY, { message: `Maximum quantity is ${MAX_CART_ITEM_QUANTITY}` }),
});

export const removeCartItemParamSchema = z.object({
  id: z.string().uuid({ message: "Valid cart item ID is required" }),
});

export const mergeCartItemSchema = z.object({
  variantId: z.string().uuid({ message: "Valid variant ID is required" }),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int({ message: "Quantity must be an integer" })
    .min(1, { message: "Quantity must be at least 1" })
    .max(MAX_CART_ITEM_QUANTITY, { message: `Maximum quantity is ${MAX_CART_ITEM_QUANTITY}` }),
});

export const mergeCartBodySchema = z.object({
  items: z
    .array(mergeCartItemSchema, {
      invalid_type_error: "Items must be an array",
    })
    .max(50, { message: "Cannot merge more than 50 items at once" }),
});

export type AddCartItemInput = z.infer<typeof addCartItemBodySchema>;
export type UpdateCartItemBodyInput = z.infer<typeof updateCartItemBodySchema>;
export type MergeCartInput = z.infer<typeof mergeCartBodySchema>;
