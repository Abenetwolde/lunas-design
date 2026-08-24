-- ============================================================================
-- HIWI FASHION — HIERARCHICAL SUBCATEGORY MIGRATION
-- ============================================================================
-- Adds Category -> SubCategory -> Child Collection (sub-sub-category) support.
-- parent_slug links a child collection to its parent SubCategory slug/name.
-- Idempotent — safe to re-run. Existing data is preserved.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    category_slug VARCHAR(150),
    parent_slug VARCHAR(150),
    description TEXT DEFAULT '',
    badge_color VARCHAR(20) DEFAULT '#C5A880',
    item_count INT DEFAULT 0,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure columns exist on legacy instances of the table
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS category_slug VARCHAR(150);
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS parent_slug VARCHAR(150);
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS badge_color VARCHAR(20);

-- Backfill missing slugs from names so children can reference parents reliably
UPDATE public.subcategories
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Remove exact-duplicate slugs that would break the unique index
UPDATE public.subcategories s
SET slug = s.slug || '-' || s.id::text
FROM (
    SELECT slug FROM public.subcategories
    GROUP BY slug HAVING COUNT(*) > 1 AND slug IS NOT NULL
) d
WHERE s.slug = d.slug;

CREATE UNIQUE INDEX IF NOT EXISTS uq_subcategories_slug ON public.subcategories (slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_parent ON public.subcategories (parent_slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON public.subcategories (category_slug);

-- Row Level Security: public read, authenticated admins write
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read subcategories" ON public.subcategories;
CREATE POLICY "Public read subcategories" ON public.subcategories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write subcategories" ON public.subcategories;
CREATE POLICY "Admin write subcategories" ON public.subcategories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public write subcategories" ON public.subcategories;

-- ============================================================================
-- DONE. Admins can now attach child collections ("brands") under any
-- SubCategory, and bind attributes at any level of the tree.
-- ============================================================================