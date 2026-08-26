-- ============================================================================
-- HIWI FASHION — VARIANT FLAG FIX FOR COLOR-THEME
-- ============================================================================
-- "Color Theme" was migrated with variant=FALSE, so it never appeared in the
-- Product Atelier's Variant Dimensions (only flagged attributes do) and was
-- simultaneously excluded from Dynamic Attributes — leaving it invisible on
-- the product form entirely.
--
-- Fix: mark it as a variant dimension at the source. Idempotent.
-- ============================================================================

UPDATE public.attributes
SET variant = TRUE
WHERE code IN ('color-theme');

-- Safety net: make sure every color-ish / size attribute is variant-enabled,
-- while fabric / occasion stay non-variant (they are descriptive filters).
UPDATE public.attributes
SET variant = TRUE
WHERE code IN ('colors', 'sizes', 'size', 'color-theme')
  AND variant = FALSE;

-- ============================================================================
-- DONE. Color Theme now renders as a selectable dimension in section 03
-- Product Variants (with swatches), and stays out of Dynamic Attributes.
-- ============================================================================