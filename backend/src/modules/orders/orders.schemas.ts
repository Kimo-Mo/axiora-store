import { z } from "zod";

// COD is the only payment method this phase; widened in Phase 10.
export const PaymentMethodSchema = z.literal("COD");

export const CheckoutQuoteSchema = z.object({
  governorate: z.string().trim().min(2).max(60),
  paymentMethod: PaymentMethodSchema,
});

export const NewAddressInputSchema = z.object({
  label: z.string().trim().max(60).optional().nullable(),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  governorate: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(120),
  area: z.string().trim().max(120).optional().nullable(),
  street: z.string().trim().min(2).max(255),
  building: z.string().trim().max(60).optional().nullable(),
  floor: z.string().trim().max(20).optional().nullable(),
  apartment: z.string().trim().max(60).optional().nullable(),
  landmark: z.string().trim().max(255).optional().nullable(),
  notes: z.string().trim().max(255).optional().nullable(),
  isDefault: z.boolean().optional(),
});

export const CreateOrderSchema = z
  .object({
    idempotencyKey: z.string().uuid(),
    paymentMethod: PaymentMethodSchema,
    customerPhone: z.string().trim().min(8).max(20),
    notes: z.string().trim().max(500).optional().nullable(),
    shippingAddressId: z.string().uuid().optional(),
    newAddress: NewAddressInputSchema.optional(),
    saveNewAddress: z.boolean().optional(),
  })
  .refine((value) => Boolean(value.shippingAddressId) !== Boolean(value.newAddress), {
    message: "Provide either shippingAddressId or newAddress, not both",
  });

export const OrderNumberParamSchema = z.object({
  orderNumber: z.string().trim().min(4).max(40),
});

export const ListOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "FAILED",
      "RETURNED",
    ])
    .optional(),
});
