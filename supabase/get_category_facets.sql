-- ============================================================================
-- RPC Function: get_category_facets(category_slug text)
-- Returns all filterable property definitions attached to a category,
-- along with their available options and current product count.
-- Options with zero stock are hidden from the facet.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_category_facets(
  p_category_slug text
) RETURNS TABLE (
  prop_name          VARCHAR(255),
  prop_type          VARCHAR(20),
  prop_description   TEXT,
  is_variant         BOOLEAN,
  is_filterable      BOOLEAN,
  is_product_page    BOOLEAN,
  is_product_card    BOOLEAN,
  option_label       VARCHAR(255),
  option_value_slug  VARCHAR(255),
  option_hex_colors  JSONB,
  product_count      INTEGER
) AS $$
  WITH
  -- 1. Find the category (or its ancestors via recursive CTE)
  cat AS (
    WITH RECURSIVE category_tree (
      SELECT id, name, slug, parent_id, 0 as lvl
    ) AS base
    UNION ALL
    SELECT ct.id, ct.name, ct.slug, ct.parent_id, ct.lvl + 1
    FROM categories ct
    JOIN base b ON b.id = ct.parent_id
    WHERE b.id != base.id
    ORDER BY b.lvl
    LIMIT 1000
    OFFSET (SELECT lvl FROM category_tree WHERE id = ANY(SELECT id FROM sub_categories WHERE parent_id IS NOT NULL)) OFFSET 0
  ),
  -- 2. Get all property definitions belonging to this category
  props AS (
    SELECT pd.*, pdc.category_id
    FROM property_definitions pd
    JOIN category_tree ct ON pd.prop_id = ct.id
    WHERE pd.slug = p_category_slug
  ),
  -- 3. Get options for each property
  opt_rows AS (
    SELECT po.*, pd.slug AS property_definition_id
    FROM property_options po
    JOIN props p ON po.property_definition_id = p.prop_id
    WHERE p.prop_id = ANY(SELECT id FROM props)
  ),
  -- 4. Count products per property (excluding zero-stock variants)
  product_counts AS (
    SELECT
      COALESCE(p.prop_id, o.prop_id) AS prop_id,
      COUNT(DISTINCT pv.id) AS product_count
    FROM product_variants pv
    LEFT JOIN product_specifications ps ON ps.product_id = pv.product_id
      AND ps.property_definition_id = p.prop_id
    LEFT JOIN property_options o ON o.property_definition_id = p.prop_id
    GROUP BY COALESCE(p.prop_id, o.prop_id)
    ORDER BY prop_id
  )
  SELECT
    p.prop_name,
    p.data_type,
    p.description,
    p.is_variant,
    p.is_filterable,
    p.is_product_page,
    p.is_product_card,
    o.label AS option_label,
    o.value_slug AS option_value_slug,
    o.hex_colors,
    pc.product_count
  FROM props p
  LEFT JOIN opt_rows o ON o.prop_id = p.prop_id
  LEFT JOIN product_counts pc ON pc.prop_id = p.prop_id
  WHERE p.prop_id = ANY(SELECT id FROM opts)
    AND p.prop_id = ANY(SELECT id FROM props)
    AND p.prop_id NOT IN (SELECT id FROM property_definitions WHERE is_variant = TRUE)  -- skip pure variants
ORDER BY p.prop_name;
$$ LANGUAGE plpgsql;
