-- ============================================================================
-- HIWI FASHION — DATA QUALITY FIXES (fix malformed values at the source)
-- ============================================================================
-- 1) Corrupted category display names (e.g. "Habesha Kemis & Dressesss")
-- 2) Junk auto-derived attribute options (e.g. Occasion: "something") that
--    were harvested from legacy free-text product fields during the EAV
--    migration. Only unreferenced options are removed, so nothing in use
--    is ever deleted.
-- Idempotent — safe to re-run.
-- ============================================================================

-- 1a. Fix duplicated trailing letters in category names ----------------------
UPDATE public.categories
SET name = regexp_replace(name, '([a-z])\1+$', '\1')
WHERE name ~* '([a-z])\1{2,}$';   -- only when the SAME letter repeats 3+ times at the end

-- Normalise the specific known corruption explicitly (belt & suspenders)
UPDATE public.categories
SET name = 'Habesha Kemis & Dresses'
WHERE replace(lower(name), ' ', '') IN ('habeshakemis&dressesss','habeshakemis&dressesess','habeshakemis&dressss');

-- 1b. Same guard for products.category free-text copies (display fallbacks) --
UPDATE public.products
SET category = 'dresses'
WHERE lower(category) IN ('dressesss','dressesess','dressss','habesha kemis & dressesss');

-- 2. Remove junk/unreferenced auto-derived attribute options -----------------
DELETE FROM public.attribute_options o
USING public.attributes a
WHERE o.attribute_id = a.id
  AND a.code IN ('fabric', 'occasion', 'size', 'color-theme')
  AND NOT EXISTS (
        SELECT 1 FROM public.product_attribute_values v
        WHERE v.option_id = o.id
      )
  AND (
        lower(o.value) IN ('something', 'test', 'unknown', 'n/a', 'na', 'none', 'tbd', 'xxx')
        OR length(trim(o.value)) < 2
      );

-- ============================================================================
-- DONE. Category dropdowns and dynamic attribute option lists now render
-- clean, curated values straight from the source tables.
-- ============================================================================