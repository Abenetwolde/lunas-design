'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, ColorOption } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Send, Star, Eye, ShoppingBag, Image as ImageIcon } from 'lucide-react';

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

  // Dynamic cover image resolution
  const coverImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : '');
  const secondaryImage = product.secondaryImage && product.secondaryImage !== coverImage ? product.secondaryImage : undefined;

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden border hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
      style={{
        backgroundColor: 'var(--theme-card-bg, #FFFFFF)',
        borderColor: 'var(--theme-card-border, var(--theme-border-color, #E7E2DA))',
      }}
    >
      
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF8F5]">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          {coverImage ? (
            <img
              src={coverImage}
              alt={product.name}
              className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-108 ${
                !isInStock ? 'grayscale opacity-75' : ''
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center">
              <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">No Image</span>
            </div>
          )}

          {/* Secondary Hover Image */}
          {secondaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.name} secondary preview`}
              className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
            />
          )}
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 active:scale-125 ${
            isWishlisted
              ? 'bg-red-50 text-red-600 shadow-md scale-105'
              : 'bg-white/80 backdrop-blur-md text-gray-700 hover:bg-white hover:text-black hover:scale-110 shadow-sm'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current animate-pulse' : ''}`} />
        </button>

        {/* Quick View Button */}
        <Link
          href={`/product/${product.slug}`}
          className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 py-1.5 sm:py-2 bg-white/90 backdrop-blur-md text-[#1A1A1A] text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg sm:rounded-xl text-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-md flex items-center justify-center gap-1 hover:bg-[#1A1A1A] hover:text-white"
        >
          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Quick View</span>
        </Link>
      </div>

      {/* Product Content Details */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        
        {/* Category & Title */}
        <div className="space-y-0.5 sm:space-y-1">
          <span
            className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] block line-clamp-1"
            style={{ color: 'var(--theme-primary, #C5A880)' }}
          >
            {product.category}
          </span>
          <Link href={`/product/${product.slug}`} className="block">
            <h3
              className="text-[11px] sm:text-sm font-bold transition-colors line-clamp-1"
              style={{ color: 'var(--theme-card-text, var(--theme-text-primary, #1A1A1A))' }}
            >
              {product.name}
            </h3>
          </Link>
        </div>



        {/* Rating & Conditional ETB Price */}
        <div
          className="flex items-center justify-between pt-1 border-t"
          style={{ borderColor: 'var(--theme-card-border, var(--theme-border-color, #E7E2DA))' }}
        >
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span
              className="text-xs sm:text-sm font-extrabold"
              style={{ color: 'var(--theme-card-text, var(--theme-text-primary, #1A1A1A))' }}
            >
              {formattedPrice}
            </span>
            {formattedOriginalPrice && (
              <span
                className="text-[9px] sm:text-[11px] line-through font-normal"
                style={{ color: 'var(--theme-card-muted, var(--theme-text-muted, #666059))' }}
              >
                {formattedOriginalPrice}
              </span>
            )}
          </div>

          {/* Real rating only */}
          {Number(product.reviewsCount) > 0 && Number(product.rating) > 0 && (
            <div
              className="flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold"
              style={{ color: 'var(--theme-card-muted, var(--theme-text-muted, #666059))' }}
            >
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 fill-amber-500" />
              <span>{Number(product.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Order Action Button */}
        <Link
          href={`/product/${product.slug || product.id}`}
          className={`w-full py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg sm:rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 mt-1 text-center ${
            isInStock
              ? 'hover:opacity-90'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none'
          }`}
          style={
            isInStock
              ? {
                  backgroundColor: 'var(--theme-card-button-bg, var(--theme-button-bg, #1A1A1A))',
                  color: 'var(--theme-card-button-text, var(--theme-button-text, #FFFFFF))',
                }
              : {}
          }
        >
          <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="truncate">{isInStock ? t('selectAndBuy') : t('outOfStock')}</span>
        </Link>

      </div>
    </div>
  );
};
