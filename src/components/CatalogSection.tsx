'use client';

import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';
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
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number>(6000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saleOnly, setSaleOnly] = useState<boolean>(initialSaleOnly);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [viewMode, setViewMode] = useState<'grid-4' | 'grid-3' | 'grid-2' | 'list'>('grid-4');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available filter values
  const colorOptions = [
    { name: 'Pure White', hex: '#FAFAFA' },
    { name: 'Sand Beige', hex: '#D8C5B3' },
    { name: 'Charcoal Black', hex: '#1A1A1A' },
    { name: 'Cream', hex: '#ECE6D8' },
    { name: 'Gold Champagne', hex: '#F4E4C1' },
    { name: 'Emerald Green', hex: '#1B4D3E' },
    { name: 'Taupe', hex: '#B3A394' },
    { name: 'Tan Brown', hex: '#AF6E4D' },
  ];

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', '36', '37', '38', '39', '40', '41', 'One Size'];
  const materialOptions = ['Linen', 'Cotton', 'Satin', 'Silk', 'Chiffon'];
  const occasionOptions = ['Casual', 'Work', 'Party', 'Wedding'];

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
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

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedMaterials([]);
    setSelectedOccasions([]);
    setPriceMax(6000);
    setSearchQuery('');
    setSaleOnly(false);
  };

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      // Category
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category.toLowerCase())) {
        return false;
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
        const pColorNames = p.colors.map((c) => c.name);
        if (!selectedColors.some((c) => pColorNames.includes(c))) return false;
      }
      // Size
      if (selectedSizes.length > 0) {
        if (!selectedSizes.some((s) => p.sizes.includes(s))) return false;
      }
      // Material
      if (selectedMaterials.length > 0 && p.material) {
        if (!selectedMaterials.includes(p.material)) return false;
      }
      // Occasion
      if (selectedOccasions.length > 0 && p.occasion) {
        if (!selectedOccasions.includes(p.occasion)) return false;
      }
      // Search
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
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
    selectedCategories,
    selectedColors,
    selectedSizes,
    selectedMaterials,
    selectedOccasions,
    priceMax,
    searchQuery,
    saleOnly,
    sortBy,
  ]);

  const activeFilterCount =
    selectedCategories.length +
    selectedColors.length +
    selectedSizes.length +
    selectedMaterials.length +
    selectedOccasions.length +
    (saleOnly ? 1 : 0) +
    (priceMax < 6000 ? 1 : 0);

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
            const count = initialProducts.filter((p) => p.category.toLowerCase() === cat.slug).length;
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

      {/* COLOR Filter */}
      <div className="space-y-3 pt-4 border-t border-[#E7E2DA]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Color Palette</h4>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((c) => {
            const isSelected = selectedColors.includes(c.name);
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

      {/* SIZE Filter */}
      <div className="space-y-3 pt-4 border-t border-[#E7E2DA]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Size</h4>
        <div className="flex flex-wrap gap-1.5">
          {sizeOptions.map((sz) => {
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

      {/* PRICE RANGE Filter (ETB) */}
      <div className="space-y-3 pt-4 border-t border-[#E7E2DA]">
        <div className="flex justify-between items-center text-xs">
          <h4 className="font-bold uppercase tracking-wider text-[#1A1A1A]">Max Price</h4>
          <span className="font-bold text-[#C5A880]">ETB {priceMax.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="1000"
          max="6000"
          step="200"
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-[#1A1A1A]"
        />
      </div>

      {/* MATERIAL Filter */}
      <div className="space-y-3 pt-4 border-t border-[#E7E2DA]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Material</h4>
        <div className="flex flex-wrap gap-1.5">
          {materialOptions.map((mat) => {
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

      {/* OCCASION Filter */}
      <div className="space-y-3 pt-4 border-t border-[#E7E2DA]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Occasion</h4>
        <div className="flex flex-wrap gap-1.5">
          {occasionOptions.map((occ) => {
            const isSelected = selectedOccasions.includes(occ);
            return (
              <button
                key={occ}
                onClick={() => toggleOccasion(occ)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                  isSelected
                    ? 'bg-[#C5A880] text-black font-bold border-[#C5A880]'
                    : 'bg-white text-gray-600 border-[#E7E2DA] hover:border-gray-400'
                }`}
              >
                {occ}
              </button>
            );
          })}
        </div>
      </div>
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
