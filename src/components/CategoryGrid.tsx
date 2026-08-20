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
    <section className="py-16 bg-[#F9F7F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10 border-b border-[#E7E2DA] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C5A880]">
              Curated Collections
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-light mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-[#C5A880] flex items-center gap-1 transition-colors"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Categories Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className="group relative h-96 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 flex flex-col justify-end p-6 border border-[#E7E2DA]"
            >
              {/* Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 filter brightness-95"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-colors" />

              {/* Content */}
              <div className="relative z-10 space-y-2 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                  {cat.itemCount} items
                </span>
                <h3 className="font-serif text-2xl font-light tracking-wide uppercase">{cat.name}</h3>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold tracking-widest text-white/90 group-hover:text-[#C5A880] transition-colors">
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
