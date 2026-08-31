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

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getProducts();
  const categories = await getCategories();

  const newArrivals = products.slice(0, 8);

  return (
    <div className="space-y-0">
      {/* Hero Banner */}
      <Hero />

      {/* Categories Grid */}
      <CategoryGrid categories={categories} />

      {/* NEW ARRIVALS Section */}
      <section className="py-16 border-t transition-colors duration-300" style={{ backgroundColor: 'var(--theme-card-bg, #FFFFFF)', borderColor: 'var(--theme-border-color, #A7F3D0)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex items-end justify-between border-b pb-4" style={{ borderColor: 'var(--theme-border-color, #A7F3D0)' }}>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--theme-primary, #10B981)' }}>
                Fresh Off The Runway
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light mt-1" style={{ color: 'var(--theme-text-primary, #064E3B)' }}>
                New Arrivals
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

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
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

      {/* Feature Highlights (Mini Cards above footer) */}
      <FeatureBar />
    </div>
  );
}
