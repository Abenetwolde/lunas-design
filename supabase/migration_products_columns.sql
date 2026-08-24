-- ============================================================================
-- HIWI FASHION — PRODUCTS TABLE COLUMN COMPLETION MIGRATION
-- ============================================================================
-- The application writes these columns on every product create/update.
-- On older databases some were never added, causing PGRST204 errors like:
--   "Could not find the 'delivery_info' column of 'products'"
--
-- This migration adds every column the app expects. Idempotent — safe to
-- re-run. Existing data is untouched (IF NOT EXISTS everywhere).
-- ============================================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge_text     VARCHAR(100);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_stock       BOOLEAN DEFAULT TRUE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images         TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS secondary_image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes          TEXT[] DEFAULT ARRAY['XS','S','M','L','XL'];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors         JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS material       VARCHAR(100);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS occasion       VARCHAR(100);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS fabric_care    TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delivery_info  TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 15;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory    VARCHAR(150);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating         DECIMAL(3, 2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reviews_count  INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_slug     ON public.products (slug);

-- ============================================================================
-- DONE. Product creates/updates no longer need the PGRST204 column-stripping
-- retry path — every mapped field now exists in the live table.
-- ============================================================================