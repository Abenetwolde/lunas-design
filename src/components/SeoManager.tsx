'use client';

import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export const SeoManager: React.FC = () => {
  const { siteSettings } = useStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Dynamic Page Title
    const pageTitle = siteSettings.seoTitle || `${siteSettings.siteName || 'Hiwi Fashion'} | ${siteSettings.tagline || 'Habesha Atelier'}`;
    document.title = pageTitle;

    // Helper to update or create meta tags
    const updateMetaTag = (nameAttr: 'name' | 'property', attrValue: string, content: string) => {
      if (!content) return;
      let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Meta Description & Keywords
    const metaDesc = siteSettings.seoDescription || siteSettings.heroSubtitle || siteSettings.footerAboutText;
    const metaKeywords = siteSettings.seoKeywords || 'habesha kemis, ethiopian fashion, habesha dress, etb fashion, addis ababa';
    const ogImage = siteSettings.seoOgImage || siteSettings.heroImageUrl || '/images/hero.jpg';

    updateMetaTag('name', 'description', metaDesc);
    updateMetaTag('name', 'keywords', metaKeywords);

    // 3. Open Graph Social Metadata
    updateMetaTag('property', 'og:title', pageTitle);
    updateMetaTag('property', 'og:description', metaDesc);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:type', 'website');
    updateMetaTag('property', 'og:site_name', siteSettings.siteName || 'Hiwi Fashion');

    // 4. JSON-LD Google Rich Snippet Structured Data
    let jsonLdScript = document.getElementById('json-ld-store-schema');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'json-ld-store-schema';
      jsonLdScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLdScript);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      name: siteSettings.siteName || 'Hiwi Fashion',
      description: metaDesc,
      image: ogImage,
      telephone: siteSettings.contactPhone || '+251911234567',
      email: siteSettings.contactEmail || 'contact@hiwifashion.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: siteSettings.storeLocation || 'Bole Subcity',
        addressLocality: 'Addis Ababa',
        addressCountry: 'ET',
      },
      priceRange: 'ETB',
    };

    jsonLdScript.textContent = JSON.stringify(schemaData);
  }, [siteSettings]);

  return null;
};
