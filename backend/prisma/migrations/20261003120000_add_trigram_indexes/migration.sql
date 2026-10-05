-- GIN trigram indexes for bilingual fuzzy search (research.md D-1).
--
-- Prisma's schema language cannot express the `gin_trgm_ops` operator class, so
-- these indexes are declared here as raw SQL rather than in `schema.prisma`.
--
-- `%` similarity and `ILIKE '%…%'` both route through these operator classes, which
-- is what keeps Arabic and English typo-tolerant matching inside the sub-50ms
-- budget the store listing depends on.
--
-- `IF NOT EXISTS` keeps the migration re-runnable on a database where an operator
-- has already created an equivalent index by hand.

CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Product names
CREATE INDEX IF NOT EXISTS "product_name_ar_trgm_idx" ON "Product" USING gin ("nameAr" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "product_name_en_trgm_idx" ON "Product" USING gin ("nameEn" gin_trgm_ops);

-- Category names
CREATE INDEX IF NOT EXISTS "category_name_ar_trgm_idx" ON "Category" USING gin ("nameAr" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "category_name_en_trgm_idx" ON "Category" USING gin ("nameEn" gin_trgm_ops);

-- Brand names
CREATE INDEX IF NOT EXISTS "brand_name_ar_trgm_idx" ON "Brand" USING gin ("nameAr" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "brand_name_en_trgm_idx" ON "Brand" USING gin ("nameEn" gin_trgm_ops);