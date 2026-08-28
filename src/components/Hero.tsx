'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Send, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Hero: React.FC = () => {
  const { siteSettings, telegramUsername, t } = useStore();
  const [imgLoaded, setImgLoaded] = useState(false);

  const heroImageSrc = siteSettings.heroImageUrl || '';

  return (
    <section
      className="relative w-full min-h-[82vh] flex items-center overflow-hidden border-b transition-colors duration-300"
      style={{
        backgroundColor: 'var(--theme-app-bg, #F0FDF4)',
        borderColor: 'var(--theme-border-color, #A7F3D0)',
      }}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 bg-[#EAE4DC]">
        {heroImageSrc ? (
          <>
            {!imgLoaded && (
              <div
                className="w-full h-full animate-pulse flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-app-bg, #F0FDF4)' }}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <RefreshCw className="w-4 h-4 animate-spin" style={{ color: 'var(--theme-primary, #10B981)' }} />
                  <span>Loading Atelier Hero...</span>
                </div>
              </div>
            )}
            <img
              src={heroImageSrc}
              alt={siteSettings.siteName || 'Hiwi Fashion'}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover object-top filter brightness-[0.92] transition-opacity duration-700 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-emerald-50 via-teal-100 to-emerald-200" />
        )}
        {/* Soft gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-transparent md:w-3/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent md:hidden" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 sm:pt-32 pb-12 sm:pb-16">
        <div className="max-w-xl space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-left duration-700">
          
          {/* Brand Tag */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border shadow-xs"
            style={{
              backgroundColor: 'var(--theme-card-bg, #FFFFFF)',
              borderColor: 'var(--theme-border-color, #A7F3D0)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary, #10B981)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--theme-text-primary, #064E3B)' }}>
              {siteSettings.siteName || 'Hiwi Fashion'} • {siteSettings.tagline || 'Habesha Atelier'}
            </span>
          </div>

          {/* Dynamic Headline */}
          <h1
            className="font-serif text-3xl sm:text-5xl lg:text-7xl font-light leading-[1.15] tracking-tight"
            style={{ color: 'var(--theme-text-primary, #064E3B)' }}
          >
            {siteSettings.heroHeadline || t('everydayStyle')}
          </h1>

          {/* Dynamic Subtitle */}
          <p
            className="text-sm sm:text-lg font-light leading-relaxed max-w-md"
            style={{ color: 'var(--theme-text-muted, #047857)' }}
          >
            {siteSettings.heroSubtitle || t('heroDesc')}
          </p>

          {/* Single Primary CTA */}
          <div className="pt-2">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 text-xs font-bold uppercase tracking-widest transition-all shadow-md group rounded-xl hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: 'var(--theme-button-bg, #064E3B)',
                color: 'var(--theme-button-text, #FFFFFF)',
              }}
            >
              <span>{siteSettings.heroCtaText || t('shopCatalog')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Direct Inquire & Purchase Notification */}
          <div
            className="pt-4 border-t flex items-center gap-3 text-xs font-medium"
            style={{ borderColor: 'var(--theme-border-color, #A7F3D0)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--theme-primary, #10B981)',
                color: '#FFFFFF',
              }}
            >
              <Send className="w-4 h-4" />
            </div>
            <span style={{ color: 'var(--theme-text-muted, #047857)' }}>
              {t('directInquire')} <strong style={{ color: 'var(--theme-text-primary, #064E3B)' }}>@{telegramUsername}</strong>
            </span>
          </div>

        </div>
      </div>
    </section>
  );
};
