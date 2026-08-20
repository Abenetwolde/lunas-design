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
      if (settings.telegramUsername) {
        setTelegramUsernameState(settings.telegramUsername);
      }
    } catch (e) {
      console.error('Site data refresh error:', e);
    }
  };

  // Load site settings & local storage
  useEffect(() => {
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
      console.error(e);
    }
  }, []);

  // Sync storage
  useEffect(() => {
    try {
      localStorage.setItem('hiwi_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('hiwi_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  const setTelegramUsername = (username: string) => {
    const clean = username.replace('@', '').trim();
    setTelegramUsernameState(clean);
    updateSiteSettingsState({ telegramUsername: clean });
    try {
      localStorage.setItem('hiwi_tg_username', clean);
    } catch (e) {}
  };

  const updateSiteSettingsState = async (newSettings: Partial<SiteSettings>) => {
    const res = await updateSiteSettings(newSettings);
    if (res.data) {
      setSiteSettings(res.data);
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
