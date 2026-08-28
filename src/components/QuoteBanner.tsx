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
    <section
      className="py-12 sm:py-16 transition-colors duration-300"
      style={{ backgroundColor: 'var(--theme-app-bg, #F0FDF4)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-3xl overflow-hidden border min-h-[360px] sm:min-h-[420px] flex items-center p-6 sm:p-12 lg:p-16 shadow-md"
          style={{
            backgroundColor: 'var(--theme-card-bg, #FFFFFF)',
            borderColor: 'var(--theme-border-color, #A7F3D0)',
          }}
        >
          {/* Background image & gradient */}
          <div className="absolute inset-0 z-0">
            <img
              src={bannerImg}
              alt={siteSettings.siteName || 'Hiwi Fashion Habesha Atelier'}
              className="w-full h-full object-cover object-center filter brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent md:w-3/5" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-xl space-y-4">
            <span
              className="text-xs font-bold uppercase tracking-[0.3em] inline-block"
              style={{ color: 'var(--theme-primary, #10B981)' }}
            >
              AUTHENTIC • TIMELESS • HABESHA
            </span>
            <h2
              className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light leading-tight"
              style={{ color: 'var(--theme-text-primary, #064E3B)' }}
            >
              {headline}
            </h2>
            <p
              className="text-xs sm:text-base font-light leading-relaxed opacity-90"
              style={{ color: 'var(--theme-text-muted, #047857)' }}
            >
              {subtitle}
            </p>
            <div className="pt-2">
              <Link
                href={ctaLink}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 text-xs font-bold uppercase tracking-widest transition-all shadow-md rounded-xl hover:opacity-90 active:scale-95"
                style={{
                  backgroundColor: 'var(--theme-button-bg, #064E3B)',
                  color: 'var(--theme-button-text, #FFFFFF)',
                }}
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
