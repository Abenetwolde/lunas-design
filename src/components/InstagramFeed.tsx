'use client';

import React from 'react';
import { Camera } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const InstagramFeed: React.FC = () => {
  const { siteSettings, t } = useStore();

  const posts = siteSettings.instagramImages && siteSettings.instagramImages.length > 0
    ? siteSettings.instagramImages
    : [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600',
      ];

  const handle = siteSettings.instagramHandle || '@HIWI.FASHION';
  const igUrl = `https://instagram.com/${handle.replace('@', '')}`;

  return (
    <section
      className="py-12 sm:py-16 border-t transition-colors duration-300"
      style={{
        backgroundColor: 'var(--theme-card-bg, #FFFFFF)',
        borderColor: 'var(--theme-border-color, #A7F3D0)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--theme-primary, #10B981)' }}>
              {siteSettings.instagramSubtitle || t('editorialCommunity')}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-light mt-0.5" style={{ color: 'var(--theme-text-primary, #064E3B)' }}>
              {siteSettings.instagramTitle || t('followInstagram')}
            </h3>
          </div>
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors hover:opacity-80"
            style={{ color: 'var(--theme-primary, #10B981)' }}
          >
            <Camera className="w-4 h-4" />
            <span>{handle} →</span>
          </a>
        </div>

        {/* Photos grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {posts.map((src, idx) => (
            <a
              key={idx}
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl overflow-hidden border shadow-xs"
              style={{
                backgroundColor: 'var(--theme-app-bg, #F0FDF4)',
                borderColor: 'var(--theme-border-color, #A7F3D0)',
              }}
            >
              <img
                src={src}
                alt={`${siteSettings.siteName || 'Hiwi Fashion'} post ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-6 h-6" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
