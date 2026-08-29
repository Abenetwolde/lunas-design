import type { Metadata } from 'next';
import './globals.css';
import { ClientLayout } from '../components/ClientLayout';
import { Analytics } from '@vercel/analytics/next';

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('hiwi_site_settings');
                  var s = saved ? JSON.parse(saved) : {};
                  var d = {
                    themePrimaryColor: '#C5A880',
                    themeSecondaryColor: '#1A1A1A',
                    themeHeaderBg: '#1A1A1A',
                    themeHeaderTextColor: '#FFFFFF',
                    themeAppBg: '#F9F7F4',
                    themeCardBg: '#FFFFFF',
                    themeCardTextColor: '#1A1A1A',
                    themeCardMutedText: '#666059',
                    themeCardBorderColor: '#E7E2DA',
                    themeCardBadgeBg: '#DC2626',
                    themeCardButtonBg: '#1A1A1A',
                    themeCardButtonTextColor: '#FFFFFF',
                    themeButtonBg: '#1A1A1A',
                    themeButtonTextColor: '#FFFFFF',
                    themeBadgeBg: '#DC2626',
                    themeAnnouncementBg: '#1A1A1A',
                    themeAnnouncementTextColor: '#C5A880',
                    themeTextPrimary: '#1A1A1A',
                    themeTextMuted: '#666059',
                    themeBorderColor: '#E7E2DA'
                  };
                  var root = document.documentElement;
                  root.style.setProperty('--theme-primary', s.themePrimaryColor || d.themePrimaryColor);
                  root.style.setProperty('--theme-secondary', s.themeSecondaryColor || d.themeSecondaryColor);
                  root.style.setProperty('--theme-header-bg', s.themeHeaderBg || d.themeHeaderBg);
                  root.style.setProperty('--theme-header-text', s.themeHeaderTextColor || d.themeHeaderTextColor);
                  root.style.setProperty('--theme-app-bg', s.themeAppBg || d.themeAppBg);
                  root.style.setProperty('--theme-card-bg', s.themeCardBg || d.themeCardBg);
                  root.style.setProperty('--theme-card-text', s.themeCardTextColor || d.themeCardTextColor);
                  root.style.setProperty('--theme-card-muted', s.themeCardMutedText || d.themeCardMutedText);
                  root.style.setProperty('--theme-card-border', s.themeCardBorderColor || d.themeCardBorderColor);
                  root.style.setProperty('--theme-card-badge-bg', s.themeCardBadgeBg || d.themeCardBadgeBg);
                  root.style.setProperty('--theme-card-button-bg', s.themeCardButtonBg || d.themeCardButtonBg);
                  root.style.setProperty('--theme-card-button-text', s.themeCardButtonTextColor || d.themeCardButtonTextColor);
                  root.style.setProperty('--theme-button-bg', s.themeButtonBg || d.themeButtonBg);
                  root.style.setProperty('--theme-button-text', s.themeButtonTextColor || d.themeButtonTextColor);
                  root.style.setProperty('--theme-badge-bg', s.themeBadgeBg || d.themeBadgeBg);
                  root.style.setProperty('--theme-announcement-bg', s.themeAnnouncementBg || d.themeAnnouncementBg);
                  root.style.setProperty('--theme-announcement-text', s.themeAnnouncementTextColor || d.themeAnnouncementTextColor);
                  root.style.setProperty('--theme-text-primary', s.themeTextPrimary || d.themeTextPrimary);
                  root.style.setProperty('--theme-text-muted', s.themeTextMuted || d.themeTextMuted);
                  root.style.setProperty('--theme-border-color', s.themeBorderColor || d.themeBorderColor);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col transition-colors duration-300" style={{ backgroundColor: 'var(--theme-app-bg, #F0FDF4)', color: 'var(--theme-text-primary, #064E3B)' }}>
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}
