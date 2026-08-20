'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Send, Camera, Globe, Share2, Phone, Mail, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const { telegramUsername, siteSettings, setIsSqlModalOpen } = useStore();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-xs">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-[0.2em] uppercase text-white">
                {siteSettings.siteName || 'Hiwi Fashion'}
              </span>
              <span className="block text-[8px] tracking-[0.35em] text-[#C5A880] uppercase">
                {siteSettings.tagline || 'HABESHA & MODERN ATELIER'}
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed font-light max-w-sm">
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
              <span>Direct Telegram Inquiry: @{telegramUsername}</span>
            </a>

            {/* Contact Details */}
            <div className="space-y-1.5 pt-2 text-gray-400 font-light">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>{siteSettings.storeLocation || 'Bole Subcity, Addis Ababa, Ethiopia'}</span>
              </div>
              {siteSettings.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{siteSettings.contactPhone}</span>
                </div>
              )}
              {siteSettings.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>{siteSettings.contactEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 1: Shop */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#C5A880] uppercase tracking-widest">SHOP</h4>
            <ul className="space-y-2 text-gray-400 font-light">
              <li>
                <Link href="/catalog?category=dresses" className="hover:text-white transition-colors">
                  Habesha Kemis & Dresses
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=tops" className="hover:text-white transition-colors">
                  Tops & Blazers
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=accessories" className="hover:text-white transition-colors">
                  Netela & Accessories
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=shoes" className="hover:text-white transition-colors">
                  Handmade Footwear
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Customer Care */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#C5A880] uppercase tracking-widest">CUSTOMER CARE</h4>
            <ul className="space-y-2 text-gray-400 font-light">
              <li>
                <a href={`https://t.me/${telegramUsername}`} className="hover:text-white transition-colors">
                  Telegram Ordering Guide
                </a>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-white transition-colors">
                  Addis Ababa Delivery
                </Link>
              </li>
              <li>
                <button onClick={() => setIsSqlModalOpen(true)} className="hover:text-white transition-colors text-left">
                  Supabase Integration Setup
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Atelier */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#C5A880] uppercase tracking-widest">ATELIER</h4>
            <ul className="space-y-2 text-gray-400 font-light">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-white transition-colors">
                  Full Catalog
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>{siteSettings.footerCopyright || '© 2026 Hiwi Fashion. All rights reserved. Addis Ababa, Ethiopia.'}</p>
          <div className="flex items-center space-x-4 text-gray-400">
            <Camera className="w-4 h-4 hover:text-white cursor-pointer" />
            <Globe className="w-4 h-4 hover:text-white cursor-pointer" />
            <Share2 className="w-4 h-4 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
};
