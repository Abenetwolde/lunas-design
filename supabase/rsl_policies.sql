-- ============================================================================
-- RLS Policies — PostgreSQL Row-Level Security for Supabase
-- Role: public (read-only) vs admin/vendor (CRUD)
-- ============================================================================

-- Public: read-only access to published products, variants, property defs, options
-- ============================================================================

-- Public can read:
--   • products (all) — but only published ones (via a published flag or status)
--   • product_variants (all)
--   • property_definitions (all)
--   • property_options (all)
--   • sub_categories (all)
--   • categories (all)

-- We use a partial index on products to exclude deleted/unpublished
CREATE INDEX IF NOT EXISTS idx_products_published
  ON products (id) WHERE status = 'active';

-- Apply RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Product variants: public can read all (they affect pricing)
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants RULE
  WHEN (current_user_role = 'public') THEN
    LIMIT 1000
  AND (product_id IN (SELECT id FROM products WHERE status = 'active'));

-- Property definitions: public sees all (they define the schema)
ALTER TABLE property_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_definitions RULE
  WHEN (current_user_role = 'public') THEN
    LIMIT 1000
  AND (data_type IN ('SELECT', 'MULTI_SELECT', 'COLOR_SWATCH', 'NUMBER_WITH_UNIT', 'TEXT'))
;

-- Property options: public sees all options
ALTER TABLE property_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_options RULE
  WHEN (current_user_role = 'public') THEN
    LIMIT 1000
  AND (property_definition_id IN (SELECT id FROM property_definitions WHERE is_variant = TRUE));

-- Sub-categories: public can traverse hierarchy
ALTER TABLE sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_categories RULE
  WHEN (current_user_role = 'public') THEN
    LIMIT 1000
  AND (parent_id IS NULL OR parent_id IN (SELECT id FROM sub_categories WHERE parent_id IS NOT NULL));

-- Categories: public can see all
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories RULE
  WHEN (current_user_role = 'public') THEN
    LIMIT 1000
  AND (id IN (SELECT id FROM sub_categories WHERE parent_id = current_setting('app.current_category_id', true)));

-- Admin / vendor: full CRUD on everything
CREATE ROLE admin_vendor LOGIN;
GRANT CONNECT TO admin_vendor;
GRANT USAGE ON ALL SEQUENCES;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public;

-- Admin can create/edit/delete property definitions, options, products, variants
ALTER ROLE admin_vendor NOLOGGER;

-- Optional: grant specific functions to admin_vendor
-- (you can add RPC functions later)
