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

  // Scroll direction detection for scroll-up sticky header
  const [showHeader, setShowHeader] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        setShowHeader(true);
        lastScrollY = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > 140) {
        setShowHeader(false); // Hide when scrolling down
      } else if (currentScrollY < lastScrollY) {
        setShowHeader(true); // Reveal when scrolling up
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out ${
          showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        } ${
          isScrolled
            ? 'shadow-2xl backdrop-blur-xl border-b'
            : 'border-b'
        }`}
        style={{
          backgroundColor: 'var(--theme-header-bg, #FFFFFF)',
          borderColor: 'var(--theme-border-color, #E7E2DA)',
          color: 'var(--theme-header-text, #1A1A1A)',
        }}
      >
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile hamburger menu */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 opacity-80 hover:opacity-100 focus:outline-none"
              style={{ color: 'var(--theme-header-text, #1A1A1A)' }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Dynamic Logo: Hiwi Fashion */}
          <div className="flex-1 lg:flex-initial text-center lg:text-left">
            <Link href="/" className="inline-block group">
              <span
                className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.2em] transition-colors uppercase block"
                style={{ color: 'var(--theme-header-text, #1A1A1A)' }}
              >
                {siteSettings.siteName || 'Hiwi Fashion'}
              </span>
              <span
                className="block text-[9px] tracking-[0.35em] font-sans uppercase -mt-1 font-bold"
                style={{ color: 'var(--theme-primary, #10B981)' }}
              >
                {siteSettings.tagline || 'HABESHA & MODERN ATELIER'}
              </span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-bold uppercase tracking-widest transition-colors relative py-1 flex items-center gap-1 opacity-85 hover:opacity-100 ${
                    isActive ? 'border-b-2' : ''
                  }`}
                  style={{
                    color: isActive ? 'var(--theme-primary, #10B981)' : 'var(--theme-header-text, #1A1A1A)',
                    borderColor: 'var(--theme-primary, #10B981)',
                  }}
                >
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Header Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* CONDITIONAL "GO TO ADMIN" BUTTON (Only shown when admin session is active) */}
            {isAdminLoggedIn && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border"
                style={{
                  backgroundColor: 'var(--theme-secondary, #064E3B)',
                  color: 'var(--theme-primary, #10B981)',
                  borderColor: 'var(--theme-primary, #10B981)',
                }}
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
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border"
                style={{
                  backgroundColor: 'var(--theme-card-bg, #FFFFFF)',
                  color: 'var(--theme-text-primary, #064E3B)',
                  borderColor: 'var(--theme-border-color, #A7F3D0)',
                }}
                title="Configure Telegram Seller Handle"
              >
                <Send className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary, #10B981)' }} />
                <span>@{telegramUsername}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showTgConfig && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border p-4 z-50" style={{ borderColor: 'var(--theme-border-color, #A7F3D0)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--theme-text-primary, #064E3B)' }}>
                      <Send className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary, #10B981)' }} /> Telegram Seller Handle
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
                        className="w-full pl-7 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none font-medium"
                        style={{ borderColor: 'var(--theme-border-color, #A7F3D0)' }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 text-xs font-bold rounded-lg transition-colors shadow-xs"
                      style={{
                        backgroundColor: 'var(--theme-button-bg, #064E3B)',
                        color: 'var(--theme-button-text, #FFFFFF)',
                      }}
                    >
                      Save Handle
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Wishlist Icon */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-2.5 rounded-full border transition-all relative shadow-xs flex items-center justify-center hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--theme-card-bg, #FFFFFF)',
                color: '#EF4444',
                borderColor: 'var(--theme-border-color, #A7F3D0)',
              }}
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5 fill-rose-500/20" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 rounded-full transition-all relative shadow-md flex items-center justify-center hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--theme-primary, #10B981)',
                color: '#FFFFFF',
              }}
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-sm">
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
    <div className="h-24 sm:h-28 w-full shrink-0 pointer-events-none" />
  </>
);
};
