import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '../context/StoreContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TelegramOrderModal } from '../components/TelegramOrderModal';
import { CartDrawer } from '../components/CartDrawer';
import { WishlistDrawer } from '../components/WishlistDrawer';
import { SupabaseSqlModal } from '../components/SupabaseSqlModal';

import { SeoManager } from '../components/SeoManager';

export const metadata: Metadata = {
  title: 'Hiwi Fashion | Authentic Habesha Kemis & Modern Atelier (ETB)',
  description:
    'Handcrafted Habesha Kemis dresses, fine Shemma Netelas, and modern fashion garments. Direct Telegram inbox ordering in Ethiopian Birr (ETB).',
  keywords: 'hiwi fashion, habesha dress, habesha kemis, ethiopian clothing, netela, etb, telegram order, nextjs, supabase',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F9F7F4] text-[#1A1A1A]">
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
      </body>
    </html>
  );
}
