import React from 'react';
import { getProducts, getCategories } from '../lib/supabase';
import { Hero } from '../components/Hero';
import { FeatureBar } from '../components/FeatureBar';
import { CategoryGrid } from '../components/CategoryGrid';
import { ProductCard } from '../components/ProductCard';
import { QuoteBanner } from '../components/QuoteBanner';
import { InstagramFeed } from '../components/InstagramFeed';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const products = await getProducts();
  const categories = await getCategories();

  const newArrivals = products.slice(0, 8);

  return (
    <div className="space-y-0">
      {/* Hero Banner */}
      <Hero />

      {/* Feature Highlights */}
      <FeatureBar />

      {/* Categories Grid */}
      <CategoryGrid categories={categories} />

      {/* NEW ARRIVALS Section */}
      <section className="py-16 bg-white border-t border-[#E7E2DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex items-end justify-between border-b border-[#E7E2DA] pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C5A880]">
                Fresh Off The Runway
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-light mt-1">
                New Arrivals
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Quote Banner */}
      <QuoteBanner />

      {/* Instagram Feed */}
      <InstagramFeed />
    </div>
  );
}
