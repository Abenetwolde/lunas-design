-- ============================================================================
-- HIWI FASHION — SHOPIFY-STYLE CATALOG ARCHITECTURE
-- Canonical hierarchy, property definitions/options (with dual-color swatch
-- support + color buckets), product specifications (descriptive) and
-- product variants (inventory/pricing drivers).
--
-- DESIGN NOTES
--   • categories.parent_id      → self-referencing tree (any depth)
--   • sub_categories            → optional 2nd level; parent_id → categories.id
--                                 (also self-references for sub-sub levels)
--   • property_definitions      → master attributes (data_type enum)
--   • property_options          → per-definition options; hex_colors jsonb array
--                                 supports dual-tone swatches ["#FFF","#D4AF37"]
--                                 parent_color_bucket groups shades ("Gold")
--   • product_specifications    → descriptive metadata (is_variant = false)
--   • product_variants          → SKU/price/stock rows; `combination` jsonb maps
--                                 property_slug → option value_slug
--
-- COLOR & SIZE ARE OPTIONAL. Nothing auto-seeds them — they appear only when
-- an admin creates the definitions and binds them to a category.
-- Idempotent: safe to re-run.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. CATEGORIES (self-referencing tree)
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
    id          uuid primary key default uuid_generate_v4(),
    name        varchar(255) not null,
    slug        varchar(255) unique not null,
    parent_id   uuid references public.categories(id) on delete set null,
    image       text,
    description text,
    is_active   boolean not null default true,
    sort_order  int not null default 0,
    created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. SUB_CATEGORIES (child level, also self-referencing for sub-sub)
-- ----------------------------------------------------------------------------
create table if not exists public.sub_categories (
    id          uuid primary key default uuid_generate_v4(),
    name        varchar(255) not null,
    slug        varchar(255),
    category_id uuid references public.categories(id) on delete cascade,
    parent_id   uuid references public.sub_categories(id) on delete cascade,
    description text default '',
    badge_color varchar(20) default '#C5A880',
    item_count  int default 0,
    sort_order  int default 0,
    created_at  timestamptz not null default now()
);
create index if not exists idx_subcat_category on public.sub_categories(category_id);
create index if not exists idx_subcat_parent  on public.sub_categories(parent_id);
create index if not exists idx_subcat_category on public.sub_categories(category_id);

-- <<PART2>>

-- ----------------------------------------------------------------------------
-- 3. PROPERTY_DEFINITIONS (master attributes)
--    data_type ∈ SELECT | MULTI_SELECT | COLOR_SWATCH | NUMBER_WITH_UNIT | TEXT
-- ----------------------------------------------------------------------------
create table if not exists public.property_definitions (
    id               uuid primary key default uuid_generate_v4(),
    name             varchar(255) not null,
    slug             varchar(120) unique not null,
    data_type        varchar(40)  not null default 'SELECT',
    measurement_unit varchar(30),
    description      text default '',
    is_variant       boolean not null default false,
    is_filterable    boolean not null default true,
    is_product_page  boolean not null default true,
    is_product_card  boolean not null default false,
    sort_order       int not null default 0,
    created_at       timestamptz not null default now()
);

-- Junction: property ↔ categories (category_id nullable = global/all)
create table if not exists public.property_definition_categories (
    id                    uuid primary key default uuid_generate_v4(),
    property_definition_id uuid not null references public.property_definitions(id) on delete cascade,
    category_id           uuid references public.categories(id) on delete cascade,
    unique (property_definition_id, category_id)
);
create index if not exists idx_pdc_property on public.property_definition_categories(property_definition_id);
create index if not exists idx_pdc_category on public.property_definition_categories(category_id);

-- ----------------------------------------------------------------------------
-- 4. PROPERTY_OPTIONS (per definition; dual-tone swatches + color buckets)
-- ----------------------------------------------------------------------------
create table if not exists public.property_options (
    id                    uuid primary key default uuid_generate_v4(),
    property_definition_id uuid not null references public.property_definitions(id) on delete cascade,
    label                 varchar(255) not null,
    value_slug            varchar(255) not null,
    hex_colors            jsonb default '[]'::jsonb,      -- ["#FFFFFF","#D4AF37"]
    parent_color_bucket   varchar(120),                   -- "Gold", "White", …
    sort_order            int not null default 0,
    unique (property_definition_id, value_slug)
);
create index if not exists idx_propopt_definition on public.property_options(property_definition_id);

-- ----------------------------------------------------------------------------
-- 5. PRODUCTS (canonical columns used by the new architecture)
-- ----------------------------------------------------------------------------
alter table public.products
    add column if not exists main_category_id uuid references public.categories(id) on delete restrict,
    add column if not exists sub_category_id  uuid references public.sub_categories(id) on delete set null,
    add column if not exists cover_image      text,
    add column if not exists gallery_images   jsonb default '[]'::jsonb,
    add column if not exists base_price       decimal(10,2),
    add column if not exists total_stock      int default 0;

create index if not exists idx_products_main_cat on public.products(main_category_id);
create index if not exists idx_products_sub_cat  on public.products(sub_category_id);

-- ----------------------------------------------------------------------------
-- 6. PRODUCT_SPECIFICATIONS (descriptive / filterable metadata)
-- ----------------------------------------------------------------------------
create table if not exists public.product_specifications (
    id                     uuid primary key default uuid_generate_v4(),
    product_id             uuid not null references public.products(id) on delete cascade,
    property_definition_id uuid not null references public.property_definitions(id) on delete cascade,
    property_option_id     uuid references public.property_options(id) on delete set null,
    raw_value              text,
    created_at             timestamptz not null default now(),
    unique (product_id, property_definition_id, property_option_id)
);
create index if not exists idx_prodspec_product   on public.product_specifications(product_id);
create index if not exists idx_prodspec_property  on public.product_specifications(property_definition_id);
create index if not exists idx_prodspec_option    ON public.product_specifications(property_option_id);

-- Free-text/number rows (option_id NULL) must be unique per product+property
create unique index if not exists uq_prodspec_text
    on public.product_specifications(product_id, property_definition_id)
    where option_id is null;

-- ----------------------------------------------------------------------------
-- 7. PRODUCT_VARIANTS (inventory & pricing drivers)
--    combination example: {"size":"l","color-theme":"white-gold"}
-- ----------------------------------------------------------------------------
create table if not exists public.product_variants (
    id           uuid primary key default uuid_generate_v4(),
    product_id   uuid not null references public.products(id) on delete cascade,
    sku          varchar(120) unique,
    price        decimal(10,2) not null check (price >= 0),
    stock        int not null default 0 check (stock >= 0),
    combination  jsonb not null default '{}'::jsonb,
    created_at   timestamptz not null default now(),
    unique (product_id, combination)
);
create index if not exists idx_variants_product on public.product_variants(product_id);
create index if not exists idx_variants_combination on public.product_variants using gin(combination);

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY
--    Public: read published catalog data. Admins/Vendors (any authenticated
--    user in your auth flow): full CRUD on definitions/options/products.
-- ============================================================================
alter table public.categories                      enable row level security;
alter table public.sub_categories                  enable row level security;
alter table public.property_definitions            enable row level security;
alter table public.property_definition_categories  enable row level security;
alter table public.property_options                enable row level security;
alter table public.product_specifications          enable row level security;
alter table public.product_variants                enable row level security;

do $$
declare t text;
begin
  foreach t in array array['categories','sub_categories','property_definitions',
                           'property_definition_categories','property_options',
                           'product_specifications','product_variants']
  loop
    execute format('drop policy if exists %I on public.%I', 'public_read_'||t, t);
    execute format('create policy %I on public.%I for select using (true);', 'public_read_'||t, t);
    execute format('drop policy if exists %I on public.%I', 'admin_write_'||t, t);
    execute format('create policy %I on public.%I for all to authenticated using (true) with check (true);', 'admin_write_'||t, t);
  end loop;
end $$;

-- <<PART3>>
