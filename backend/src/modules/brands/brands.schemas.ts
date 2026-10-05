import { z } from "zod";

/**
 * Brand boundary schemas (data-model.md §3).
 *
 * Mirrors `categories.schemas.ts` deliberately: the two taxonomies are
 * administered through the same UI shape, so divergent validation between them
 * would be a surprise rather than a feature.
 */

const slug = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters")
  .max(120, "Slug is too long")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case");

const logoUrl = z.string().trim().url("Logo must be an absolute URL").max(2048);

export const createBrandSchema = z
  .object({
    nameAr: z.string().trim().min(2, "Arabic name must be at least 2 characters").max(120),
    nameEn: z.string().trim().min(2, "English name must be at least 2 characters").max(120),
    slug,
    logo: logoUrl.nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateBrandSchema = createBrandSchema.partial().strict();

export const brandIdParamSchema = z.object({ id: z.string().uuid("Must be a valid id") }).strict();

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;