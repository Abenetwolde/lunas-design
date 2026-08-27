/**
 * ============================================================================
 * CATALOG ARCHITECTURE — TypeScript interfaces (1:1 with Supabase schema)
 * migration_catalog_architecture.sql
 * ============================================================================
 */

/* ---------- Taxonomy ---------- */

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null; // self-referencing tree
  image: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string | null;
  category_id: string | null; // → categories.id
  parent_id: string | null; // → sub_categories.id (sub-sub levels)
  description: string | null;
  badge_color: string | null;
  item_count: number;
  sort_order: number;
  created_at: string;
}

/* ---------- Property definitions (Shopify Metafield style) ---------- */

export type PropertyDataType =
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'COLOR_SWATCH'
  | 'NUMBER_WITH_UNIT'
  | 'TEXT';

export interface PropertyDefinition {
  id: string;
  name: string; // "Color Theme", "Size", "Fabric / Material", "Heel Height"
  slug: string; // "color-theme"
  data_type: PropertyDataType;
  measurement_unit: string | null; // 'cm', 'ETB', …
  description: string | null;
  is_variant: boolean; // true → drives product_variants matrix
  is_filterable: boolean; // true → storefront facet
  is_product_page: boolean; // show on product detail page
  is_product_card: boolean; // show on catalog card
  sort_order: number;
  created_at: string;
}

/** Junction row: property bound to a category (category_id NULL = global) */
export interface PropertyDefinitionCategory {
  id: string;
  property_definition_id: string;
  category_id: string | null;
}

/* ---------- Options ---------- */

export interface PropertyOption {
  id: string;
  property_definition_id: string;
  label: string; // "White & Gold"
  value_slug: string; // "white-gold"
  /** Dual-tone support, e.g. ["#FFFFFF", "#D4AF37"] */
  hex_colors: string[];
  /** Optional grouping bucket, e.g. "Gold" */
  parent_color_bucket: string | null;
  sort_order: number;
}

/* ---------- Products ---------- */

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  main_category_id: string;
  sub_category_id: string | null;
  cover_image: string | null;
  gallery_images: string[];
  base_price: number | null;
  total_stock: number;
  created_at?: string;
}

/* ---------- Specifications (descriptive metadata) ---------- */

export interface ProductSpecification {
  id: string;
  product_id: string;
  property_definition_id: string;
  property_option_id: string | null;
  raw_value: string | null; // for NUMBER_WITH_UNIT / TEXT dynamic values
  created_at: string;
}

/* ---------- Variants (inventory & pricing drivers) ---------- */

/** e.g. { "size": "l", "color-theme": "white-gold" } */
export type VariantCombination = Record<string, string>;

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string | null;
  price: number;
  stock: number;
  combination: VariantCombination;
  created_at: string;
}

/* ---------- RPC: get_category_facets ---------- */

export interface CategoryFacetRow {
  property_id: string;
  property_name: string;
  property_slug: string;
  data_type: PropertyDataType;
  measurement_unit: string | null;
  is_variant: boolean;
  option_id: string | null;
  option_label: string | null;
  value_slug: string | null;
  hex_colors: string[] | null;
  parent_color_bucket: string | null;
  product_count: number;
}

/** Grouped shape consumed by the sidebar */
export interface FacetGroup {
  property: Pick<
    PropertyDefinition,
    'id' | 'name' | 'slug' | 'data_type' | 'measurement_unit' | 'is_variant'
  >;
  options: Array<{
    optionId: string;
    label: string;
    valueSlug: string;
    hexColors: string[];
    parentColorBucket: string | null;
    count: number;
  }>;
}

/** URL param payload shared by sidebar & product listing */
export interface FacetQueryState {
  /** property_slug → selected value_slugs */
  selections: Record<string, string[]>;
  minPrice?: number;
  maxPrice?: number;
}