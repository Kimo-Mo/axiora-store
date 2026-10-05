import { z } from "zod";

/**
 * Category and brand boundary schemas (data-model.md §3).
 *
 * `.strict()` throughout: an unknown key is a validation failure rather than a
 * silently dropped field, which is what stops a client smuggling `isActive` or a
 * pre-set `id` into an admin create payload.
 */

const slug = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters")
  .max(120, "Slug is too long")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case");

const imageUrl = z.string().trim().url("Image must be an absolute URL").max(2048);

const uuid = z.string().uuid("Must be a valid id");

const sortOrder = z.number().int().min(-10_000).max(10_000).default(0);

export const createCategorySchema = z
  .object({
    nameAr: z.string().trim().min(2, "Arabic name must be at least 2 characters").max(120),
    nameEn: z.string().trim().min(2, "English name must be at least 2 characters").max(120),
    slug,
    descriptionAr: z.string().trim().max(2000).nullable().optional(),
    descriptionEn: z.string().trim().max(2000).nullable().optional(),
    parentId: uuid.nullable().optional(),
    image: imageUrl.nullable().optional(),
    sortOrder: sortOrder.optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateCategorySchema = createCategorySchema.partial().strict();

export const categoryIdParamSchema = z.object({ id: uuid }).strict();

/** `tree=false` returns a flat list instead of nesting children under roots. */
export const listCategoriesQuerySchema = z
  .object({
    tree: z
      .enum(["true", "false"])
      .default("true")
      .transform((value) => value === "true"),
    flat: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
  })
  .strict();

export const categorySlugParamSchema = z.object({ slug: slug }).strict();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;