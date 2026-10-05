import { z } from "zod";

/**
 * Product boundary schemas: the public store query, and the admin mutation set
 * (products, variants, specifications, images).
 *
 * `.strict()` on every object — an unknown key is a validation failure rather than
 * a silently dropped field, so a client cannot smuggle `costPrice` or a
 * pre-assigned `id` into an endpoint that does not accept it.
 *
 * Query coercion note: Express hands every query value over as a string, so the
 * numeric and boolean filters are coerced here rather than in the service. A
 * filter that arrives malformed must fail loudly, not silently widen the result
 * set to everything.
 */

const uuid = z.string().uuid("Must be a valid id");

const slug = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters")
  .max(160, "Slug is too long")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case");

/**
 * Accepts a UUID or a kebab-case slug. Both address a catalog row in practice and
 * the storefront links by slug while admin tooling tends to hold ids, so the
 * boundary refuses to make callers convert.
 */
const idOrSlug = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) => z.string().uuid().safeParse(value).success || slug.safeParse(value).success,
    "Must be a UUID or a kebab-case slug",
  );

const booleanish = z
  .enum(["true", "false", "1", "0"])
  .transform((value) => value === "true" || value === "1");

const nonNegativeNumber = z.coerce.number().finite().min(0, "Must be zero or greater");

export const SORT_OPTIONS = [
  "price_asc",
  "price_desc",
  "newest",
  "name_asc",
  "name_desc",
  "bestseller",
] as const;

/** Comma-separated in the query string, so the storefront can send `brands=apple,samsung`. */
const brandsParam = z
  .string()
  .trim()
  .min(1)
  .transform((value) =>
    value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  )
  .refine((entries) => entries.length > 0 && entries.length <= 20, "Select between 1 and 20 brands");

export const catalogQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    search: z.string().trim().min(1).max(120).optional(),
    category: idOrSlug.optional(),
    brands: brandsParam.optional(),
    minPrice: nonNegativeNumber.optional(),
    maxPrice: nonNegativeNumber.optional(),
    inStock: booleanish.optional(),
    isFeatured: booleanish.optional(),
    isNew: booleanish.optional(),
    isBestSeller: booleanish.optional(),
    sort: z.enum(SORT_OPTIONS).default("newest"),
  })
  .strict()
  .refine((value) => value.minPrice === undefined || value.maxPrice === undefined || value.minPrice <= value.maxPrice, {
    message: "minPrice must not exceed maxPrice",
    path: ["minPrice"],
  });

export const productSlugParamSchema = z.object({ slug: slug }).strict();

export const productIdParamSchema = z.object({ id: uuid }).strict();

export const productVariantParamSchema = z
  .object({ id: uuid, variantId: uuid })
  .strict();

export const productImageParamSchema = z.object({ id: uuid, imageId: uuid }).strict();

// ─── Admin: master product ────────────────────────────────────────────────────

export const createProductSchema = z
  .object({
    nameAr: z.string().trim().min(2, "Arabic name must be at least 2 characters").max(200),
    nameEn: z.string().trim().min(2, "English name must be at least 2 characters").max(200),
    slug,
    sku: z.string().trim().min(3, "SKU must be at least 3 characters").max(80),
    brandId: uuid,
    categoryId: uuid,
    shortDescriptionAr: z.string().trim().max(500).nullable().optional(),
    shortDescriptionEn: z.string().trim().max(500).nullable().optional(),
    descriptionAr: z.string().trim().max(20_000).nullable().optional(),
    descriptionEn: z.string().trim().max(20_000).nullable().optional(),
    warranty: z.string().trim().max(300).nullable().optional(),
    currency: z.string().trim().length(3, "Currency must be a 3-letter code").toUpperCase().default("EGP"),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isNew: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
  })
  .strict();

export const updateProductSchema = createProductSchema.partial().strict();

export const updateProductStatusSchema = z.object({ isActive: z.boolean() }).strict();

// ─── Admin: variants ─────────────────────────────────────────────────────────

const variantAttributeSchema = z
  .object({
    attributeSlug: slug,
    valueAr: z.string().trim().min(1, "Arabic attribute value is required").max(120),
    valueEn: z.string().trim().min(1, "English attribute value is required").max(120),
  })
  .strict();

export const createVariantSchema = z
  .object({
    sku: z.string().trim().min(3, "SKU must be at least 3 characters").max(80),
    price: z.coerce.number().positive("Price must be greater than zero").finite(),
    compareAtPrice: z.coerce.number().positive().finite().nullable().optional(),
    costPrice: z.coerce.number().positive().finite().nullable().optional(),
    stockQuantity: z.coerce.number().int().nonnegative("Stock cannot be negative").default(0),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
    attributeValues: z.array(variantAttributeSchema).max(12).default([]),
  })
  .strict()
  .refine((value) => value.compareAtPrice === undefined || value.compareAtPrice === null || value.compareAtPrice > value.price, {
    message: "compareAtPrice must be greater than price",
    path: ["compareAtPrice"],
  });

export const updateVariantSchema = z
  .object({
    sku: z.string().trim().min(3).max(80).optional(),
    price: z.coerce.number().positive().finite().optional(),
    compareAtPrice: z.coerce.number().positive().finite().nullable().optional(),
    costPrice: z.coerce.number().positive().finite().nullable().optional(),
    stockQuantity: z.coerce.number().int().nonnegative().optional(),
    reservedQuantity: z.coerce.number().int().nonnegative().optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
    attributeValues: z.array(variantAttributeSchema).max(12).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.compareAtPrice === undefined ||
      value.compareAtPrice === null ||
      value.price === undefined ||
      value.compareAtPrice > value.price,
    { message: "compareAtPrice must be greater than price", path: ["compareAtPrice"] },
  );

// ─── Admin: images ───────────────────────────────────────────────────────────

export const addProductImageSchema = z
  .object({
    url: z.string().trim().url("Image must be an absolute URL").max(2048),
    publicId: z.string().trim().max(512).nullable().optional(),
    alt: z.string().trim().max(300).nullable().optional(),
    isPrimary: z.boolean().optional(),
    sortOrder: z.coerce.number().int().min(0).max(999).optional(),
  })
  .strict();

export const reorderProductImagesSchema = z
  .object({
    images: z.array(uuid).min(1, "At least one image id is required").max(30),
  })
  .strict();

// ─── Admin: specifications ───────────────────────────────────────────────────

const specificationSchema = z
  .object({
    keyAr: z.string().trim().min(1, "Arabic key is required").max(160),
    keyEn: z.string().trim().min(1, "English key is required").max(160),
    valueAr: z.string().trim().min(1, "Arabic value is required").max(500),
    valueEn: z.string().trim().min(1, "English value is required").max(500),
    sortOrder: z.coerce.number().int().min(0).max(999).optional(),
  })
  .strict();

/** Replaces the whole specification set, so the order the client sends is the order stored. */
export const replaceSpecificationsSchema = z
  .object({
    specifications: z.array(specificationSchema).max(60).default([]),
  })
  .strict();

export type CatalogQueryInput = z.infer<typeof catalogQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type AddProductImageInput = z.infer<typeof addProductImageSchema>;
export type ReplaceSpecificationsInput = z.infer<typeof replaceSpecificationsSchema>;