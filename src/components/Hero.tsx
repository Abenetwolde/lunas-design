'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Send, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Hero: React.FC = () => {
  const { siteSettings, telegramUsername } = useStore();
  const [imgLoaded, setImgLoaded] = useState(false);

  const heroImageSrc = siteSettings.heroImageUrl || '';

  return (
    <section className="relative w-full min-h-[82vh] flex items-center bg-[#FAF8F5] overflow-hidden border-b border-[#E7E2DA]">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 bg-[#EAE4DC]">
        {heroImageSrc ? (
          <>
            {!imgLoaded && (
              <div className="w-full h-full bg-[#FAF8F5] animate-pulse flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Loading Atelier Hero...</span>
                </div>
              </div>
            )}
            <img
              src={heroImageSrc}
              alt={siteSettings.siteName || 'Hiwi Fashion'}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover object-top filter brightness-[0.95] transition-opacity duration-700 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#FAF8F5] via-[#F4EFEA] to-[#EAE4DC]" />
        )}
        {/* Soft gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5]/90 via-[#FAF8F5]/60 to-transparent md:w-3/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-transparent to-transparent md:hidden" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
        <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-left duration-700">
          
          {/* Brand Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-[#E7E2DA] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1A1A1A]">
              {siteSettings.siteName || 'Hiwi Fashion'} • {siteSettings.tagline || 'Habesha Atelier'}
            </span>
          </div>

          {/* Dynamic Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-[#1A1A1A] leading-[1.1] tracking-tight">
            {siteSettings.heroHeadline || 'Everyday Habesha Style'}
          </h1>

          {/* Dynamic Subtitle */}
          <p className="text-sm sm:text-lg text-gray-700 font-light leading-relaxed max-w-md">
            {siteSettings.heroSubtitle || 'Handcrafted Ethiopian Kemis dresses, fine cotton Shemma scarves, and modern tailored silhouettes.'}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
            <Link
              href="/catalog"
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C5A880] transition-all shadow-lg flex items-center gap-3 group rounded-xl sm:rounded-none"
            >
              <span>{siteSettings.heroCtaText || 'SHOP CATALOG'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/catalog?category=dresses"
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white/90 backdrop-blur-md text-[#1A1A1A] text-xs font-bold uppercase tracking-widest border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all shadow-sm rounded-xl sm:rounded-none"
            >
              HABESHA KEMIS
            </Link>
          </div>

          {/* Direct Inquire & Purchase Notification */}
          <div className="pt-4 border-t border-[#E7E2DA]/80 flex items-center gap-3 text-xs text-gray-600 font-medium">
            <div className="w-8 h-8 rounded-full bg-[#0088cc]/10 flex items-center justify-center text-[#0088cc] shrink-0">
              <Send className="w-4 h-4" />
            </div>
            <span>Inquire & buy directly in ETB via <strong>@{telegramUsername}</strong></span>
          </div>

        </div>
      </div>
    </section>
  );
};
