-- ============================================================================
-- HIWI FASHION — RLS ACCESS FIX FOR EAV TABLES
-- ============================================================================
-- Symptom: 42501 "new row violates row-level security policy" when saving.
-- Cause:   The EAV tables were created with write policies scoped to
--          TO authenticated, but the admin console may operate without a
--          Supabase Auth session (master-passcode bypass) — those requests
--          run as role `anon` and were rejected.
-- Fix:     Align these tables with every other table in this project:
--          public read + public write (RLS still enabled, policies explicit).
-- Idempotent — safe to re-run.
-- ============================================================================

-- attributes -----------------------------------------------------------------
DROP POLICY IF EXISTS "Admin write attributes" ON public.attributes;
DROP POLICY IF EXISTS "App write attributes" ON public.attributes;
CREATE POLICY "App write attributes"
    ON public.attributes FOR ALL
    USING (true) WITH CHECK (true);

-- attribute_options ----------------------------------------------------------
DROP POLICY IF EXISTS "Admin write attribute_options" ON public.attribute_options;
DROP POLICY IF EXISTS "App write attribute_options" ON public.attribute_options;
CREATE POLICY "App write attribute_options"
    ON public.attribute_options FOR ALL
    USING (true) WITH CHECK (true);

-- category_attributes --------------------------------------------------------
DROP POLICY IF EXISTS "Admin write category_attributes" ON public.category_attributes;
DROP POLICY IF EXISTS "App write category_attributes" ON public.category_attributes;
CREATE POLICY "App write category_attributes"
    ON public.category_attributes FOR ALL
    USING (true) WITH CHECK (true);

-- product_attribute_values ---------------------------------------------------
DROP POLICY IF EXISTS "Admin write product_attribute_values" ON public.product_attribute_values;
DROP POLICY IF EXISTS "App write product_attribute_values" ON public.product_attribute_values;
CREATE POLICY "App write product_attribute_values"
    ON public.product_attribute_values FOR ALL
    USING (true) WITH CHECK (true);

-- subcategories (hierarchy migration had the same authenticated-only issue) --
DROP POLICY IF EXISTS "Admin write subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "App write subcategories" ON public.subcategories;
CREATE POLICY "App write subcategories"
    ON public.subcategories FOR ALL
    USING (true) WITH CHECK (true);

-- ============================================================================
-- DONE. Product / sub-category / attribute saves now succeed regardless of
-- whether the admin holds a Supabase Auth session.
--
-- SECURITY NOTE: this mirrors the project's existing permissive model.
-- When you are ready to harden, replace these with `TO authenticated`
-- policies and disable the master-passcode login path so all admin actions
-- carry a real Supabase JWT.
-- ============================================================================