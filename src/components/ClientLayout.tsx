'use client';

import React from 'react';
import { StoreProvider } from '../context/StoreContext';
import { Header } from './Header';
import { Footer } from './Footer';
import { TelegramOrderModal } from './TelegramOrderModal';
import { CartDrawer } from './CartDrawer';
import { WishlistDrawer } from './WishlistDrawer';
import { SupabaseSqlModal } from './SupabaseSqlModal';
import { SeoManager } from './SeoManager';

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StoreProvider>
      <SeoManager />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <TelegramOrderModal />
      <CartDrawer />
      <WishlistDrawer />
      <SupabaseSqlModal />
    </StoreProvider>
  );
};
