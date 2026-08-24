-- ============================================================================
-- HIWI FASHION — DYNAMIC ATTRIBUTE (EAV) MIGRATION
-- ============================================================================
-- Converts rigid/hardcoded product properties (material, occasion, sizes,
-- colors) into a dynamic Entity-Attribute-Value architecture.
--
-- Run ONCE in the Supabase SQL Editor. Idempotent — safe to re-run.
--
-- Tables: attributes | attribute_options | category_attributes |
--         product_attribute_values
-- Legacy columns are READ and converted, never dropped or modified.
-- ============================================================================

-- 1. CORE EAV TABLES ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.attributes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,                -- Unique machine code, e.g. 'fabric'
    input_type VARCHAR(50) NOT NULL DEFAULT 'select', -- select|multi_select|color|range|number|boolean|text
    description TEXT DEFAULT '',
    unit VARCHAR(30) DEFAULT '',
    filterable BOOLEAN NOT NULL DEFAULT TRUE,         -- auto-generates storefront filter
    variant BOOLEAN NOT NULL DEFAULT FALSE,           -- usable as variant axis
    required BOOLEAN NOT NULL DEFAULT FALSE,
    show_on_product_page BOOLEAN NOT NULL DEFAULT TRUE,
    show_on_product_card BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attribute_options (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    attribute_id TEXT NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    value VARCHAR(255),
    hex VARCHAR(20),                                  -- swatch color for color-type attributes
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.category_attributes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category_slug VARCHAR(150) NOT NULL,              -- categories.slug, 'all', or sub-category name
    attribute_id TEXT NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
    UNIQUE (category_slug, attribute_id)
);

CREATE TABLE IF NOT EXISTS public.product_attribute_values (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT NOT NULL,                         -- matches products.id (TEXT-safe)
    attribute_id TEXT NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
    option_id TEXT REFERENCES public.attribute_options(id) ON DELETE SET NULL,
    value_text TEXT,
    UNIQUE (product_id, attribute_id, option_id)
);

-- Free-form values (option_id IS NULL) uniqueness per product+attribute
CREATE UNIQUE INDEX IF NOT EXISTS uq_pav_product_attr_text
    ON public.product_attribute_values (product_id, attribute_id)
    WHERE option_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_pav_product   ON public.product_attribute_values (product_id);
CREATE INDEX IF NOT EXISTS idx_pav_attribute ON public.product_attribute_values (attribute_id);
CREATE INDEX IF NOT EXISTS idx_pav_option    ON public.product_attribute_values (option_id);
CREATE INDEX IF NOT EXISTS idx_ao_attribute  ON public.attribute_options (attribute_id);
CREATE INDEX IF NOT EXISTS idx_ca_attribute  ON public.category_attributes (attribute_id);

-- 2. ROW LEVEL SECURITY -------------------------------------------------------
-- Public read (storefront). Writes restricted to authenticated admins.

ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read attributes" ON public.attributes;
CREATE POLICY "Public read attributes" ON public.attributes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write attributes" ON public.attributes;
CREATE POLICY "Admin write attributes" ON public.attributes FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read attribute_options" ON public.attribute_options;
CREATE POLICY "Public read attribute_options" ON public.attribute_options FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write attribute_options" ON public.attribute_options;
CREATE POLICY "Admin write attribute_options" ON public.attribute_options FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read category_attributes" ON public.category_attributes;
CREATE POLICY "Public read category_attributes" ON public.category_attributes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write category_attributes" ON public.category_attributes;
CREATE POLICY "Admin write category_attributes" ON public.category_attributes FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read product_attribute_values" ON public.product_attribute_values;
CREATE POLICY "Public read product_attribute_values" ON public.product_attribute_values FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write product_attribute_values" ON public.product_attribute_values;
CREATE POLICY "Admin write product_attribute_values" ON public.product_attribute_values FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. MIGRATE EXISTING ADMIN-CREATED DEFINITIONS (legacy property_definitions)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema='public' AND table_name='property_definitions') THEN

        -- 3a. Definitions -> attributes
        INSERT INTO public.attributes (id, name, code, input_type, description, unit,
                                       filterable, variant, required,
                                       show_on_product_page, show_on_product_card, display_order)
        SELECT pd.id::text, pd.name, pd.slug, COALESCE(pd.type,'select'),
               COALESCE(pd.description,''), COALESCE(pd.unit,''),
               COALESCE(pd.filterable,TRUE), COALESCE(pd.variant,FALSE), COALESCE(pd.required,FALSE),
               COALESCE(pd.show_on_product_page,TRUE), COALESCE(pd.show_on_product_card,FALSE),
               COALESCE(pd.display_order,0)
        FROM public.property_definitions pd
        WHERE NOT EXISTS (SELECT 1 FROM public.attributes a WHERE a.code = pd.slug)
        ON CONFLICT (id) DO NOTHING;

        -- 3b. jsonb options -> attribute_options
        INSERT INTO public.attribute_options (id, attribute_id, name, value, hex, display_order)
        SELECT opt->>'id', a.id,
               COALESCE(opt->>'name', opt->>'value'),
               COALESCE(opt->>'value', opt->>'name'),
               opt->>'hex',
               ord.ordinality - 1
        FROM public.property_definitions pd
        JOIN public.attributes a ON a.code = pd.slug
        CROSS JOIN LATERAL jsonb_array_elements(pd.options) WITH ORDINALITY AS ord(opt, ordinality)
        WHERE jsonb_typeof(pd.options) = 'array'
        ON CONFLICT (id) DO NOTHING;

        -- 3c. category_ids -> category_attributes
        INSERT INTO public.category_attributes (category_slug, attribute_id)
        SELECT cs.slug, a.id
        FROM public.property_definitions pd
        JOIN public.attributes a ON a.code = pd.slug
        CROSS JOIN LATERAL unnest(
            CASE WHEN jsonb_typeof(pd.category_ids) = 'array'
                 THEN ARRAY(SELECT jsonb_array_elements_text(pd.category_ids))
                 ELSE ARRAY['all'] END
        ) AS cs(slug)
        ON CONFLICT (category_slug, attribute_id) DO NOTHING;

    END IF;
END $$;

-- 4. CONVERT HARDCODED PRODUCT PROPERTIES INTO MASTER ATTRIBUTES --------------
--    Deterministic option ids via md5(code:value) keep reruns stable.

INSERT INTO public.attributes (id, code, name, input_type, filterable, variant, show_on_product_page, display_order)
VALUES
    ('attr-fabric',     'fabric',      'Fabric / Material', 'select',       TRUE,  FALSE, TRUE,  3),
    ('attr-occasion',   'occasion',    'Occasion',          'select',       TRUE,  FALSE, TRUE,  4),
    ('attr-size',       'size',        'Size',              'multi_select', TRUE,  TRUE,  TRUE,  1),
    ('attr-colortheme', 'color-theme', 'Color Theme',       'multi_select', TRUE,  FALSE, TRUE,  2)
ON CONFLICT (code) DO NOTHING;

-- 4b. Options derived from DISTINCT existing product values -------------------

-- Fabric (products.material)
INSERT INTO public.attribute_options (id, attribute_id, name, value, display_order)
SELECT DISTINCT md5('fabric:' || lower(trim(p.material))), a.id,
       initcap(trim(p.material)), trim(p.material), 0
FROM public.products p
CROSS JOIN (SELECT id FROM public.attributes WHERE code = 'fabric') a
WHERE p.material IS NOT NULL AND length(trim(p.material)) > 0
ON CONFLICT (id) DO NOTHING;

-- Occasion (products.occasion)
INSERT INTO public.attribute_options (id, attribute_id, name, value, display_order)
SELECT DISTINCT md5('occasion:' || lower(trim(p.occasion))), a.id,
       initcap(trim(p.occasion)), trim(p.occasion), 0
FROM public.products p
CROSS JOIN (SELECT id FROM public.attributes WHERE code = 'occasion') a
WHERE p.occasion IS NOT NULL AND length(trim(p.occasion)) > 0
ON CONFLICT (id) DO NOTHING;

-- Size (unnest products.sizes text[])
INSERT INTO public.attribute_options (id, attribute_id, name, value, display_order)
SELECT DISTINCT md5('size:' || lower(trim(s.sz))), a.id,
       upper(trim(s.sz)), upper(trim(s.sz)), 0
FROM public.products p
CROSS JOIN (SELECT id FROM public.attributes WHERE code = 'size') a
CROSS JOIN LATERAL unnest(p.sizes) AS s(sz)
WHERE p.sizes IS NOT NULL AND array_length(p.sizes, 1) > 0
ON CONFLICT (id) DO NOTHING;

-- Color Theme (jsonb array products.colors)
INSERT INTO public.attribute_options (id, attribute_id, name, value, hex, display_order)
SELECT DISTINCT md5('color-theme:' || lower(c.col->>'name')), a.id,
       c.col->>'name', c.col->>'name', c.col->>'hex', 0
FROM public.products p
CROSS JOIN (SELECT id FROM public.attributes WHERE code = 'color-theme') a
CROSS JOIN LATERAL jsonb_array_elements(p.colors) AS c(col)
WHERE jsonb_typeof(p.colors) = 'array'
ON CONFLICT (id) DO NOTHING;

-- 4c. Bind migrated attributes to every existing category + global ------------

INSERT INTO public.category_attributes (category_slug, attribute_id)
SELECT 'all', a.id FROM public.attributes a
WHERE a.code IN ('fabric', 'occasion', 'size', 'color-theme')
ON CONFLICT (category_slug, attribute_id) DO NOTHING;

INSERT INTO public.category_attributes (category_slug, attribute_id)
SELECT c.slug, a.id
FROM public.categories c
CROSS JOIN public.attributes a
WHERE a.code IN ('fabric', 'occasion', 'size', 'color-theme')
ON CONFLICT (category_slug, attribute_id) DO NOTHING;

-- 4d. Backfill product_attribute_values from legacy columns -------------------

INSERT INTO public.product_attribute_values (product_id, attribute_id, option_id, value_text)
SELECT p.id::text, a.id, o.id, trim(p.material)
FROM public.products p
JOIN public.attributes a ON a.code = 'fabric'
JOIN public.attribute_options o ON o.attribute_id = a.id AND lower(o.value) = lower(trim(p.material))
WHERE p.material IS NOT NULL AND length(trim(p.material)) > 0
ON CONFLICT DO NOTHING;

INSERT INTO public.product_attribute_values (product_id, attribute_id, option_id, value_text)
SELECT p.id::text, a.id, o.id, trim(p.occasion)
FROM public.products p
JOIN public.attributes a ON a.code = 'occasion'
JOIN public.attribute_options o ON o.attribute_id = a.id AND lower(o.value) = lower(trim(p.occasion))
WHERE p.occasion IS NOT NULL AND length(trim(p.occasion)) > 0
ON CONFLICT DO NOTHING;

INSERT INTO public.product_attribute_values (product_id, attribute_id, option_id, value_text)
SELECT p.id::text, a.id, o.id, upper(trim(s.sz))
FROM public.products p
JOIN public.attributes a ON a.code = 'size'
CROSS JOIN LATERAL unnest(p.sizes) AS s(sz)
JOIN public.attribute_options o ON o.attribute_id = a.id AND o.value = upper(trim(s.sz))
WHERE p.sizes IS NOT NULL AND array_length(p.sizes, 1) > 0
ON CONFLICT DO NOTHING;

INSERT INTO public.product_attribute_values (product_id, attribute_id, option_id, value_text)
SELECT p.id::text, a.id, o.id, c.col->>'name'
FROM public.products p
JOIN public.attributes a ON a.code = 'color-theme'
CROSS JOIN LATERAL jsonb_array_elements(p.colors) AS c(col)
JOIN public.attribute_options o ON o.attribute_id = a.id AND lower(o.value) = lower(c.col->>'name')
WHERE jsonb_typeof(p.colors) = 'array'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DONE. Legacy columns remain intact; the app now reads/writes through the
-- normalized EAV tables above.
-- ============================================================================