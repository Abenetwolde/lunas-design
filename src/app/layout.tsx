import type { Metadata } from 'next';
import './globals.css';
import { ClientLayout } from '../components/ClientLayout';

export const metadata: Metadata = {
  title: 'Hiwi Fashion | Authentic Habesha Kemis & Modern Atelier (ETB)',
  description:
    'Handcrafted Habesha Kemis dresses, fine Shemma Netelas, and modern fashion garments. Direct Telegram inbox ordering in Ethiopian Birr (ETB).',
  keywords: 'hiwi fashion, habesha dress, habesha kemis, ethiopian clothing, netela, etb, telegram order, nextjs, supabase',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F9F7F4] text-[#1A1A1A]">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
