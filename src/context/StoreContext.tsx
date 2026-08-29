'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ColorOption, SiteSettings } from '../types';
import { getSiteSettings, updateSiteSettings, DEFAULT_SITE_SETTINGS } from '../lib/supabase';
import { translations, Language } from '../lib/translations';

interface StoreContextType {
  cart: CartItem[];
  wishlist: Product[];
  telegramUsername: string;
  setTelegramUsername: (username: string) => void;
  siteSettings: SiteSettings;
  updateSiteSettingsState: (settings: Partial<SiteSettings>) => Promise<void>;
  refreshSiteData: () => Promise<void>;
  addToCart: (product: Product, color: ColorOption, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, colorName: string, size: string) => void;
  updateQuantity: (productId: string, colorName: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  // Order Modal state
  telegramModalProduct: Product | null;
  selectedModalColor: ColorOption | null;
  selectedModalSize: string;
  isTelegramModalOpen: boolean;
  openTelegramModal: (product: Product, color?: ColorOption, size?: string) => void;
  closeTelegramModal: () => void;
  // Sql modal
  isSqlModalOpen: boolean;
  setIsSqlModalOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [telegramUsername, setTelegramUsernameState] = useState<string>(process.env.NEXT_PUBLIC_TELEGRAM_USERNAME || '');
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('hiwi_lang', lang);
    } catch (e) {}
  };

  const t = (key: keyof typeof translations.en): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || String(key);
  };

  // Telegram order modal state
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [telegramModalProduct, setTelegramModalProduct] = useState<Product | null>(null);
  const [selectedModalColor, setSelectedModalColor] = useState<ColorOption | null>(null);
  const [selectedModalSize, setSelectedModalSize] = useState<string>('M');

  const refreshSiteData = async () => {
    try {
      const settings = await getSiteSettings();
      setSiteSettings(settings);
      try {
        localStorage.setItem('hiwi_site_settings', JSON.stringify(settings));
      } catch (e) {}
      if (settings.telegramUsername) {
        setTelegramUsernameState(settings.telegramUsername);
      }
    } catch (e) {
      console.error('Site data refresh error:', e);
    }
  };

  // Load site settings & local storage on initial mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const cachedSettings = localStorage.getItem('hiwi_site_settings');
      if (cachedSettings) {
        setSiteSettings(JSON.parse(cachedSettings));
      }
    } catch (e) {}

    refreshSiteData();

    try {
      const savedCart = localStorage.getItem('hiwi_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('hiwi_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedTg = localStorage.getItem('hiwi_tg_username');
      if (savedTg) setTelegramUsernameState(savedTg);

      const savedLang = localStorage.getItem('hiwi_lang') as Language;
      if (savedLang && (savedLang === 'en' || savedLang === 'am')) setLanguageState(savedLang);
    } catch (e) {
      console.error('Error reading localStorage on mount:', e);
    }
  }, []);

  // Dynamically apply Theme CSS custom variables to document root element
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    
    // Core brand & accent theme variables
    if (siteSettings.themePrimaryColor) root.style.setProperty('--theme-primary', siteSettings.themePrimaryColor);
    if (siteSettings.themeSecondaryColor) root.style.setProperty('--theme-secondary', siteSettings.themeSecondaryColor);
    if (siteSettings.themeHeaderBg) root.style.setProperty('--theme-header-bg', siteSettings.themeHeaderBg);
    if (siteSettings.themeHeaderTextColor) root.style.setProperty('--theme-header-text', siteSettings.themeHeaderTextColor);
    if (siteSettings.themeAppBg) root.style.setProperty('--theme-app-bg', siteSettings.themeAppBg);
    
    // Card detail theme variables
    if (siteSettings.themeCardBg) root.style.setProperty('--theme-card-bg', siteSettings.themeCardBg);
    if (siteSettings.themeCardTextColor) root.style.setProperty('--theme-card-text', siteSettings.themeCardTextColor);
    if (siteSettings.themeCardMutedText) root.style.setProperty('--theme-card-muted', siteSettings.themeCardMutedText);
    if (siteSettings.themeCardBorderColor) root.style.setProperty('--theme-card-border', siteSettings.themeCardBorderColor);
    if (siteSettings.themeCardBadgeBg) root.style.setProperty('--theme-card-badge-bg', siteSettings.themeCardBadgeBg);
    if (siteSettings.themeCardButtonBg) root.style.setProperty('--theme-card-button-bg', siteSettings.themeCardButtonBg);
    if (siteSettings.themeCardButtonTextColor) root.style.setProperty('--theme-card-button-text', siteSettings.themeCardButtonTextColor);

    // Global buttons, badges & announcements
    if (siteSettings.themeButtonBg) root.style.setProperty('--theme-button-bg', siteSettings.themeButtonBg);
    if (siteSettings.themeButtonTextColor) root.style.setProperty('--theme-button-text', siteSettings.themeButtonTextColor);
    if (siteSettings.themeBadgeBg) root.style.setProperty('--theme-badge-bg', siteSettings.themeBadgeBg);
    if (siteSettings.themeAnnouncementBg) root.style.setProperty('--theme-announcement-bg', siteSettings.themeAnnouncementBg);
    if (siteSettings.themeAnnouncementTextColor) root.style.setProperty('--theme-announcement-text', siteSettings.themeAnnouncementTextColor);
    if (siteSettings.themeTextPrimary) root.style.setProperty('--theme-text-primary', siteSettings.themeTextPrimary);
    if (siteSettings.themeTextMuted) root.style.setProperty('--theme-text-muted', siteSettings.themeTextMuted);
    if (siteSettings.themeBorderColor) root.style.setProperty('--theme-border-color', siteSettings.themeBorderColor);

    // Sync legacy CSS variables for existing styles
    if (siteSettings.themePrimaryColor) root.style.setProperty('--accent-gold', siteSettings.themePrimaryColor);
    if (siteSettings.themeAppBg) root.style.setProperty('--bg-primary', siteSettings.themeAppBg);
    if (siteSettings.themeCardBg) root.style.setProperty('--bg-card', siteSettings.themeCardBg);
    if (siteSettings.themeTextPrimary) root.style.setProperty('--text-primary', siteSettings.themeTextPrimary);
    if (siteSettings.themeTextMuted) root.style.setProperty('--text-muted', siteSettings.themeTextMuted);
    if (siteSettings.themeBorderColor) root.style.setProperty('--border-color', siteSettings.themeBorderColor);
  }, [siteSettings]);

  // Persist cart to localStorage whenever cart changes after initial mount
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('hiwi_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cart, isMounted]);

  // Persist wishlist to localStorage whenever wishlist changes after initial mount
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('hiwi_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist to localStorage:', e);
    }
  }, [wishlist, isMounted]);

  const setTelegramUsername = (username: string) => {
    const clean = username.replace('@', '').trim();
    setTelegramUsernameState(clean);
    updateSiteSettingsState({ telegramUsername: clean });
    try {
      localStorage.setItem('hiwi_tg_username', clean);
    } catch (e) {}
  };

  const updateSiteSettingsState = async (newSettings: Partial<SiteSettings>) => {
    const merged = { ...siteSettings, ...newSettings };
    setSiteSettings(merged);
    try {
      localStorage.setItem('hiwi_site_settings', JSON.stringify(merged));
    } catch (e) {}
    const res = await updateSiteSettings(merged);
    if (res.data) {
      setSiteSettings(res.data);
      try {
        localStorage.setItem('hiwi_site_settings', JSON.stringify(res.data));
      } catch (e) {}
      if (res.data.telegramUsername) {
        setTelegramUsernameState(res.data.telegramUsername);
      }
    }
  };

  const addToCart = (product: Product, color: ColorOption, size: string, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedColor.name === color.name && item.selectedSize === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, selectedColor: color, selectedSize: size, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, colorName: string, size: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedColor.name === colorName && item.selectedSize === size)
      )
    );
  };

  const updateQuantity = (productId: string, colorName: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, colorName, size);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedColor.name === colorName && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => wishlist.some((p) => p.id === productId);

  const openTelegramModal = (product: Product, color?: ColorOption, size?: string) => {
    setTelegramModalProduct(product);
    setSelectedModalColor(color || product.colors[0] || { name: 'Standard', hex: '#1A1A1A' });
    setSelectedModalSize(size || product.sizes[0] || 'M');
    setIsTelegramModalOpen(true);
  };

  const closeTelegramModal = () => {
    setIsTelegramModalOpen(false);
    setTelegramModalProduct(null);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        telegramUsername,
        setTelegramUsername,
        siteSettings,
        updateSiteSettingsState,
        refreshSiteData,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        language,
        setLanguage,
        t,
        telegramModalProduct,
        selectedModalColor,
        selectedModalSize,
        isTelegramModalOpen,
        openTelegramModal,
        closeTelegramModal,
        isSqlModalOpen,
        setIsSqlModalOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
