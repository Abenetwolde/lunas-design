'use client';

/**
 * ============================================================================
 * FACET QUERY UTILITY — RPC access, grouping & URL SearchParam syncing
 * Used by the storefront FacetedSidebar and product-listing pages.
 * ============================================================================
 */
import type { CategoryFacetRow, FacetGroup, FacetQueryState } from '../types/catalog';
import { supabase } from './supabase';

/** Raw rows → grouped FacetGroups (one per property, options nested) */
export function groupFacets(rows: CategoryFacetRow[]): FacetGroup[] {
  const byId = new Map<string, FacetGroup>();
  for (const r of rows) {
    if (!byId.has(r.property_id)) {
      byId.set(r.property_id, {
        property: {
          id: r.property_id,
          name: r.property_name,
          slug: r.property_slug,
          data_type: r.data_type,
          measurement_unit: r.measurement_unit,
          is_variant: r.is_variant,
        },
        options: [],
      });
    }
    if (r.option_id && r.value_slug) {
      byId.get(r.property_id)!.options.push({
        optionId: r.option_id,
        label: r.option_label ?? r.value_slug,
        valueSlug: r.value_slug,
        hexColors: Array.isArray(r.hex_colors) ? r.hex_colors : [],
        parentColorBucket: r.parent_color_bucket,
        count: Number(r.product_count ?? 0),
      });
    }
  }
  return Array.from(byId.values());
}

export async function fetchCategoryFacets(categorySlug: string): Promise<FacetGroup[]> {
  const { data, error } = await supabase.rpc('get_category_facets', {
    category_slug: categorySlug,
  });
  if (error) throw error;
  return groupFacets((data ?? []) as CategoryFacetRow[]);
}

/* ------------------------- URL ↔ state syncing ---------------------------- */

const PRICE_MIN_KEY = 'min_price';
const PRICE_MAX_KEY = 'max_price';

/** Hydrate FacetQueryState from a URLSearchParams instance */
export function parseFacetParams(sp: URLSearchParams): FacetQueryState {
  const selections: Record<string, string[]> = {};
  sp.forEach((value, key) => {
    if (key === PRICE_MIN_KEY || key === PRICE_MAX_KEY || !value) return;
    const vals = value.split(',').map((v) => v.trim()).filter(Boolean);
    if (vals.length > 0) selections[key] = vals;
  });
  const minPrice = Number(sp.get(PRICE_MIN_KEY)) || undefined;
  const maxPrice = Number(sp.get(PRICE_MAX_KEY)) || undefined;
  return { selections, minPrice, maxPrice };
}

/**
 * Serialize state into canonical params:
 *   ?fabric=linen,cotton&color=white-gold&min_price=1000&max_price=5000
 */
export function buildFacetParams(state: FacetQueryState): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [slug, vals] of Object.entries(state.selections)) {
    if (vals.length > 0) sp.set(slug, vals.join(','));
  }
  if (state.minPrice !== undefined) sp.set(PRICE_MIN_KEY, String(state.minPrice));
  if (state.maxPrice !== undefined) sp.set(PRICE_MAX_KEY, String(state.maxPrice));
  return sp;
}

/**
 * Push new facet state onto the router without a full reload.
 * Uses history.replaceState for scroll-preserving filter tweaks; pass
 * `push: true` when you want back-button entries per filter action.
 */
export function syncFacetParams(
  state: FacetQueryState,
  opts: { push?: boolean; basePath?: string } = {}
): void {
  const base = opts.basePath ?? (typeof window !== 'undefined' ? window.location.pathname : '/catalog');
  const qs = buildFacetParams(state).toString();
  const url = qs ? `${base}?${qs}` : base;
  if (typeof window === 'undefined') return;
  if (opts.push) window.history.pushState(null, '', url);
  else window.history.replaceState(null, '', url);
}

/** Convert URL selections into a Supabase PostgREST-compatible filter map */
export function facetSelectionsToFilterMap(
  state: FacetQueryState
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(state.selections).filter(([, v]) => v.length > 0)
  );
}