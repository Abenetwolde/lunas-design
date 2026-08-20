'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import {
  ShoppingBag,
  Heart,
  Send,
  Menu,
  X,
  Sparkles,
  Database,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();

  // Hide storefront header on admin routes to prevent duplicate headers/logos
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const {
    cart,
    wishlist,
    telegramUsername,
    setTelegramUsername,
    siteSettings,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSqlModalOpen,
    language,
    setLanguage,
    t,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTgConfig, setShowTgConfig] = useState(false);
  const [tempTg, setTempTg] = useState(telegramUsername);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data } = await supabase.auth.getSession();
      const localAuth = typeof window !== 'undefined' ? localStorage.getItem('hiwi_admin_session') : null;
      if (data?.session || localAuth === 'true') {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
      }
    };
    checkAdminStatus();
  }, [pathname]);

  const handleSaveTg = (e: React.FormEvent) => {
    e.preventDefault();
    setTelegramUsername(tempTg);
    setShowTgConfig(false);
  };

  const navLinks = [
    { name: t('navHome'), href: '/' },
    { name: t('navCatalog'), href: '/catalog' },
    { name: t('navDresses'), href: '/catalog?category=dresses' },
    { name: t('navTops'), href: '/catalog?category=tops' },
    { name: t('navNetela'), href: '/catalog?category=accessories' },
    { name: t('navShoes'), href: '/catalog?category=shoes' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7E2DA]">
      {/* Top Dynamic Announcement Bar */}
      <div className="bg-[#1A1A1A] text-[#FAF8F5] text-[11px] font-medium py-2 px-4 tracking-wider uppercase flex items-center justify-between">
        <div className="mx-auto flex items-center gap-6 overflow-hidden whitespace-nowrap text-center">
          <span className="flex items-center gap-1.5 text-[#C5A880]">
            <Sparkles className="w-3 h-3" /> {siteSettings.announcementBar || t('announcementDefault')}
          </span>
          <span className="hidden md:inline text-gray-500">|</span>
          <span className="flex items-center gap-1">
            <Send className="w-3 h-3 text-[#0088cc]" /> {t('announcementSub')} @{telegramUsername}
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile hamburger menu */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-black focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Dynamic Logo: Hiwi Fashion */}
          <div className="flex-1 lg:flex-initial text-center lg:text-left">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.2em] text-[#1A1A1A] group-hover:text-[#C5A880] transition-colors uppercase">
                {siteSettings.siteName || 'Hiwi Fashion'}
              </span>
              <span className="block text-[9px] tracking-[0.35em] text-gray-400 font-sans uppercase -mt-1">
                {siteSettings.tagline || 'HABESHA & MODERN ATELIER'}
              </span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-semibold uppercase tracking-wider transition-colors hover:text-[#C5A880] relative py-1 flex items-center gap-1 ${
                    isActive ? 'text-[#1A1A1A] font-bold border-b-2 border-[#1A1A1A]' : 'text-gray-600'
                  }`}
                >
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Header Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* Language Selector Switcher (🇬🇧 EN / 🇪🇹 AM) */}
            <div className="flex items-center bg-[#FAF8F5] border border-[#E7E2DA] rounded-full p-1 shadow-sm">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                  language === 'en'
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-gray-500 hover:text-black'
                }`}
                title="English"
              >
                🇬🇧 EN
              </button>
              <button
                onClick={() => setLanguage('am')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                  language === 'am'
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-gray-500 hover:text-black'
                }`}
                title="አማርኛ (Amharic)"
              >
                🇪🇹 AM
              </button>
            </div>
            
            {/* CONDITIONAL "GO TO ADMIN" BUTTON (Only shown when admin session is active) */}
            {isAdminLoggedIn && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1A1A] text-[#C5A880] text-xs font-bold hover:bg-[#C5A880] hover:text-black transition-all shadow-sm border border-[#C5A880]/40"
                title="Go to Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('navAdmin')}</span>
              </Link>
            )}

            {/* Telegram Handle Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowTgConfig(!showTgConfig)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0088cc]/10 text-[#0088cc] text-xs font-bold hover:bg-[#0088cc]/20 transition-all border border-[#0088cc]/20"
                title="Configure Telegram Seller Handle"
              >
                <Send className="w-3.5 h-3.5" />
                <span>@{telegramUsername}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showTgConfig && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-[#E7E2DA] p-4 z-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-[#0088cc]" /> Telegram Seller Handle
                    </span>
                    <button onClick={() => setShowTgConfig(false)} className="text-gray-400 hover:text-black">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-3">
                    Orders will be sent directly to this Telegram inbox!
                  </p>
                  <form onSubmit={handleSaveTg} className="space-y-2">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400 text-xs font-bold">@</span>
                      <input
                        type="text"
                        value={tempTg}
                        onChange={(e) => setTempTg(e.target.value)}
                        placeholder={process.env.NEXT_PUBLIC_TELEGRAM_USERNAME}
                        className="w-full pl-7 pr-3 py-1.5 text-xs border border-[#E7E2DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0088cc] font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#0088cc] text-white text-xs font-bold rounded-lg hover:bg-[#0077b3] transition-colors"
                    >
                      Save Handle
                    </button>
                  </form>
                </div>
              )}
            </div>



            {/* Wishlist */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-2 text-gray-700 hover:text-black transition-colors relative"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#1A1A1A] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 rounded-full bg-[#1A1A1A] text-white hover:bg-[#C5A880] transition-colors relative shadow-sm"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0088cc] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
                  {totalCartCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E7E2DA] px-4 pt-4 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          
          {isAdminLoggedIn && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-xl bg-[#1A1A1A] text-[#C5A880] text-xs font-bold uppercase tracking-wider flex items-center justify-between shadow-md"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                <span>Go to Admin Dashboard</span>
              </span>
              <span>→</span>
            </Link>
          )}

          <div className="p-3 bg-[#0088cc]/10 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0088cc]">
              <Send className="w-4 h-4" />
              <span>Seller TG: @{telegramUsername}</span>
            </div>
            <button
              onClick={() => setShowTgConfig(!showTgConfig)}
              className="text-[11px] font-bold underline text-[#0088cc]"
            >
              Change
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-between bg-[#FAF8F5] text-gray-800 hover:bg-gray-100"
              >
                <span>{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
