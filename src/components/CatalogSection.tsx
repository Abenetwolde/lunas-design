'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Product, Category, PropertyDefinition } from '../types';
import { getPropertyDefinitions } from '../lib/supabase';
import { ProductCard } from './ProductCard';
import {
  SlidersHorizontal,
  Grid3X3,
  Grid2X2,
  List,
  Search,
  RotateCcw,
  Check,
  ChevronDown,
  X,
  Send,
  Tag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CatalogSectionProps {
  initialProducts: Product[];
  categories: Category[];
  initialCategorySlug?: string;
  initialSaleOnly?: boolean;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  initialProducts,
  categories,
  initialCategorySlug,
  initialSaleOnly = false,
}) => {
  const { openTelegramModal } = useStore();

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategorySlug ? [initialCategorySlug] : []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number>(15000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saleOnly, setSaleOnly] = useState<boolean>(initialSaleOnly);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [viewMode, setViewMode] = useState<'grid-4' | 'grid-3' | 'grid-2' | 'list'>('grid-4');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Dynamic Schema Property Definitions State
  const [propertyDefs, setPropertyDefs] = useState<PropertyDefinition[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});

  useEffect(() => {
    getPropertyDefinitions().then((defs) => setPropertyDefs(defs.filter((d) => d.filterable)));
  }, []);

  // Helper to test if product matches category
  const isProductInCategory = (pCategory: string, catSlug: string, catName?: string) => {
    if (!pCategory || !catSlug) return false;
    const pCat = pCategory.toLowerCase().trim();
    const cSlug = catSlug.toLowerCase().trim();
    const cName = catName ? catName.toLowerCase().trim() : cSlug;

    if (pCat === cSlug || pCat === cName) return true;

    const normP = pCat.replace(/s$/, '');
    const normS = cSlug.replace(/s$/, '');
    const normN = cName.replace(/s$/, '');

    if (normP === normS || normP === normN) return true;
    if (normS.length >= 3 && normP.includes(normS)) return true;
    if (normP.length >= 3 && normS.includes(normP)) return true;
    return false;
  };

  // Scoped products: products in currently selected category (or all if none selected)
  const scopedProducts = useMemo(() => {
    if (selectedCategories.length === 0) return initialProducts;
    return initialProducts.filter((p) =>
      selectedCategories.some((slug) => {
        const catObj = categories.find((c) => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase());
        return isProductInCategory(p.category, slug, catObj?.name);
      })
    );
  }, [initialProducts, selectedCategories, categories]);

  // Dynamic Subcategories derived from active categories & products in scope
  const dynamicSubcategories = useMemo(() => {
    const subcatSet = new Set<string>();

    const activeCats = selectedCategories.length > 0
      ? categories.filter((c) => selectedCategories.includes(c.slug) || selectedCategories.some(s => isProductInCategory(c.slug, s, c.name)))
      : categories;

    activeCats.forEach((c) => {
      (c.subcategories || []).forEach((sc) => {
        if (sc && sc.trim()) subcatSet.add(sc.trim());
      });
    });

    scopedProducts.forEach((p) => {
      if (p.subcategory && p.subcategory.trim()) {
        subcatSet.add(p.subcategory.trim());
      }
    });

    return Array.from(subcatSet);
  }, [categories, selectedCategories, scopedProducts]);

  // Dynamic Colors derived from real database products
  const dynamicColorOptions = useMemo(() => {
    const colorMap = new Map<string, string>();
    scopedProducts.forEach((p) => {
      (p.colors || []).forEach((c) => {
        if (c && c.name && !colorMap.has(c.name.toLowerCase())) {
          colorMap.set(c.name.toLowerCase(), c.hex || '#1A1A1A');
        }
      });
    });
    return Array.from(colorMap.entries()).map(([rawName, hex]) => {
      const displayName = rawName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return { name: displayName, rawName, hex };
    });
  }, [scopedProducts]);

  // Dynamic Sizes derived from real database products
  const dynamicSizeOptions = useMemo(() => {
    const sizeSet = new Set<string>();
    scopedProducts.forEach((p) => {
      (p.sizes || []).forEach((s) => {
        if (s && s.trim()) sizeSet.add(s.trim());
      });
    });
    return Array.from(sizeSet);
  }, [scopedProducts]);

  // Dynamic Materials derived from real database products
  const dynamicMaterialOptions = useMemo(() => {
    const matSet = new Set<string>();
    scopedProducts.forEach((p) => {
      if (p.material && p.material.trim()) {
        matSet.add(p.material.trim());
      }
    });
    return Array.from(matSet);
  }, [scopedProducts]);

  // Dynamic Occasions derived from real database products
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const dynamicOccasionOptions = useMemo(() => {
    const occSet = new Set<string>();
    scopedProducts.forEach((p) => {
      if (p.occasion && p.occasion.trim()) {
        occSet.add(p.occasion.trim());
      }
    });
    return Array.from(occSet);
  }, [scopedProducts]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleSubcategory = (subcat: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcat) ? prev.filter((s) => s !== subcat) : [...prev, subcat]
    );
  };

  const toggleColor = (name: string) => {
    setSelectedColors((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const toggleOccasion = (occ: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const toggleAttribute = (slug: string, val: string) => {
    setSelectedAttributes((prev) => {
      const current = prev[slug] || [];
      const updated = current.includes(val) ? current.filter((v) => v !== val) : [...current, val];
      return { ...prev, [slug]: updated };
    });
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedMaterials([]);
    setSelectedOccasions([]);
    setSelectedAttributes({});
    setPriceMax(15000);
    setSearchQuery('');
    setSaleOnly(false);
  };

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      // Category Filter
      if (selectedCategories.length > 0) {
        const matchesCat = selectedCategories.some((slug) => {
          const catObj = categories.find((c) => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase());
          return isProductInCategory(p.category, slug, catObj?.name);
        });
        if (!matchesCat) return false;
      }
      // Subcategory Filter
      if (selectedSubcategories.length > 0) {
        const pSub = (p.subcategory || '').toLowerCase();
        const pDesc = p.description.toLowerCase();
        const pName = p.name.toLowerCase();
        const matchesSub = selectedSubcategories.some((selSub) => {
          const s = selSub.toLowerCase();
          return pSub.includes(s) || s.includes(pSub) || pDesc.includes(s) || pName.includes(s);
        });
        if (!matchesSub) return false;
      }
      // Sale only
      if (saleOnly && !p.isSale) {
        return false;
      }
      // Price in ETB
      if (p.price > priceMax) {
        return false;
      }
      // Color
      if (selectedColors.length > 0) {
        const pColorNames = (p.colors || []).map((c) => c.name.toLowerCase());
        const matchesColor = selectedColors.some((selColor) =>
          pColorNames.some(
            (pCol) => pCol.includes(selColor.toLowerCase()) || selColor.toLowerCase().includes(pCol)
          )
        );
        if (!matchesColor) return false;
      }
      // Size
      if (selectedSizes.length > 0) {
        const pSizes = (p.sizes || []).map((s) => s.toLowerCase());
        const matchesSize = selectedSizes.some((selSize) =>
          pSizes.includes(selSize.toLowerCase())
        );
        if (!matchesSize) return false;
      }
      // Material
      if (selectedMaterials.length > 0) {
        const pMat = (p.material || '').toLowerCase();
        const matchesMat = selectedMaterials.some(
          (mat) => pMat.includes(mat.toLowerCase()) || mat.toLowerCase().includes(pMat)
        );
        if (!matchesMat) return false;
      }
      // Occasion
      if (selectedOccasions.length > 0) {
        const pOcc = (p.occasion || '').toLowerCase();
        const matchesOcc = selectedOccasions.some(
          (occ) => pOcc.includes(occ.toLowerCase()) || occ.toLowerCase().includes(pOcc)
        );
        if (!matchesOcc) return false;
      }
      // Dynamic Attributes filter (Metadata-driven)
      for (const [attrSlug, selVals] of Object.entries(selectedAttributes)) {
        if (selVals && selVals.length > 0) {
          const prodAttrVal = p.attributes?.[attrSlug];
          if (prodAttrVal === undefined || prodAttrVal === null || prodAttrVal === '') return false;
          if (Array.isArray(prodAttrVal)) {
            const match = selVals.some((v) => prodAttrVal.includes(v));
            if (!match) return false;
          } else {
            const strVal = String(prodAttrVal).toLowerCase();
            const match = selVals.some((v) => strVal.includes(v.toLowerCase()));
            if (!match) return false;
          }
        }
      }

      // Search
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.subcategory || '').toLowerCase().includes(query)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.isNew ? 1 : -1;
    });
  }, [
    initialProducts,
    categories,
    selectedCategories,
    selectedSubcategories,
    selectedColors,
    selectedSizes,
    selectedMaterials,
    selectedOccasions,
    selectedAttributes,
    priceMax,
    searchQuery,
    saleOnly,
    sortBy,
  ]);

  const activeFilterCount =
    selectedCategories.length +
    selectedSubcategories.length +
    selectedColors.length +
    selectedSizes.length +
    selectedMaterials.length +
    (saleOnly ? 1 : 0) +
    (priceMax < 15000 ? 1 : 0);

  const currentCategoryInfo = useMemo(() => {
    if (selectedCategories.length === 1) {
      return categories.find((c) => c.slug === selectedCategories[0]);
    }
    return null;
  }, [categories, selectedCategories]);

  // Reusable Filter Content JSX Component
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Title & Clear All */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#C5A880]" /> Filter Catalog
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* CATEGORY Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Category</h4>
        <div className="space-y-2 text-xs">
          {categories.map((cat) => {
            const isChecked = selectedCategories.includes(cat.slug);
            const count = initialProducts.filter((p) => isProductInCategory(p.category, cat.slug, cat.name)).length;
            return (
              <label
                key={cat.id}
                className="flex items-center justify-between text-gray-700 hover:text-black cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCategory(cat.slug)}
                    className="rounded border-[#E7E2DA] text-[#1A1A1A] focus:ring-0"
                  />
                  <span>{cat.name}</span>
                </div>
                <span className="text-gray-400 text-[11px]">({count})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC SUB-CATEGORY / STYLE Filter */}
      {dynamicSubcategories.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#E7E2DA]">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Sub-Category & Style
            </h4>
            {selectedSubcategories.length > 0 && (
              <button
                onClick={() => setSelectedSubcategories([])}
                className="text-[10px] text-gray-500 hover:text-black font-semibold"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {dynamicSubcategories.map((subcat) => {
              const isSelected = selectedSubcategories.includes(subcat);
              const count = scopedProducts.filter((p) => {
                const pSub = (p.subcategory || '').toLowerCase();
                const pDesc = p.description.toLowerCase();
                const pName = p.name.toLowerCase();
                const s = subcat.toLowerCase();
                return pSub.includes(s) || s.includes(pSub) || pDesc.includes(s) || pName.includes(s);
              }).length;

              return (
                <button
                  key={subcat}
                  onClick={() => toggleSubcategory(subcat)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                      : 'bg-white text-gray-700 border-[#E7E2DA] hover:border-[#C5A880] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>{subcat}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-[#C5A880]' : 'text-gray-400'}`}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DYNAMIC COLOR PALETTE Filter */}
      {dynamicColorOptions.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#E7E2DA]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Color Palette</h4>
          <div className="flex flex-wrap gap-2">
            {dynamicColorOptions.map((c) => {
              const isSelected = selectedColors.includes(c.name) || selectedColors.includes(c.rawName);
              return (
                <button
                  key={c.name}
                  onClick={() => toggleColor(c.name)}
                  className={`w-7 h-7 rounded-full border relative flex items-center justify-center transition-all ${
                    isSelected ? 'ring-2 ring-[#1A1A1A] ring-offset-2 scale-110' : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 ${c.hex === '#FAFAFA' || c.hex === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DYNAMIC SIZE Filter */}
      {dynamicSizeOptions.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#E7E2DA]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Size</h4>
          <div className="flex flex-wrap gap-1.5">
            {dynamicSizeOptions.map((sz) => {
              const isSelected = selectedSizes.includes(sz);
              return (
                <button
                  key={sz}
                  onClick={() => toggleSize(sz)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm'
                      : 'bg-[#FAF8F5] text-gray-700 border-[#E7E2DA] hover:border-gray-400'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PRICE RANGE Filter (ETB) */}
      <div className="space-y-3 pt-4 border-t border-[#E7E2DA]">
        <div className="flex justify-between items-center text-xs">
          <h4 className="font-bold uppercase tracking-wider text-[#1A1A1A]">Max Price</h4>
          <span className="font-bold text-[#C5A880]">ETB {priceMax.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="1000"
          max="15000"
          step="500"
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-[#1A1A1A]"
        />
      </div>

      {/* DYNAMIC MATERIAL Filter */}
      {dynamicMaterialOptions.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#E7E2DA]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Material</h4>
          <div className="flex flex-wrap gap-1.5">
            {dynamicMaterialOptions.map((mat) => {
              const isSelected = selectedMaterials.includes(mat);
              return (
                <button
                  key={mat}
                  onClick={() => toggleMaterial(mat)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                    isSelected
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white text-gray-600 border-[#E7E2DA] hover:border-gray-400'
                  }`}
                >
                  {mat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DYNAMIC OCCASION Filter */}
      {dynamicOccasionOptions.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#E7E2DA]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Occasion & Collection</h4>
          <div className="flex flex-wrap gap-1.5">
            {dynamicOccasionOptions.map((occ) => {
              const isSelected = selectedOccasions.includes(occ);
              return (
                <button
                  key={occ}
                  onClick={() => toggleOccasion(occ)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                    isSelected
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white text-gray-600 border-[#E7E2DA] hover:border-gray-400'
                  }`}
                >
                  {occ}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* METADATA-DRIVEN DYNAMIC FILTERS (AUTOMATICALLY GENERATED FROM ADMIN SCHEMA) */}
      {propertyDefs
        .filter(
          (pdef) =>
            pdef.filterable &&
            (selectedCategories.length === 0 ||
              pdef.categoryIds.includes('all') ||
              selectedCategories.some((sc) => pdef.categoryIds.includes(sc)))
        )
        .map((pdef) => {
          const selVals = selectedAttributes[pdef.slug] || [];

          // Collect active options either from pdef.options or derived from scoped products
          const availableOptions: { name: string; value: string; hex?: string }[] = [];
          if (pdef.options && pdef.options.length > 0) {
            pdef.options.forEach((opt) => availableOptions.push({ name: opt.name, value: opt.value, hex: opt.hex }));
          } else {
            const derived = new Set<string>();
            scopedProducts.forEach((p) => {
              const val = p.attributes?.[pdef.slug];
              if (val) {
                if (Array.isArray(val)) val.forEach((v) => derived.add(String(v)));
                else derived.add(String(val));
              }
            });
            Array.from(derived).forEach((val) => availableOptions.push({ name: val, value: val }));
          }

          if (availableOptions.length === 0) return null;

          return (
            <div key={pdef.id} className="space-y-3 pt-4 border-t border-[#E7E2DA]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  {pdef.name} {pdef.unit ? `(${pdef.unit})` : ''}
                </h4>
                {selVals.length > 0 && (
                  <span className="text-[10px] text-[#C5A880] font-bold">({selVals.length})</span>
                )}
              </div>

              {/* Color swatch rendering */}
              {pdef.type === 'color' ? (
                <div className="flex flex-wrap gap-2">
                  {availableOptions.map((opt) => {
                    const isSelected = selVals.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleAttribute(pdef.slug, opt.value)}
                        className={`w-7 h-7 rounded-full border border-black/20 flex items-center justify-center transition-all ${
                          isSelected ? 'ring-2 ring-black scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: opt.hex || '#1A1A1A' }}
                        title={opt.name}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Chip / Pill rendering for select, multi_select, number, boolean, text */
                <div className="flex flex-wrap gap-1.5">
                  {availableOptions.map((opt) => {
                    const isSelected = selVals.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleAttribute(pdef.slug, opt.value)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                          isSelected
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                            : 'bg-white text-gray-600 border-[#E7E2DA] hover:border-gray-400'
                        }`}
                      >
                        {opt.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );

  return (
    <div className="bg-[#F9F7F4] min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Category Hero Banner */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#1A1A1A] text-white p-6 sm:p-12 border border-[#E7E2DA]">
          <div className="absolute inset-0 z-0">
            <img
              src={
                currentCategoryInfo?.image ||
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1600'
              }
              alt={currentCategoryInfo?.name || 'Catalog'}
              className="w-full h-full object-cover filter brightness-50"
            />
          </div>
          <div className="relative z-10 max-w-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A880]">
              HIWI FASHION COLLECTION
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light tracking-wide uppercase">
              {currentCategoryInfo?.name || 'Habesha & Modern Catalog'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed">
              {currentCategoryInfo?.description ||
                'Explore authentic Ethiopian Kemis dresses, fine Shemma scarves, and modern clothing with direct Telegram inquiry in ETB.'}
            </p>
          </div>
        </div>

        {/* Toolbar Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E7E2DA] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          
          {/* Left: Mobile filter button & Search */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* FIXED MOBILE FILTER BUTTON TRIGGER */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden px-4 py-2 bg-[#1A1A1A] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#C5A880]" />
              <span>Filter By {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
            </button>

            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Habesha dresses..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#E7E2DA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Results Count, Sort Dropdown & View Mode */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto text-xs">
            <span className="text-gray-500 font-medium">
              Showing <strong>{filteredProducts.length}</strong> items
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl font-bold text-[#1A1A1A] focus:outline-none"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* View Mode Toggles */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl">
              <button
                onClick={() => setViewMode('grid-4')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid-4' ? 'bg-[#1A1A1A] text-white' : 'text-gray-500 hover:text-black'
                }`}
                title="Grid"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-[#1A1A1A] text-white' : 'text-gray-500 hover:text-black'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Sub-Category Quick Filter Bar */}
        {dynamicSubcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#C5A880]" /> Styles:
            </span>
            <button
              onClick={() => setSelectedSubcategories([])}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all border ${
                selectedSubcategories.length === 0
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                  : 'bg-white text-gray-700 border-[#E7E2DA] hover:border-gray-400'
              }`}
            >
              All ({scopedProducts.length})
            </button>
            {dynamicSubcategories.map((subcat) => {
              const isSelected = selectedSubcategories.includes(subcat);
              const count = scopedProducts.filter((p) => {
                const pSub = (p.subcategory || '').toLowerCase();
                const pDesc = p.description.toLowerCase();
                const pName = p.name.toLowerCase();
                const s = subcat.toLowerCase();
                return pSub.includes(s) || s.includes(pSub) || pDesc.includes(s) || pName.includes(s);
              }).length;

              return (
                <button
                  key={subcat}
                  onClick={() => toggleSubcategory(subcat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                      : 'bg-white text-gray-700 border-[#E7E2DA] hover:border-[#C5A880] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>{subcat}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-[#C5A880]' : 'text-gray-400'}`}>({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar Filter Panel - Desktop */}
          <aside className="hidden md:block bg-white p-6 rounded-3xl border border-[#E7E2DA] shadow-sm h-fit sticky top-28">
            <FilterContent />
          </aside>

          {/* MOBILE FILTER MODAL SLIDE-OVER (RESPONSIVE FIX) */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end md:hidden">
              <div className="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E7E2DA] animate-in slide-in-from-right duration-300">
                <div className="p-4 bg-[#1A1A1A] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#C5A880]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Catalog Filters</h3>
                  </div>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <FilterContent />
                </div>

                <div className="p-4 bg-[#FAF8F5] border-t border-[#E7E2DA]">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full py-3 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#C5A880] transition-colors"
                  >
                    Apply Filters ({filteredProducts.length} Items)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Catalog Products Display Grid */}
          <main className="md:col-span-3 space-y-6">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E7E2DA] p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center mx-auto text-gray-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">No matching items found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try adjusting your filter preferences or search keywords to view our full collection.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#C5A880] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-4 sm:gap-6 ${
                  viewMode === 'grid-4'
                    ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {filteredProducts.map((product) =>
                  viewMode === 'list' ? (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-[#E7E2DA] p-4 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full sm:w-44 h-56 object-cover rounded-xl border border-[#E7E2DA]"
                      />
                      <div className="flex-1 space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                            {product.category}
                          </span>
                          <h3 className="text-lg font-bold text-[#1A1A1A]">{product.name}</h3>
                          <p className="text-xs text-gray-600 line-clamp-3 mt-1">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-[#E7E2DA]">
                          <span className="text-lg font-bold text-[#1A1A1A]">
                            ETB {product.price.toLocaleString()}
                          </span>
                          <button
                            onClick={() => openTelegramModal(product)}
                            className="px-5 py-2.5 bg-[#0088cc] text-white text-xs font-bold rounded-xl hover:bg-[#0077b3] transition-colors flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            <span>Select & Buy</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ProductCard key={product.id} product={product} />
                  )
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
