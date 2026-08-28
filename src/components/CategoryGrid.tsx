'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Category } from '../types';

interface CategoryGridProps {
  categories: Category[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  return (
    <section
      className="py-12 sm:py-16 transition-colors duration-300"
      style={{ backgroundColor: 'var(--theme-app-bg, #F0FDF4)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div
          className="flex items-end justify-between mb-8 sm:mb-10 border-b pb-4"
          style={{ borderColor: 'var(--theme-border-color, #A7F3D0)' }}
        >
          <div>
            <span
              className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: 'var(--theme-primary, #10B981)' }}
            >
              Curated Collections
            </span>
            <h2
              className="font-serif text-2xl sm:text-4xl font-light mt-1"
              style={{ color: 'var(--theme-text-primary, #064E3B)' }}
            >
              Shop by Category
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors hover:opacity-80"
            style={{ color: 'var(--theme-text-primary, #064E3B)' }}
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Categories Cards — compact height, centered, horizontally scrollable on overflow */}
        <div className="group/row relative">
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory [scroll-padding-left:1rem] sm:[scroll-padding-left:0px]">
            <div className="flex items-stretch gap-4 sm:gap-6 w-max min-w-full justify-center py-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalog?category=${cat.slug}`}
                  className="group relative shrink-0 snap-start w-[70vw] max-w-[300px] sm:w-64 lg:w-72 h-52 sm:h-60 lg:h-64 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 flex flex-col justify-end p-5 border"
                  style={{ borderColor: 'var(--theme-card-border, var(--theme-border-color, #A7F3D0))' }}
                >
                  {/* Image */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 filter brightness-95"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent group-hover:from-black/95 transition-colors" />

                  {/* Content */}
                  <div className="relative z-10 space-y-1.5 sm:space-y-2 text-white">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest inline-block px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: 'var(--theme-primary, #10B981)',
                        color: 'var(--theme-secondary, #064E3B)',
                      }}
                    >
                      {cat.itemCount} items
                    </span>
                    <h3 className="font-serif text-xl lg:text-2xl font-light tracking-wide uppercase leading-tight">{cat.name}</h3>
                    <div className="pt-1 sm:pt-2 flex items-center gap-2 text-xs font-bold tracking-widest text-white/90 group-hover:text-amber-300 transition-colors">
                      <span>SHOP NOW</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile swipe hint */}
          {categories.length > 1 && (
            <p
              className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.25em] sm:hidden opacity-80"
              style={{ color: 'var(--theme-text-muted, #047857)' }}
            >
              Swipe to explore
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
