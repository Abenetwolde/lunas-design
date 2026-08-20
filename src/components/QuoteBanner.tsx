'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const QuoteBanner: React.FC = () => {
  const { siteSettings, t } = useStore();

  const bannerImg = siteSettings.promoBannerImage || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1600';
  const headline = siteSettings.promoBannerHeadline || t('craftedSpecialMoment');
  const subtitle = siteSettings.promoBannerSubtitle || 'From traditional Ethiopian celebrations to casual everyday wear. Handcrafted with organic Ethiopian cotton and woven Netela embroidery.';
  const ctaText = siteSettings.promoBannerCtaText || t('discoverCollection');
  const ctaLink = siteSettings.promoBannerCtaLink || '/catalog';

  return (
    <section className="py-16 bg-[#F9F7F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#EAE4DC] border border-[#E7E2DA] min-h-[380px] flex items-center p-8 sm:p-12 lg:p-16">
          {/* Background image & gradient */}
          <div className="absolute inset-0 z-0">
            <img
              src={bannerImg}
              alt={siteSettings.siteName || 'Hiwi Fashion Habesha Atelier'}
              className="w-full h-full object-cover object-center filter brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5]/95 via-[#FAF8F5]/75 to-transparent md:w-3/5" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A880]">
              AUTHENTIC • TIMELESS • HABESHA
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] leading-tight">
              {headline}
            </h2>
            <p className="text-sm sm:text-base text-gray-700 font-light leading-relaxed">
              {subtitle}
            </p>
            <div className="pt-2">
              <Link
                href={ctaLink}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C5A880] transition-colors shadow-md rounded-xl"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
