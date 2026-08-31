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
      className="relative w-full min-h-[85vh] flex items-center overflow-hidden transition-colors duration-300 bg-neutral-900"
    >
      {/* Full-bleed Background Image Container (starts at top-0 under header) */}
      <div className="absolute inset-0 z-0 bg-neutral-900">
        {heroImageSrc ? (
          <>
            {!imgLoaded && (
              <div className="w-full h-full bg-neutral-950 animate-pulse flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <RefreshCw className="w-4 h-4 animate-spin" style={{ color: 'var(--theme-primary, #C5A880)' }} />
                  <span>Loading Atelier Hero...</span>
                </div>
              </div>
            )}
            <img
              src={heroImageSrc}
              alt={siteSettings.siteName || 'Hiwi Fashion'}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover object-top object-[center_top] filter brightness-[0.94] transition-opacity duration-700 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-amber-950 via-amber-900 to-neutral-900" />
        )}

        {/* Soft dynamic gradient overlay for text legibility */}
        <div
          className="absolute inset-0 z-10 pointer-events-none md:w-3/5"
          style={{
            background: 'linear-gradient(to right, var(--theme-app-bg, #F9F7F4) 0%, rgba(249, 247, 244, 0.85) 50%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0 z-10 pointer-events-none md:hidden"
          style={{
            background: 'linear-gradient(to top, var(--theme-app-bg, #F9F7F4) 0%, rgba(249, 247, 244, 0.8) 65%, transparent 100%)',
          }}
        />
      </div>

      {/* Hero Content floating over full-bleed hero image */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 sm:pt-24 pb-16 sm:pb-20">
        <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          
          {/* Brand Tag */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border shadow-xs hover:scale-105 transition-transform duration-300"
            style={{
              backgroundColor: 'var(--theme-card-bg, #FFFFFF)',
              borderColor: 'var(--theme-border-color, #E7E2DA)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: 'var(--theme-primary, #C5A880)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--theme-text-primary, #1A1A1A)' }}>
              {siteSettings.siteName || 'Hiwi Fashion'} • {siteSettings.tagline || 'Habesha Atelier'}
            </span>
          </div>

          {/* Dynamic Headline */}
          <h1
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light leading-[1.15] tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150"
            style={{ color: 'var(--theme-text-primary, #1A1A1A)' }}
          >
            {siteSettings.heroHeadline || t('everydayStyle')}
          </h1>

          {/* Dynamic Subtitle */}
          <p
            className="text-sm sm:text-lg font-light leading-relaxed max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
            style={{ color: 'var(--theme-text-muted, #666059)' }}
          >
            {siteSettings.heroSubtitle || t('heroDesc')}
          </p>

          {/* Primary CTA Button */}
          <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-450">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-3 px-7 sm:px-9 py-3.5 sm:py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-2xl group rounded-xl hover:-translate-y-1 active:scale-95"
              style={{
                backgroundColor: 'var(--theme-button-bg, #1A1A1A)',
                color: 'var(--theme-button-text, #FFFFFF)',
              }}
            >
              <span>{siteSettings.heroCtaText || t('shopCatalog')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </div>

          {/* Direct Telegram Info */}
          <div
            className="pt-4 border-t flex items-center gap-3 text-xs font-medium"
            style={{ borderColor: 'var(--theme-border-color, #E7E2DA)' }}
          >
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: 'var(--theme-card-bg, #FFFFFF)',
                color: 'var(--theme-primary, #C5A880)',
              }}
            >
              <Send className="w-4 h-4" />
            </div>
            <div>
              <span className="block font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--theme-text-primary, #1A1A1A)' }}>
                Direct Telegram Orders
              </span>
              <span className="text-[11px]" style={{ color: 'var(--theme-text-muted, #666059)' }}>
                Inquire & purchase directly via @{telegramUsername}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
