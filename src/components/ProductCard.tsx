'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, ColorOption } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Send, Star, Eye, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openTelegramModal, toggleWishlist, isInWishlist, t } = useStore();
  const [selectedColor, setSelectedColor] = useState<ColorOption>(
    product.colors && product.colors.length > 0 ? product.colors[0] : { name: 'Standard', hex: '#1A1A1A' }
  );

  const isWishlisted = isInWishlist(product.id);
  const isInStock = product.inStock !== false;

  // Format price in ETB
  const formattedPrice = `ETB ${product.price.toLocaleString('en-US')}`;
  const formattedOriginalPrice = product.originalPrice && product.originalPrice > product.price
    ? `ETB ${product.originalPrice.toLocaleString('en-US')}`
    : null;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E7E2DA] hover:shadow-xl transition-all duration-300">
      
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF8F5]">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 ${
              !isInStock ? 'grayscale opacity-75' : ''
            }`}
          />

          {/* Secondary Hover Image */}
          {product.secondaryImage && (
            <img
              src={product.secondaryImage}
              alt={`${product.name} secondary preview`}
              className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {!isInStock ? (
            <span className="bg-red-600 text-white text-[9px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-md shadow-sm">
              OUT OF STOCK
            </span>
          ) : (
            <>
              {product.badgeText && (
                <span className="bg-[#1A1A1A] text-white text-[9px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-md shadow-sm">
                  {product.badgeText}
                </span>
              )}
              {product.isNew && !product.badgeText && (
                <span className="bg-[#1A1A1A] text-white text-[9px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-md shadow-sm">
                  NEW
                </span>
              )}
              {product.isSale && formattedOriginalPrice && !product.badgeText && (
                <span className="bg-red-600 text-white text-[9px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-md shadow-sm">
                  SALE
                </span>
              )}
            </>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isWishlisted
              ? 'bg-red-50 text-red-600 shadow-md'
              : 'bg-white/80 backdrop-blur-md text-gray-700 hover:bg-white hover:text-black shadow-sm'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button */}
        <Link
          href={`/product/${product.slug}`}
          className="absolute bottom-3 left-3 right-3 py-2 bg-white/90 backdrop-blur-md text-[#1A1A1A] text-xs font-bold uppercase tracking-wider rounded-xl text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md flex items-center justify-center gap-1.5 hover:bg-[#1A1A1A] hover:text-white"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View</span>
        </Link>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Category & Title */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">
            {product.category}
          </span>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-[#1A1A1A] hover:text-[#C5A880] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Color Palette Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 py-0.5">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c)}
                className={`w-4 h-4 rounded-full border transition-transform ${
                  selectedColor.name === c.name ? 'ring-2 ring-[#1A1A1A] scale-110' : 'border-gray-300 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        )}

        {/* Rating & Conditional ETB Price */}
        <div className="flex items-center justify-between pt-1 border-t border-[#E7E2DA]">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-extrabold text-[#1A1A1A]">{formattedPrice}</span>
            {formattedOriginalPrice && (
              <span className="text-[11px] text-gray-400 line-through font-normal">{formattedOriginalPrice}</span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-600">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Order Action Button */}
        <Link
          href={`/product/${product.slug || product.id}`}
          className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-1 text-center ${
            isInStock
              ? 'bg-[#1A1A1A] hover:bg-[#C5A880] text-white hover:text-black'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isInStock ? t('selectAndBuy') : t('outOfStock')}</span>
        </Link>

      </div>
    </div>
  );
};
