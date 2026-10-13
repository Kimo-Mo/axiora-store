import { z } from "zod";
import { egyptianPhoneSchema } from "../../shared/utils/phone.js";

// COD and ONLINE are both accepted. COD applies a fee and a phone-verification
// gate; ONLINE applies neither — its phone verification gate is dropped per
// spec 008 FR-017 and its fee is always zero. Both are conditioned on this value
// in `createOrder`/`quote`, so widening the union is the only change required.
export const PaymentMethodSchema = z.enum(["COD", "ONLINE"]);

export const CheckoutQuoteSchema = z.object({
  governorate: z.string().trim().min(2).max(60),
  paymentMethod: PaymentMethodSchema,
});

export const NewAddressInputSchema = z.object({
  label: z.string().trim().max(60).optional().nullable(),
  fullName: z.string().trim().min(2).max(120),
  phone: egyptianPhoneSchema,
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
    customerPhone: egyptianPhoneSchema,
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

export const OrderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
  "RETURNED",
]);

/**
 * Admin status change (contracts/orders-api.md §2.3). Strict: the endpoint
 * moves order + stock + history, so unknown keys are rejected outright and
 * the note is length-bounded.
 */
export const StatusChangeSchema = z
  .object({
    status: OrderStatusSchema,
    note: z.string().trim().max(500).optional(),
  })
  .strict();

export const AdminListOrdersQuerySchema = ListOrdersQuerySchema.extend({
  q: z.string().trim().min(2).max(40).optional(),
});
