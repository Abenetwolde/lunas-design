'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Send, Camera, Globe, Share2, Phone, Mail, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const { telegramUsername, siteSettings, setIsSqlModalOpen, t } = useStore();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer
      className="pt-16 pb-12 border-t transition-colors duration-300"
      style={{
        backgroundColor: 'var(--theme-header-bg, var(--theme-secondary, #1A1A1A))',
        color: 'var(--theme-header-text, #FFFFFF)',
        borderColor: 'var(--theme-border-color, rgba(255,255,255,0.15))',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-xs">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span
                className="font-serif text-2xl font-bold tracking-[0.2em] uppercase"
                style={{ color: 'var(--theme-header-text, #FFFFFF)' }}
              >
                {siteSettings.siteName || 'Hiwi Fashion'}
              </span>
              <span
                className="block text-[8px] tracking-[0.35em] uppercase font-bold"
                style={{ color: 'var(--theme-primary, #C5A880)' }}
              >
                {siteSettings.tagline || 'HABESHA & MODERN ATELIER'}
              </span>
            </Link>
            <p className="opacity-80 leading-relaxed font-light max-w-sm">
              {siteSettings.footerAboutText || 'Handcrafted Habesha Kemis, Shemma Netelas, and modern fashion garments. Order directly via Telegram inbox in ETB.'}
            </p>

            {/* Telegram order badge */}
            <a
              href={`https://t.me/${telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/30 font-bold hover:bg-[#0088cc]/30 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{t('announcementSub')} @{telegramUsername}</span>
            </a>

            {/* Contact Details */}
            <div className="space-y-1.5 pt-2 opacity-80 font-light">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary, #C5A880)' }} />
                <span>{siteSettings.storeLocation || 'Bole Subcity, Addis Ababa, Ethiopia'}</span>
              </div>
              {siteSettings.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary, #C5A880)' }} />
                  <span>{siteSettings.contactPhone}</span>
                </div>
              )}
              {siteSettings.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary, #C5A880)' }} />
                  <span>{siteSettings.contactEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 1: Shop */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-widest" style={{ color: 'var(--theme-primary, #C5A880)' }}>
              {t('navCatalog')}
            </h4>
            <ul className="space-y-2 opacity-80 font-light">
              <li>
                <Link href="/catalog?category=dresses" className="hover:opacity-100 transition-opacity">
                  {t('navDresses')}
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=tops" className="hover:opacity-100 transition-opacity">
                  {t('navTops')}
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=accessories" className="hover:opacity-100 transition-opacity">
                  {t('navNetela')}
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=shoes" className="hover:opacity-100 transition-opacity">
                  {t('navShoes')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Customer Care */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-widest" style={{ color: 'var(--theme-primary, #C5A880)' }}>
              {t('customerCare')}
            </h4>
            <ul className="space-y-2 opacity-80 font-light">
              <li>
                <a href={`https://t.me/${telegramUsername}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
                  {t('directBuyingGuide')}
                </a>
              </li>
              <li>
                <Link href="/catalog" className="hover:opacity-100 transition-opacity">
                  {t('addisAbabaDelivery')}
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:opacity-100 transition-opacity">
                  {t('sizeFitCustomization')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Atelier */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-widest" style={{ color: 'var(--theme-primary, #C5A880)' }}>
              {t('atelier')}
            </h4>
            <ul className="space-y-2 opacity-80 font-light">
              <li>
                <Link href="/" className="hover:opacity-100 transition-opacity">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:opacity-100 transition-opacity">
                  Full Catalog
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition-opacity">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between text-xs opacity-70 gap-4"
          style={{ borderColor: 'var(--theme-border-color, rgba(255,255,255,0.15))' }}
        >
          <p>{siteSettings.footerCopyright || '© 2026 Hiwi Fashion. All rights reserved. Addis Ababa, Ethiopia.'}</p>
          <div className="flex items-center space-x-4 opacity-80">
            <Camera className="w-4 h-4 hover:opacity-100 cursor-pointer" />
            <Globe className="w-4 h-4 hover:opacity-100 cursor-pointer" />
            <Share2 className="w-4 h-4 hover:opacity-100 cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
};
