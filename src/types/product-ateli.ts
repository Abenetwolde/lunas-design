// =============================================================================
// Product Atelier — TypeScript Interfaces
// Matches the Supabase schema: categories, sub_categories, property_definitions,
// property_options, products, product_specifications, product_variants
// =============================================================================

// ---------------------------------------------------------------------------
// 1. Categories & Sub-Categories
// ---------------------------------------------------------------------------
export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string; // self-reference; nullable for top-level
}

export interface SubCategory extends Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string;
}

// ---------------------------------------------------------------------------
// 2. Property Definitions (dynamic attributes)
// ---------------------------------------------------------------------------
export type DataType = 'SELECT' | 'MULTI_SELECT' | 'COLOR_SWATCH' | 'NUMBER_WITH_UNIT' | 'TEXT';

export interface PropertyDefinition {
  id: string;
  name: string;
  slug: string;
  data_type: DataType;
  measurement_unit?: string; // e.g. 'cm', 'ETB'
  description: string;
  is_variant: boolean; // true = inventory-pricing driver, false = descriptive
  is_filterable: boolean;
  is_product_page: boolean;
  is_product_card: boolean;
}

// ---------------------------------------------------------------------------
// 3. Property Options (pre-defined choices for a property definition)
// ---------------------------------------------------------------------------
export interface PropertyOption {
  id: string;
  property_definition_id: string;
  label: string;
  value_slug: string;
  hex_colors: string[]; // e.g. ['#FFFFFF', '#D4AF37'] for color swatches
  parent_color_bucket?: string; // grouping like "Gold", "White"
}

// ---------------------------------------------------------------------------
// 4. Products (core product record)
// ---------------------------------------------------------------------------
export interface Product {
  id: string;
  name: string;
  slug: string;
  main_category_id: string;
  sub_category_id: string;
  cover_image: string | null;
  gallery_images: string[];
  base_price: number; // in ETB
  total_stock: number;
}

// ---------------------------------------------------------------------------
// 5. Product Specifications (descriptive metadata, non-variant)
// ---------------------------------------------------------------------------
export interface ProductSpecification {
  id: string;
  product_id: string;
  property_definition_id: string;
  property_option_id?: string; // nullable – optional for non-variant props
  raw_value: string | null;
}

// ---------------------------------------------------------------------------
// 6. Product Variants (inventory & pricing drivers)
// ---------------------------------------------------------------------------
export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  price: number; // in ETB
  stock: number;
  combination: Record<string, string>; // { "size": "l", "color-theme": "white-gold" }
}

// ---------------------------------------------------------------------------
// Union types for convenience
// ---------------------------------------------------------------------------
export type ProductRecord = Product & ProductVariant;
export type ProductSpecRecord = ProductSpecification & ProductVariant;
