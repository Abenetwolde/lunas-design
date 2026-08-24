import { createClient } from '@supabase/supabase-js';
import { Product, Category, SubCategory, ProductProperty, PropertyDefinition, PropertyOption, PropertyType, OrderInquiry, SiteSettings, Review } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/mockProducts';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xafspnuqhcpznrihtmvq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true },
});

// Default Site Settings
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'default',
  siteName: 'Hiwi Fashion',
  tagline: 'HABESHA & MODERN ATELIER',
  announcementBar: 'FREE DELIVERY IN ADDIS ABABA OVER ETB 2,500 | AUTHENTIC HABESHA CLOTHING',
  heroHeadline: 'Everyday Habesha Style',
  heroSubtitle: 'Handcrafted Ethiopian Kemis dresses, fine cotton Shemma scarves, and modern tailored silhouettes.',
  heroImageUrl: '/images/hero.jpg',
  heroCtaText: 'SHOP CATALOG',
  telegramUsername: process.env.NEXT_PUBLIC_TELEGRAM_USERNAME || 'abigel2',
  contactPhone: '+251 91 123 4567',
  contactEmail: 'contact@hiwifashion.com',
  storeLocation: 'Bole Subcity, Addis Ababa, Ethiopia',
  footerAboutText: 'Hiwi Fashion offers handcrafted authentic Habesha Kemis, modern Ethiopian evening gowns, Shemma Netela scarves, and artisanal leather fashion.',
  footerCopyright: '© 2026 Hiwi Fashion. All rights reserved. Addis Ababa, Ethiopia.',
  freeShippingThreshold: 2500,

  // SEO Defaults
  seoTitle: 'Hiwi Fashion | Authentic Habesha Kemis & Modern Atelier (ETB)',
  seoDescription: 'Handcrafted Habesha Kemis dresses, fine Shemma Netelas, and modern fashion garments. Direct Telegram inbox ordering in Ethiopian Birr (ETB).',
  seoKeywords: 'hiwi fashion, habesha dress, habesha kemis, ethiopian clothing, netela, etb, telegram order, addis ababa',
  seoOgImage: '/images/hero.jpg',

  // Mini Cards Defaults
  miniCard1Title: 'LOCAL DELIVERY',
  miniCard1Desc: 'Free in Addis Ababa over ETB 2,500',
  miniCard2Title: 'DIRECT INQUIRE & BUY',
  miniCard2Desc: '100% instant inbox order confirmation',
  miniCard3Title: 'FITTING GUARANTEE',
  miniCard3Desc: 'Easy exchange & size customization',
  miniCard4Title: 'CUSTOMER CONCIERGE',
  miniCard4Desc: '24/7 direct seller support in ETB',

  // Promo Banner Defaults
  promoBannerHeadline: 'Crafted for Every Special Moment',
  promoBannerSubtitle: 'From traditional Ethiopian celebrations to casual everyday wear. Handcrafted with organic Ethiopian cotton and woven Netela embroidery.',
  promoBannerImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1600',
  promoBannerCtaText: 'DISCOVER COLLECTION',
  promoBannerCtaLink: '/catalog',

  // Instagram Showcase Defaults
  instagramHandle: '@HIWI.FASHION',
  instagramImages: [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600',
  ],
};

let inMemorySiteSettings: SiteSettings = { ...DEFAULT_SITE_SETTINGS };
let inMemoryProducts: Product[] = [...INITIAL_PRODUCTS];
let inMemoryCategories: Category[] = [...INITIAL_CATEGORIES];
let inMemoryOrders: OrderInquiry[] = [];
let inMemoryReviews: Record<string, Review[]> = {};

/**
 * Fetch dynamic Site Settings from Supabase
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase.from('site_settings').select('*').single();

    if (error || !data) {
      return inMemorySiteSettings;
    }

    const fetched: SiteSettings = {
      id: data.id || 'default',
      siteName: data.site_name || DEFAULT_SITE_SETTINGS.siteName,
      tagline: data.tagline || DEFAULT_SITE_SETTINGS.tagline,
      announcementBar: data.announcement_bar || DEFAULT_SITE_SETTINGS.announcementBar,
      heroHeadline: data.hero_headline || DEFAULT_SITE_SETTINGS.heroHeadline,
      heroSubtitle: data.hero_subtitle || DEFAULT_SITE_SETTINGS.heroSubtitle,
      heroImageUrl: data.hero_image_url || DEFAULT_SITE_SETTINGS.heroImageUrl,
      heroCtaText: data.hero_cta_text || DEFAULT_SITE_SETTINGS.heroCtaText,
      telegramUsername: data.telegram_username || DEFAULT_SITE_SETTINGS.telegramUsername,
      contactPhone: data.contact_phone || DEFAULT_SITE_SETTINGS.contactPhone,
      contactEmail: data.contact_email || DEFAULT_SITE_SETTINGS.contactEmail,
      storeLocation: data.store_location || DEFAULT_SITE_SETTINGS.storeLocation,
      footerAboutText: data.footer_about_text || DEFAULT_SITE_SETTINGS.footerAboutText,
      footerCopyright: data.footer_copyright || DEFAULT_SITE_SETTINGS.footerCopyright,
      freeShippingThreshold: Number(data.free_shipping_threshold || 2500),

      seoTitle: data.seo_title || DEFAULT_SITE_SETTINGS.seoTitle,
      seoDescription: data.seo_description || DEFAULT_SITE_SETTINGS.seoDescription,
      seoKeywords: data.seo_keywords || DEFAULT_SITE_SETTINGS.seoKeywords,
      seoOgImage: data.seo_og_image || DEFAULT_SITE_SETTINGS.seoOgImage,

      miniCard1Title: data.mini_card1_title || DEFAULT_SITE_SETTINGS.miniCard1Title,
      miniCard1Desc: data.mini_card1_desc || DEFAULT_SITE_SETTINGS.miniCard1Desc,
      miniCard2Title: data.mini_card2_title || DEFAULT_SITE_SETTINGS.miniCard2Title,
      miniCard2Desc: data.mini_card2_desc || DEFAULT_SITE_SETTINGS.miniCard2Desc,
      miniCard3Title: data.mini_card3_title || DEFAULT_SITE_SETTINGS.miniCard3Title,
      miniCard3Desc: data.mini_card3_desc || DEFAULT_SITE_SETTINGS.miniCard3Desc,
      miniCard4Title: data.mini_card4_title || DEFAULT_SITE_SETTINGS.miniCard4Title,
      miniCard4Desc: data.mini_card4_desc || DEFAULT_SITE_SETTINGS.miniCard4Desc,

      promoBannerHeadline: data.promo_banner_headline || DEFAULT_SITE_SETTINGS.promoBannerHeadline,
      promoBannerSubtitle: data.promo_banner_subtitle || DEFAULT_SITE_SETTINGS.promoBannerSubtitle,
      promoBannerImage: data.promo_banner_image || DEFAULT_SITE_SETTINGS.promoBannerImage,
      promoBannerCtaText: data.promo_banner_cta_text || DEFAULT_SITE_SETTINGS.promoBannerCtaText,
      promoBannerCtaLink: data.promo_banner_cta_link || DEFAULT_SITE_SETTINGS.promoBannerCtaLink,

      instagramHandle: data.instagram_handle || DEFAULT_SITE_SETTINGS.instagramHandle,
      instagramImages: data.instagram_images || DEFAULT_SITE_SETTINGS.instagramImages,
    };

    inMemorySiteSettings = fetched;
    return fetched;
  } catch (err) {
    return inMemorySiteSettings;
  }
}

/**
 * Update Site Settings in Supabase
 */
export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; data?: SiteSettings; error?: string }> {
  const updated: SiteSettings = {
    ...inMemorySiteSettings,
    ...settings,
  };

  try {
    const payload: any = {
      id: 'default',
      site_name: updated.siteName,
      tagline: updated.tagline,
      announcement_bar: updated.announcementBar,
      hero_headline: updated.heroHeadline,
      hero_subtitle: updated.heroSubtitle,
      hero_image_url: updated.heroImageUrl,
      hero_cta_text: updated.heroCtaText,
      telegram_username: updated.telegramUsername,
      contact_phone: updated.contactPhone,
      contact_email: updated.contactEmail,
      store_location: updated.storeLocation,
      footer_about_text: updated.footerAboutText,
      footer_copyright: updated.footerCopyright,
      free_shipping_threshold: updated.freeShippingThreshold,
      updated_at: new Date().toISOString(),
    };

    if (updated.seoTitle !== undefined) payload.seo_title = updated.seoTitle;
    if (updated.seoDescription !== undefined) payload.seo_description = updated.seoDescription;
    if (updated.seoKeywords !== undefined) payload.seo_keywords = updated.seoKeywords;
    if (updated.seoOgImage !== undefined) payload.seo_og_image = updated.seoOgImage;

    if (updated.miniCard1Title !== undefined) payload.mini_card1_title = updated.miniCard1Title;
    if (updated.miniCard1Desc !== undefined) payload.mini_card1_desc = updated.miniCard1Desc;
    if (updated.miniCard2Title !== undefined) payload.mini_card2_title = updated.miniCard2Title;
    if (updated.miniCard2Desc !== undefined) payload.mini_card2_desc = updated.miniCard2Desc;
    if (updated.miniCard3Title !== undefined) payload.mini_card3_title = updated.miniCard3Title;
    if (updated.miniCard3Desc !== undefined) payload.mini_card3_desc = updated.miniCard3Desc;
    if (updated.miniCard4Title !== undefined) payload.mini_card4_title = updated.miniCard4Title;
    if (updated.miniCard4Desc !== undefined) payload.mini_card4_desc = updated.miniCard4Desc;

    if (updated.promoBannerHeadline !== undefined) payload.promo_banner_headline = updated.promoBannerHeadline;
    if (updated.promoBannerSubtitle !== undefined) payload.promo_banner_subtitle = updated.promoBannerSubtitle;
    if (updated.promoBannerImage !== undefined) payload.promo_banner_image = updated.promoBannerImage;
    if (updated.promoBannerCtaText !== undefined) payload.promo_banner_cta_text = updated.promoBannerCtaText;
    if (updated.promoBannerCtaLink !== undefined) payload.promo_banner_cta_link = updated.promoBannerCtaLink;

    if (updated.instagramHandle !== undefined) payload.instagram_handle = updated.instagramHandle;
    if (updated.instagramImages !== undefined) payload.instagram_images = updated.instagramImages;

    let attempts = 0;
    while (attempts < 30) {
      let { error } = await supabase.from('site_settings').upsert([payload]);
      if (!error) break;

      if (error && (error.code === 'PGRST204' || error.message.includes('Could not find') || error.message.includes('column'))) {
        console.warn(`PGRST204 attempt ${attempts + 1} for site_settings:`, error.message);
        const match = error.message.match(/Could not find the '([^']+)' column/i) || error.message.match(/Could not find the "([^"]+)" column/i);
        if (match && match[1]) {
          delete payload[match[1]];
        } else {
          // Delete all extended fields as safety fallback
          delete payload.contact_email;
          delete payload.contact_phone;
          delete payload.store_location;
          delete payload.seo_title;
          delete payload.seo_description;
          delete payload.seo_keywords;
          delete payload.seo_og_image;
          delete payload.mini_card1_title;
          delete payload.mini_card1_desc;
          delete payload.mini_card2_title;
          delete payload.mini_card2_desc;
          delete payload.mini_card3_title;
          delete payload.mini_card3_desc;
          delete payload.mini_card4_title;
          delete payload.mini_card4_desc;
          delete payload.promo_banner_headline;
          delete payload.promo_banner_subtitle;
          delete payload.promo_banner_image;
          delete payload.promo_banner_cta_text;
          delete payload.promo_banner_cta_link;
          delete payload.instagram_handle;
          delete payload.instagram_images;
        }
        attempts++;
      } else {
        console.warn('Non-PGRST204 site_settings update warning:', error);
        break;
      }
    }
  } catch (err) {}

  inMemorySiteSettings = updated;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hiwi_site_settings', JSON.stringify(updated));
    }
  } catch (e) {}
  return { success: true, data: updated };
}

/**
 * Fetch all products from Supabase database; fallback to inMemory
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return inMemoryProducts;
    }

    const fetched = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      category: item.category,
      price: Number(item.price),
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      rating: Number(item.rating) || 0,
      reviewsCount: Number(item.reviews_count || 0),
      isNew: Boolean(item.is_new),
      isSale: Boolean(item.is_sale),
      inStock: item.in_stock !== undefined ? Boolean(item.in_stock) : true,
      badgeText: item.badge_text || (item.is_sale ? 'SPECIAL OFFER' : item.is_new ? 'NEW ARRIVAL' : undefined),
      image: item.image,
      secondaryImage: item.secondary_image,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image, item.secondary_image].filter(Boolean),
      description: item.description,
      sizes: Array.isArray(item.sizes) ? item.sizes : ['XS', 'S', 'M', 'L', 'XL'],
      colors: Array.isArray(item.colors) ? item.colors : [{ name: 'Default', hex: '#1A1A1A' }],
      material: item.material || 'Ethiopian Cotton',
      subcategory: item.subcategory || undefined,
      occasion: item.occasion || 'Casual',
      fabricCare: item.fabric_care || 'Hand wash cold or dry clean recommended.',
      deliveryInfo: item.delivery_info || 'Fast delivery available in Addis Ababa within 24-48 hours.',
      stockQuantity: item.stock_quantity !== undefined ? item.stock_quantity : 15,
      attributes: item.attributes || undefined,
      created_at: item.created_at,
    }));

    // --- REAL RATING OVERLAY ---
    // Ratings & review counts must reflect actual customer reviews from the
    // database — never seeded/mock values stored on the product row.
    // Single lightweight batched query, aggregated per product client-side.
    try {
      const { data: revRows, error: revError } = await supabase
        .from('reviews')
        .select('product_id, rating');

      if (!revError && revRows) {
        const agg: Record<string, { sum: number; count: number }> = {};
        for (const row of revRows as any[]) {
          const pid = String(row.product_id);
          if (!agg[pid]) agg[pid] = { sum: 0, count: 0 };
          agg[pid].sum += Number(row.rating) || 0;
          agg[pid].count += 1;
        }

        for (const product of fetched) {
          const stats = agg[String(product.id)];
          if (stats && stats.count > 0) {
            product.rating = Math.round((stats.sum / stats.count) * 10) / 10;
            product.reviewsCount = stats.count;
          } else {
            // No real reviews -> zeroed out (UI hides stars), never fake values
            product.rating = 0;
            product.reviewsCount = 0;
          }
        }
      }
    } catch (revErr) {}

    // --- REAL ATTRIBUTE VALUES OVERLAY (DYNAMIC EAV) ---
    // Attach persisted attribute values from product_attribute_values so the
    // storefront filters operate on real data, never hardcoded defaults.
    try {
      const [pavRes, defs] = await Promise.all([
        supabase.from('product_attribute_values').select('product_id, attribute_id, option_id, value_text'),
        getPropertyDefinitions(),
      ]);

      if (!pavRes.error && Array.isArray(pavRes.data)) {
        const defsById: Record<string, PropertyDefinition> = {};
        const optionValueById: Record<string, string> = {};
        defs.forEach((d) => {
          defsById[String(d.id)] = d;
          (d.options || []).forEach((o) => {
            optionValueById[String(o.id)] = String(o.value ?? o.name);
          });
        });

        const valsByProduct: Record<string, Record<string, any>> = {};
        for (const r of pavRes.data as any[]) {
          const pid = String(r.product_id);
          const def = defsById[String(r.attribute_id)];
          if (!def) continue;

          let value: any = r.value_text ?? '';
          if (r.option_id && optionValueById[String(r.option_id)] !== undefined) {
            value = optionValueById[String(r.option_id)];
          }

          if (!valsByProduct[pid]) valsByProduct[pid] = {};
          if (def.type === 'multi_select') {
            const arr: string[] = Array.isArray(valsByProduct[pid][def.slug]) ? valsByProduct[pid][def.slug] : [];
            if (!arr.includes(String(value))) arr.push(String(value));
            valsByProduct[pid][def.slug] = arr;
          } else if (def.type === 'number' || def.type === 'range') {
            valsByProduct[pid][def.slug] = Number(value);
          } else if (def.type === 'boolean') {
            valsByProduct[pid][def.slug] = value === true || value === 'true';
          } else {
            valsByProduct[pid][def.slug] = value;
          }
        }

        for (const product of fetched) {
          const eavVals = valsByProduct[String(product.id)];
          if (eavVals && Object.keys(eavVals).length > 0) {
            product.attributes = eavVals;
          }
        }
      }
    } catch (attrErr) {}

    inMemoryProducts = fetched;
    return fetched;
  } catch (err) {
    return inMemoryProducts;
  }
}

/**
 * Fetch single product by slug or ID
 */
export async function getProductBySlug(slugOrId: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slugOrId || p.id === slugOrId);
}

/**
 * Create a new product in Supabase
 */
export async function createProduct(productData: Partial<Product>): Promise<{ success: boolean; data?: Product; error?: string }> {
  const slug = (productData.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const id = `p-${Date.now()}`;
  
  const newProduct: Product = {
    id,
    name: productData.name || 'New Habesha Item',
    slug: productData.slug || slug,
    category: productData.category || 'dresses',
    price: Number(productData.price || 2500),
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
    rating: productData.rating !== undefined ? Number(productData.rating) : 0,
    reviewsCount: productData.reviewsCount !== undefined ? Number(productData.reviewsCount) : 0,
    isNew: productData.isNew !== undefined ? productData.isNew : true,
    isSale: productData.isSale || false,
    inStock: productData.inStock !== undefined ? productData.inStock : true,
    badgeText: productData.badgeText,
    image: productData.image || '/images/hero.jpg',
    secondaryImage: productData.secondaryImage,
    images: productData.images || [productData.image || '/images/hero.jpg'],
    description: productData.description || 'Authentic Ethiopian fashion garment.',
    sizes: productData.sizes || ['XS', 'S', 'M', 'L', 'XL'],
    colors: productData.colors || [{ name: 'White', hex: '#FFFFFF' }],
    material: productData.material || 'Cotton',
    occasion: productData.occasion || 'Casual',
    fabricCare: productData.fabricCare,
    deliveryInfo: productData.deliveryInfo,
    stockQuantity: productData.stockQuantity !== undefined ? productData.stockQuantity : 10,
  };

  try {
    const payload: any = {
      name: newProduct.name,
      slug: newProduct.slug,
      category: newProduct.category,
      price: newProduct.price,
      rating: newProduct.rating,
      reviews_count: newProduct.reviewsCount,
      is_new: newProduct.isNew,
      is_sale: newProduct.isSale,
      image: newProduct.image,
      description: newProduct.description,
    };

    if (newProduct.originalPrice !== undefined) payload.original_price = newProduct.originalPrice;
    if (newProduct.inStock !== undefined) payload.in_stock = newProduct.inStock;
    if (newProduct.badgeText) payload.badge_text = newProduct.badgeText;
    if (newProduct.secondaryImage) payload.secondary_image = newProduct.secondaryImage;
    if (newProduct.images) payload.images = newProduct.images;
    if (newProduct.sizes) payload.sizes = newProduct.sizes;
    if (newProduct.colors) payload.colors = newProduct.colors;
    if (newProduct.material) payload.material = newProduct.material;
    if (newProduct.subcategory) payload.subcategory = newProduct.subcategory;
    if (newProduct.occasion) payload.occasion = newProduct.occasion;
    if (newProduct.fabricCare) payload.fabric_care = newProduct.fabricCare;
    if (newProduct.deliveryInfo) payload.delivery_info = newProduct.deliveryInfo;
    if (newProduct.stockQuantity) payload.stock_quantity = newProduct.stockQuantity;

    let attempts = 0;
    while (attempts < 5) {
      let { error } = await supabase.from('products').insert([payload]).select();
      if (!error) break;

      if (error && (error.code === 'PGRST204' || error.message.includes('Could not find') || error.message.includes('column'))) {
        console.warn(`PGRST204 attempt ${attempts + 1} for createProduct stripping missing columns:`, error.message);
        const match = error.message.match(/Could not find the '([^']+)' column/i) || error.message.match(/Could not find the "([^"]+)" column/i);
        if (match && match[1]) {
          delete payload[match[1]];
        }
        delete payload.delivery_info;
        delete payload.fabric_care;
        delete payload.material;
        delete payload.occasion;
        delete payload.badge_text;
        delete payload.in_stock;
        delete payload.original_price;
        delete payload.stock_quantity;
        delete payload.secondary_image;
        delete payload.images;
        delete payload.sizes;
        delete payload.colors;
        attempts++;
      } else {
        console.warn('Non-PGRST204 insert warning:', error);
        break;
      }
    }
  } catch (err: any) {
    console.warn('Supabase createProduct caught exception:', err);
  }

  // Persist dynamic EAV attribute selections into product_attribute_values
  if (productData.attributes && Object.keys(productData.attributes).length > 0) {
    newProduct.attributes = productData.attributes;
    await saveProductAttributeValues(id, productData.attributes);
  }

  inMemoryProducts.unshift(newProduct);
  return { success: true, data: newProduct };
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, productData: Partial<Product>): Promise<{ success: boolean; data?: Product }> {
  // Persist dynamic EAV attribute selections alongside the product row update
  if (productData.attributes !== undefined) {
    await saveProductAttributeValues(id, productData.attributes);
  }
  try {
    const updatePayload: any = {};
    if (productData.name !== undefined) updatePayload.name = productData.name;
    if (productData.category !== undefined) updatePayload.category = productData.category;
    if (productData.price !== undefined) updatePayload.price = productData.price;
    if (productData.originalPrice !== undefined) updatePayload.original_price = productData.originalPrice;
    if (productData.description !== undefined) updatePayload.description = productData.description;
    if (productData.badgeText !== undefined) updatePayload.badge_text = productData.badgeText;
    if (productData.image !== undefined) updatePayload.image = productData.image;
    if (productData.secondaryImage !== undefined) updatePayload.secondary_image = productData.secondaryImage;
    if (productData.images !== undefined) updatePayload.images = productData.images;
    if (productData.sizes !== undefined) updatePayload.sizes = productData.sizes;
    if (productData.colors !== undefined) updatePayload.colors = productData.colors;
    if (productData.material !== undefined) updatePayload.material = productData.material;
    if (productData.subcategory !== undefined) updatePayload.subcategory = productData.subcategory;
    if (productData.occasion !== undefined) updatePayload.occasion = productData.occasion;
    if (productData.fabricCare !== undefined) updatePayload.fabric_care = productData.fabricCare;
    if (productData.deliveryInfo !== undefined) updatePayload.delivery_info = productData.deliveryInfo;
    if (productData.isNew !== undefined) updatePayload.is_new = productData.isNew;
    if (productData.isSale !== undefined) updatePayload.is_sale = productData.isSale;
    if (productData.inStock !== undefined) updatePayload.in_stock = productData.inStock;
    if (productData.stockQuantity !== undefined) updatePayload.stock_quantity = productData.stockQuantity;

    let attempts = 0;
    while (attempts < 5) {
      let { error } = await supabase.from('products').update(updatePayload).eq('id', id);
      if (!error) break;

      if (error && (error.code === 'PGRST204' || error.message.includes('Could not find') || error.message.includes('column'))) {
        console.warn(`PGRST204 attempt ${attempts + 1} for updateProduct stripping missing columns:`, error.message);
        const match = error.message.match(/Could not find the '([^']+)' column/i) || error.message.match(/Could not find the "([^"]+)" column/i);
        if (match && match[1]) {
          delete updatePayload[match[1]];
        }
        delete updatePayload.delivery_info;
        delete updatePayload.fabric_care;
        delete updatePayload.material;
        delete updatePayload.occasion;
        delete updatePayload.badge_text;
        delete updatePayload.in_stock;
        delete updatePayload.original_price;
        delete updatePayload.stock_quantity;
        delete updatePayload.secondary_image;
        delete updatePayload.images;
        delete updatePayload.sizes;
        delete updatePayload.colors;
        attempts++;
      } else {
        console.warn('Non-PGRST204 update warning:', error);
        break;
      }
    }
  } catch (err) {
    console.warn('Supabase updateProduct caught exception:', err);
  }

  inMemoryProducts = inMemoryProducts.map((p) => (p.id === id ? { ...p, ...productData } : p));
  const updated = inMemoryProducts.find((p) => p.id === id);
  return { success: true, data: updated };
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<{ success: boolean }> {
  try {
    await supabase.from('products').delete().eq('id', id);
  } catch (err) {}
  
  inMemoryProducts = inMemoryProducts.filter((p) => p.id !== id);
  return { success: true };
}

/**
 * Fetch reviews for a specific product
 */
export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const fetched: Review[] = data.map((r: any) => ({
        id: String(r.id),
        productId: r.product_id,
        authorName: r.author_name,
        rating: Number(r.rating),
        comment: r.comment,
        createdAt: r.created_at,
      }));

      // Defensive dedupe by id so a review can never appear twice
      const seenIds = new Set<string>();
      const unique = fetched.filter((r) => (seenIds.has(r.id) ? false : (seenIds.add(r.id), true)));

      inMemoryReviews[productId] = unique;
      return unique;
    }
  } catch (err) {}

  // Real-time reviews from database/in-memory (no static fallback)
  if (!inMemoryReviews[productId]) {
    inMemoryReviews[productId] = [];
  }
  return inMemoryReviews[productId];
}

/**
 * Add a review for a product
 */
export async function addReview(
  productId: string,
  authorName: string,
  rating: number,
  comment: string
): Promise<{ success: boolean; review?: Review }> {
  const finalAuthor = (authorName || '').trim() || 'Anonymous Customer';
  const finalComment = (comment || '').trim();

  // --- IDEMPOTENCY GUARD ---
  // If this exact review (same product + author + comment) was already saved
  // moments ago, treat it as an accidental double-submit and reuse that row
  // instead of inserting a duplicate into the database.
  try {
    const { data: existing } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('author_name', finalAuthor)
      .eq('comment', finalComment)
      .order('created_at', { ascending: false })
      .limit(1);

    const duplicateWindowMs = 60 * 1000; // 1 minute
    const dup = (existing || []).find((r: any) => {
      const createdMs = r.created_at ? new Date(r.created_at).getTime() : 0;
      return createdMs > 0 && Date.now() - createdMs < duplicateWindowMs;
    });

    if (dup) {
      const existingReview: Review = {
        id: String(dup.id),
        productId,
        authorName: dup.author_name,
        rating: Number(dup.rating),
        comment: dup.comment,
        createdAt: dup.created_at,
      };
      if (!inMemoryReviews[productId]) inMemoryReviews[productId] = [];
      inMemoryReviews[productId] = [
        existingReview,
        ...inMemoryReviews[productId].filter((r) => r.id !== existingReview.id),
      ];
      return { success: true, review: existingReview };
    }
  } catch (err) {}

  // --- INSERT & RETURN THE CANONICAL DATABASE ROW ---
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          product_id: productId,
          author_name: finalAuthor,
          rating,
          comment: finalComment,
        },
      ])
      .select('*')
      .single();

    if (!error && data) {
      const dbReview: Review = {
        id: String(data.id),
        productId,
        authorName: data.author_name,
        rating: Number(data.rating),
        comment: data.comment,
        createdAt: data.created_at,
      };

      if (!inMemoryReviews[productId]) inMemoryReviews[productId] = [];
      inMemoryReviews[productId] = [
        dbReview,
        ...inMemoryReviews[productId].filter(
          (r) => r.id !== dbReview.id && !(r.authorName === dbReview.authorName && r.comment === dbReview.comment)
        ),
      ];

      // Recalculate and persist the real average rating to the products table
      const allRevs = inMemoryReviews[productId];
      const avgRating = allRevs.reduce((acc, r) => acc + Number(r.rating || 0), 0) / allRevs.length;
      await updateProduct(productId, { rating: avgRating, reviewsCount: allRevs.length });

      return { success: true, review: dbReview };
    }
  } catch (err) {}

  // --- FALLBACK (Supabase unreachable): keep a local-only copy ---
  const localReview: Review = {
    id: `rev-${Date.now()}`,
    productId,
    authorName: finalAuthor,
    rating,
    comment: finalComment,
    createdAt: new Date().toISOString(),
  };

  if (!inMemoryReviews[productId]) inMemoryReviews[productId] = [];
  inMemoryReviews[productId] = [
    localReview,
    ...inMemoryReviews[productId].filter((r) => r.id !== localReview.id),
  ];

  const allRevs = inMemoryReviews[productId];
  const avgRating = allRevs.reduce((acc, r) => acc + Number(r.rating || 0), 0) / allRevs.length;
  await updateProduct(productId, { rating: avgRating, reviewsCount: allRevs.length });

  return { success: true, review: localReview };
}

/**
 * Category Helper: Match product category against slug or name
 */
export function isProductInCategory(pCategory: string, catSlug: string, catName?: string): boolean {
  if (!pCategory || !catSlug) return false;
  const pCat = pCategory.toLowerCase().trim();
  const cSlug = catSlug.toLowerCase().trim();
  const cName = catName ? catName.toLowerCase().trim() : cSlug;

  if (pCat === cSlug || pCat === cName) return true;

  const normP = pCat.replace(/s$/, '');
  const normS = cSlug.replace(/s$/, '');
  const normN = cName.replace(/s$/, '');

  if (normP === normS || normP === normN) return true;
  if (normS.length >= 3 && normP.includes(normS)) return true;
  if (normP.length >= 3 && normS.includes(normP)) return true;
  return false;
}

/**
 * Fetch categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const products = await getProducts();
    const { data, error } = await supabase.from('categories').select('*');

    if (error || !data || data.length === 0) {
      return inMemoryCategories.map((cat) => ({
        ...cat,
        itemCount: products.filter((p) => isProductInCategory(p.category, cat.slug, cat.name)).length,
      }));
    }

    const fetched = data.map((item: any) => {
      let subcats: string[] = [];
      if (Array.isArray(item.subcategories)) {
        subcats = item.subcategories;
      } else if (typeof item.subcategories === 'string' && item.subcategories.trim()) {
        subcats = item.subcategories.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      const realItemCount = products.filter((p) => isProductInCategory(p.category, item.slug, item.name)).length;

      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        image: item.image,
        description: item.description || '',
        itemCount: realItemCount,
        subcategories: subcats.length > 0 ? subcats : undefined,
      };
    });

    inMemoryCategories = fetched;
    return fetched;
  } catch (err) {
    return inMemoryCategories;
  }
}

/**
 * Create Category
 */
export async function createCategory(cat: Partial<Category>): Promise<{ success: boolean }> {
  const slug = cat.slug || (cat.name || 'cat').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: cat.name || 'New Category',
    slug,
    image: cat.image || '/images/hero.jpg',
    description: cat.description || '',
    itemCount: 0,
    subcategories: cat.subcategories || [],
  };

  try {
    let payload: any = {
      name: newCat.name,
      slug: newCat.slug,
      image: newCat.image,
      description: newCat.description,
      subcategories: newCat.subcategories,
    };
    let { error } = await supabase.from('categories').insert([payload]);
    if (error && (error.code === 'PGRST204' || error.message.includes('subcategories'))) {
      delete payload.subcategories;
      await supabase.from('categories').insert([payload]);
    }
  } catch (err) {}

  inMemoryCategories.push(newCat);
  return { success: true };
}

/**
 * Update Category
 */
export async function updateCategory(id: string, catData: Partial<Category>): Promise<{ success: boolean }> {
  try {
    let payload: any = {
      name: catData.name,
      slug: catData.slug,
      image: catData.image,
      description: catData.description,
      subcategories: catData.subcategories,
    };
    let { error } = await supabase.from('categories').update(payload).eq('id', id);
    if (error && (error.code === 'PGRST204' || error.message.includes('subcategories'))) {
      delete payload.subcategories;
      await supabase.from('categories').update(payload).eq('id', id);
    }
  } catch (err) {}

  inMemoryCategories = inMemoryCategories.map((c) => (c.id === id ? { ...c, ...catData } : c));
  return { success: true };
}

/**
 * Delete Category
 */
export async function deleteCategory(id: string): Promise<{ success: boolean }> {
  try {
    await supabase.from('categories').delete().eq('id', id);
  } catch (err) {}

  inMemoryCategories = inMemoryCategories.filter((c) => c.id !== id);
  return { success: true };
}

export let inMemorySubcategories: SubCategory[] = [
  { id: 'sub-1', name: 'Traditional Habesha Kemis', slug: 'traditional-habesha-kemis', categorySlug: 'dresses', description: 'Authentic handwoven ceremonial dresses with Tibet border', badgeColor: '#C5A880' },
  { id: 'sub-2', name: 'Modern Habesha Gown', slug: 'modern-habesha-gown', categorySlug: 'dresses', description: 'Contemporary tailored evening gowns with Ethiopian motifs', badgeColor: '#1A1A1A' },
  { id: 'sub-3', name: 'Bridal & Wedding', slug: 'bridal-wedding', categorySlug: 'dresses', description: 'Luxury bridal Kemis with gold thread embroidery', badgeColor: '#D4AF37' },
  { id: 'sub-4', name: 'Linen Wrap', slug: 'linen-wrap', categorySlug: 'dresses', description: 'Lightweight summer wrap dresses', badgeColor: '#1B4D3E' },
  { id: 'sub-5', name: 'Short Tunics', slug: 'short-tunics', categorySlug: 'dresses', description: 'Short modern Habesha tunics', badgeColor: '#800020' },

  { id: 'sub-6', name: 'Netela & Shawls', slug: 'netela-shawls', categorySlug: 'accessories', description: 'Handwoven pure cotton scarves and shawls', badgeColor: '#FAF8F5' },
  { id: 'sub-7', name: 'Silver & Gold Jewelry', slug: 'silver-gold-jewelry', categorySlug: 'accessories', description: 'Traditional Ethiopian cross necklaces and rings', badgeColor: '#D4AF37' },
  { id: 'sub-8', name: 'Woven Bags', slug: 'woven-bags', categorySlug: 'accessories', description: 'Handcrafted leather and woven straw handbags', badgeColor: '#C5A880' },
  { id: 'sub-9', name: 'Hair Accessories', slug: 'hair-accessories', categorySlug: 'accessories', description: 'Traditional headwraps and hair pins', badgeColor: '#1A1A1A' },

  { id: 'sub-10', name: 'Leather Sandals', slug: 'leather-sandals', categorySlug: 'shoes', description: 'Genuine leather handmade sandals', badgeColor: '#1A1A1A' },
  { id: 'sub-11', name: 'Handcrafted Heels', slug: 'handcrafted-heels', categorySlug: 'shoes', description: 'Elegant evening heels with Ethiopian accents', badgeColor: '#C5A880' },
  { id: 'sub-12', name: 'Embroidery Flats', slug: 'embroidery-flats', categorySlug: 'shoes', description: 'Comfortable flat shoes with woven embroidery', badgeColor: '#1B4D3E' },
  { id: 'sub-13', name: 'Casual Slip-ons', slug: 'casual-slip-ons', categorySlug: 'shoes', description: 'Daily casual slip-on shoes', badgeColor: '#800020' },

  { id: 'sub-14', name: 'Traditional Shirts', slug: 'traditional-shirts', categorySlug: 'tops', description: 'Handwoven cotton men and women shirts', badgeColor: '#FAF8F5' },
  { id: 'sub-15', name: 'Embroidered Blouses', slug: 'embroidered-blouses', categorySlug: 'tops', description: 'Fine embroidered tops for daily wear', badgeColor: '#C5A880' },
  { id: 'sub-16', name: 'Habesha Vests', slug: 'habesha-vests', categorySlug: 'tops', description: 'Layering vests with Ethiopian patterns', badgeColor: '#1A1A1A' },
  { id: 'sub-17', name: 'Casual Tunics', slug: 'casual-tunics', categorySlug: 'tops', description: 'Comfortable everyday tunic tops', badgeColor: '#002366' },
];

/**
 * Fetch subcategories with dynamic product counts
 */
export async function getSubcategories(): Promise<SubCategory[]> {
  try {
    const products = await getProducts();
    const { data, error } = await supabase.from('subcategories').select('*');

    let baseList = inMemorySubcategories;
    if (!error && data && data.length > 0) {
      baseList = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        categorySlug: item.category_slug || item.categorySlug || 'dresses',
        parentSlug: item.parent_slug || undefined,
        description: item.description || '',
        badgeColor: item.badge_color || item.badgeColor || '#C5A880',
      }));
    }

    const fetched = baseList.map((sub) => {
      const liveCount = products.filter((p) => {
        const pSub = (p.subcategory || '').toLowerCase();
        const pDesc = p.description.toLowerCase();
        const pName = p.name.toLowerCase();
        const s = sub.name.toLowerCase();
        return pSub.includes(s) || s.includes(pSub) || pDesc.includes(s) || pName.includes(s);
      }).length;

      return {
        ...sub,
        itemCount: liveCount,
      };
    });

    inMemorySubcategories = fetched;
    return fetched;
  } catch (err) {
    return inMemorySubcategories;
  }
}

/**
 * Create SubCategory
 */
export async function createSubcategory(sub: Partial<SubCategory>): Promise<{ success: boolean; data?: SubCategory }> {
  const slug = sub.slug || (sub.name || 'subcat').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newSub: SubCategory = {
    id: `sub-${Date.now()}`,
    name: sub.name || 'New Style Filter',
    slug,
    categorySlug: sub.categorySlug || 'dresses',
    parentSlug: sub.parentSlug || undefined,
    description: sub.description || '',
    badgeColor: sub.badgeColor || '#C5A880',
    itemCount: 0,
  };

  try {
    const payload: any = {
      name: newSub.name,
      slug: newSub.slug,
      category_slug: newSub.categorySlug,
      description: newSub.description,
      badge_color: newSub.badgeColor,
    };
    if (newSub.parentSlug) payload.parent_slug = newSub.parentSlug;
    let { error } = await supabase.from('subcategories').insert([payload]);
    if (error && error.code === 'PGRST204') {
      console.warn('Subcategories table missing in Supabase, using in-memory mode:', error.message);
    }
  } catch (err) {}

  inMemorySubcategories.unshift(newSub);

  // Sync to parent category's subcategories array
  try {
    const cats = await getCategories();
    const parentCat = cats.find(c => c.slug === newSub.categorySlug || c.name.toLowerCase() === newSub.categorySlug.toLowerCase());
    if (parentCat) {
      const existingSubs = parentCat.subcategories || [];
      if (!existingSubs.includes(newSub.name)) {
        await updateCategory(parentCat.id, { subcategories: [...existingSubs, newSub.name] });
      }
    }
  } catch (e) {}

  return { success: true, data: newSub };
}

/**
 * Update SubCategory
 */
export async function updateSubcategory(id: string, subData: Partial<SubCategory>): Promise<{ success: boolean }> {
  try {
    const payload: any = {};
    if (subData.name !== undefined) payload.name = subData.name;
    if (subData.slug !== undefined) payload.slug = subData.slug;
    if (subData.categorySlug !== undefined) payload.category_slug = subData.categorySlug;
    if (subData.parentSlug !== undefined) payload.parent_slug = subData.parentSlug;
    if (subData.description !== undefined) payload.description = subData.description;
    if (subData.badgeColor !== undefined) payload.badge_color = subData.badgeColor;

    await supabase.from('subcategories').update(payload).eq('id', id);
  } catch (err) {}

  inMemorySubcategories = inMemorySubcategories.map((s) => (s.id === id ? { ...s, ...subData } : s));
  return { success: true };
}

/**
 * Delete SubCategory
 */
export async function deleteSubcategory(id: string): Promise<{ success: boolean }> {
  try {
    await supabase.from('subcategories').delete().eq('id', id);
  } catch (err) {}

  inMemorySubcategories = inMemorySubcategories.filter((s) => s.id !== id);
  return { success: true };
}

export let inMemoryPropertyDefinitions: PropertyDefinition[] = [
  {
    id: 'pdef-sizes',
    name: 'Size',
    slug: 'sizes',
    type: 'multi_select',
    description: 'Product sizing options',
    categoryIds: ['all'],
    filterable: true,
    variant: true,
    required: false,
    showOnProductPage: true,
    showOnProductCard: false,
    displayOrder: 1,
    options: [
      { id: 'opt-xs', name: 'XS', value: 'XS' },
      { id: 'opt-s', name: 'S', value: 'S' },
      { id: 'opt-m', name: 'M', value: 'M' },
      { id: 'opt-l', name: 'L', value: 'L' },
      { id: 'opt-xl', name: 'XL', value: 'XL' },
      { id: 'opt-36', name: '36', value: '36' },
      { id: 'opt-37', name: '37', value: '37' },
      { id: 'opt-38', name: '38', value: '38' },
      { id: 'opt-39', name: '39', value: '39' },
      { id: 'opt-40', name: '40', value: '40' },
      { id: 'opt-41', name: '41', value: '41' },
      { id: 'opt-onesize', name: 'One Size', value: 'One Size' },
    ],
  },
  {
    id: 'pdef-colors',
    name: 'Color Palette',
    slug: 'colors',
    type: 'color',
    description: 'Color theme and swatches',
    categoryIds: ['all'],
    filterable: true,
    variant: true,
    required: false,
    showOnProductPage: true,
    showOnProductCard: false,
    displayOrder: 2,
    options: [
      { id: 'opt-white', name: 'Pure White', value: 'Pure White', hex: '#FAFAFA' },
      { id: 'opt-cream', name: 'Ivory Cream', value: 'Ivory Cream', hex: '#FAF8F5' },
      { id: 'opt-gold', name: 'Habesha Gold', value: 'Habesha Gold', hex: '#C5A880' },
      { id: 'opt-royalgold', name: 'Royal Gold', value: 'Royal Gold', hex: '#D4AF37' },
      { id: 'opt-emerald', name: 'Emerald Green', value: 'Emerald Green', hex: '#1B4D3E' },
      { id: 'opt-burgundy', name: 'Deep Burgundy', value: 'Deep Burgundy', hex: '#800020' },
      { id: 'opt-navy', name: 'Royal Navy', value: 'Royal Navy', hex: '#002366' },
      { id: 'opt-black', name: 'Charcoal Black', value: 'Charcoal Black', hex: '#1A1A1A' },
    ],
  },
  {
    id: 'pdef-material',
    name: 'Material & Fabric',
    slug: 'material',
    type: 'select',
    description: 'Primary fabric composition',
    categoryIds: ['all'],
    filterable: true,
    variant: false,
    required: false,
    showOnProductPage: true,
    showOnProductCard: true,
    displayOrder: 3,
    options: [
      { id: 'opt-linen', name: 'Linen', value: 'Linen' },
      { id: 'opt-cotton', name: 'Cotton', value: 'Cotton' },
      { id: 'opt-shemma', name: 'Habesha Shemma', value: 'Habesha Shemma' },
      { id: 'opt-silk', name: 'Silk', value: 'Silk' },
      { id: 'opt-satin', name: 'Satin', value: 'Satin' },
      { id: 'opt-chiffon', name: 'Chiffon', value: 'Chiffon' },
      { id: 'opt-wool', name: 'Wool', value: 'Wool' },
    ],
  },
  {
    id: 'pdef-occasion',
    name: 'Occasion',
    slug: 'occasion',
    type: 'select',
    description: 'Wearing event or celebration',
    categoryIds: ['dresses', 'tops', 'accessories'],
    filterable: true,
    variant: false,
    required: false,
    showOnProductPage: true,
    showOnProductCard: false,
    displayOrder: 4,
    options: [
      { id: 'opt-wedding', name: 'Ceremonial & Wedding', value: 'Ceremonial & Wedding' },
      { id: 'opt-holiday', name: 'Holiday & Festival', value: 'Holiday & Festival' },
      { id: 'opt-casual', name: 'Casual & Daily', value: 'Casual & Daily' },
      { id: 'opt-evening', name: 'Evening & Gala', value: 'Evening & Gala' },
    ],
  },
  {
    id: 'pdef-sleeve-type',
    name: 'Sleeve Type',
    slug: 'sleeve-type',
    type: 'select',
    description: 'Sleeve length and style',
    categoryIds: ['dresses', 'tops'],
    filterable: true,
    variant: true,
    required: false,
    showOnProductPage: true,
    showOnProductCard: false,
    displayOrder: 5,
    options: [
      { id: 'opt-slv-short', name: 'Short Sleeve', value: 'Short Sleeve' },
      { id: 'opt-slv-long', name: 'Long Sleeve', value: 'Long Sleeve' },
      { id: 'opt-slv-none', name: 'Sleeveless', value: 'Sleeveless' },
      { id: 'opt-slv-off', name: 'Off-Shoulder', value: 'Off-Shoulder' },
      { id: 'opt-slv-cape', name: 'Cape Sleeve', value: 'Cape Sleeve' },
    ],
  },
  {
    id: 'pdef-heel-height',
    name: 'Heel Height',
    slug: 'heel-height',
    type: 'number',
    unit: 'cm',
    description: 'Footwear heel elevation',
    categoryIds: ['shoes'],
    filterable: true,
    variant: false,
    required: false,
    showOnProductPage: true,
    showOnProductCard: false,
    displayOrder: 6,
  },
];

/**
 * Persist an attribute's child rows (options + category bindings) to the
 * normalized EAV tables. Wipes and rewrites children for the attribute.
 */
async function persistAttributeChildren(def: PropertyDefinition): Promise<void> {
  // Options
  await supabase.from('attribute_options').delete().eq('attribute_id', def.id);
  if (def.options && def.options.length > 0) {
    const rows = def.options.map((o, i) => ({
      id: o.id ? String(o.id) : `opt-${Date.now()}-${i}`,
      attribute_id: def.id,
      name: o.name,
      value: o.value ?? o.name,
      hex: o.hex || null,
      display_order: i,
    }));
    await supabase.from('attribute_options').upsert(rows, { onConflict: 'id' });
  }

  // Category / Sub-category bindings ('all' = global)
  await supabase.from('category_attributes').delete().eq('attribute_id', def.id);
  const slugs = def.categoryIds && def.categoryIds.length > 0 ? Array.from(new Set(def.categoryIds)) : ['all'];
  const catRows = slugs.map((s) => ({ category_slug: s, attribute_id: def.id }));
  await supabase.from('category_attributes').upsert(catRows, { onConflict: 'category_slug,attribute_id' });
}

/**
 * Persist a product's dynamic attribute selections into the EAV join table
 * (`product_attribute_values`). Values are keyed by attribute code; option-based
 * types resolve to attribute_options rows, free-form types store value_text.
 */
export async function saveProductAttributeValues(
  productId: string,
  attrs?: Record<string, any>
): Promise<void> {
  if (!attrs || typeof attrs !== 'object') return;
  try {
    const defs = await getPropertyDefinitions();
    const defsByKey: Record<string, PropertyDefinition> = {};
    defs.forEach((d) => {
      defsByKey[d.slug] = d;
      defsByKey[String(d.id)] = d;
    });

    // Always rebuild this product's values from scratch
    await supabase.from('product_attribute_values').delete().eq('product_id', String(productId));

    const rows: any[] = [];
    const pushValue = (def: PropertyDefinition, rawVal: any) => {
      if (rawVal === undefined || rawVal === null || rawVal === '') return;
      if (def.type === 'select' || def.type === 'multi_select' || def.type === 'color') {
        const opt = (def.options || []).find((o) => o.value === rawVal || o.name === rawVal);
        rows.push({
          product_id: String(productId),
          attribute_id: def.id,
          option_id: opt ? String(opt.id) : null,
          value_text: opt ? opt.value : String(rawVal),
        });
      } else {
        rows.push({
          product_id: String(productId),
          attribute_id: def.id,
          option_id: null,
          value_text: String(rawVal),
        });
      }
    };

    for (const [key, val] of Object.entries(attrs)) {
      const def = defsByKey[key];
      if (!def) continue;
      if (Array.isArray(val)) val.forEach((v) => pushValue(def, v));
      else pushValue(def, val);
    }

    if (rows.length > 0) {
      await supabase.from('product_attribute_values').insert(rows);
    }
  } catch (err) {}
}

/**
 * Fetch All Metadata Property Definitions (from normalized EAV tables:
 * attributes + attribute_options + category_attributes)
 */
export async function getPropertyDefinitions(): Promise<PropertyDefinition[]> {
  try {
    const [attrRes, optRes, catRes] = await Promise.all([
      supabase.from('attributes').select('*').order('display_order', { ascending: true }),
      supabase.from('attribute_options').select('*').order('display_order', { ascending: true }),
      supabase.from('category_attributes').select('*'),
    ]);

    if (!attrRes.error && attrRes.data && attrRes.data.length > 0) {
      const optionsByAttr: Record<string, PropertyOption[]> = {};
      for (const o of (optRes.data || []) as any[]) {
        const aid = String(o.attribute_id);
        if (!optionsByAttr[aid]) optionsByAttr[aid] = [];
        optionsByAttr[aid].push({
          id: String(o.id),
          name: o.name,
          value: o.value ?? o.name,
          hex: o.hex || undefined,
        });
      }

      const catsByAttr: Record<string, string[]> = {};
      for (const c of (catRes.data || []) as any[]) {
        const aid = String(c.attribute_id);
        if (!catsByAttr[aid]) catsByAttr[aid] = [];
        catsByAttr[aid].push(String(c.category_slug));
      }

      const fetched: PropertyDefinition[] = (attrRes.data as any[]).map((a) => ({
        id: String(a.id),
        name: a.name,
        slug: a.code,
        type: (a.input_type || 'select') as PropertyType,
        description: a.description || '',
        unit: a.unit || '',
        options: optionsByAttr[String(a.id)] || [],
        categoryIds: catsByAttr[String(a.id)] && catsByAttr[String(a.id)].length > 0 ? catsByAttr[String(a.id)] : ['all'],
        filterable: a.filterable !== false,
        variant: !!a.variant,
        required: !!a.required,
        showOnProductPage: a.show_on_product_page !== false,
        showOnProductCard: !!a.show_on_product_card,
        displayOrder: a.display_order ?? 0,
        created_at: a.created_at,
      }));

      inMemoryPropertyDefinitions = fetched;
      return fetched;
    }

    return inMemoryPropertyDefinitions;
  } catch (err) {
    return inMemoryPropertyDefinitions;
  }
}

/**
 * Create Metadata Property Definition
 */
export async function createPropertyDefinition(propDef: Partial<PropertyDefinition>): Promise<{ success: boolean; data?: PropertyDefinition }> {
  const slug = propDef.slug || (propDef.name || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newPropDef: PropertyDefinition = {
    id: propDef.id || `pdef-${Date.now()}`,
    name: propDef.name || 'New Property',
    slug,
    type: propDef.type || 'select',
    description: propDef.description || '',
    unit: propDef.unit || '',
    options: propDef.options || [],
    categoryIds: propDef.categoryIds && propDef.categoryIds.length > 0 ? propDef.categoryIds : ['all'],
    filterable: propDef.filterable !== undefined ? propDef.filterable : true,
    variant: propDef.variant || false,
    required: propDef.required || false,
    showOnProductPage: propDef.showOnProductPage !== undefined ? propDef.showOnProductPage : true,
    showOnProductCard: propDef.showOnProductCard || false,
    displayOrder: propDef.displayOrder || inMemoryPropertyDefinitions.length + 1,
  };

  try {
    const payload = {
      id: newPropDef.id,
      name: newPropDef.name,
      code: newPropDef.slug,
      input_type: newPropDef.type,
      description: newPropDef.description,
      unit: newPropDef.unit,
      filterable: newPropDef.filterable,
      variant: newPropDef.variant,
      required: newPropDef.required,
      show_on_product_page: newPropDef.showOnProductPage,
      show_on_product_card: newPropDef.showOnProductCard,
      display_order: newPropDef.displayOrder,
    };
    const { error } = await supabase.from('attributes').upsert([payload], { onConflict: 'id' });
    if (!error) {
      await persistAttributeChildren(newPropDef);
    }
  } catch (err) {}

  inMemoryPropertyDefinitions.push(newPropDef);
  return { success: true, data: newPropDef };
}

/**
 * Update Property Definition
 */
export async function updatePropertyDefinition(id: string, propData: Partial<PropertyDefinition>): Promise<{ success: boolean }> {
  const existing = inMemoryPropertyDefinitions.find((p) => p.id === id);
  const merged: PropertyDefinition = {
    ...(existing || {
      id,
      name: 'Property',
      slug: '',
      type: 'select',
      options: [],
      categoryIds: ['all'],
      filterable: true,
      variant: false,
      required: false,
      showOnProductPage: true,
      showOnProductCard: false,
      displayOrder: 0,
    }),
    ...propData,
    id,
  };

  try {
    const payload: any = { name: merged.name, code: merged.slug, input_type: merged.type };
    if (propData.description !== undefined) payload.description = propData.description;
    if (propData.unit !== undefined) payload.unit = propData.unit;
    if (propData.filterable !== undefined) payload.filterable = propData.filterable;
    if (propData.variant !== undefined) payload.variant = propData.variant;
    if (propData.required !== undefined) payload.required = propData.required;
    if (propData.showOnProductPage !== undefined) payload.show_on_product_page = propData.showOnProductPage;
    if (propData.showOnProductCard !== undefined) payload.show_on_product_card = propData.showOnProductCard;
    if (propData.displayOrder !== undefined) payload.display_order = propData.displayOrder;

    await supabase.from('attributes').update(payload).eq('id', id);

    // Options and category bindings are rewritten wholesale
    await persistAttributeChildren(merged);
  } catch (err) {}

  inMemoryPropertyDefinitions = inMemoryPropertyDefinitions.map((p) => (p.id === id ? { ...p, ...propData } : p));
  return { success: true };
}

/**
 * Delete Property Definition
 */
export async function deletePropertyDefinition(id: string): Promise<{ success: boolean }> {
  try {
    // Cascades to attribute_options, category_attributes and product_attribute_values (FK ON DELETE CASCADE)
    await supabase.from('attributes').delete().eq('id', id);
    await supabase.from('product_attribute_values').delete().eq('attribute_id', id);
  } catch (err) {}

  inMemoryPropertyDefinitions = inMemoryPropertyDefinitions.filter((p) => p.id !== id);
  return { success: true };
}

/**
 * Record Telegram Order in Supabase
 */
export async function recordTelegramOrder(orderData: OrderInquiry): Promise<{ success: boolean; orderNumber: string }> {
  const orderNumber = `HW-${Math.floor(100000 + Math.random() * 900000)}`;

  const newOrder: OrderInquiry = {
    id: `ord-${Date.now()}`,
    orderNumber,
    customerName: orderData.customerName || 'Anonymous Telegram Buyer',
    customerTelegram: orderData.customerTelegram,
    totalAmount: orderData.totalAmount,
    items: orderData.items,
    status: 'Telegram Pending',
    notes: orderData.notes || '',
    createdAt: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from('orders').insert([
      {
        order_number: orderNumber,
        customer_name: newOrder.customerName,
        customer_telegram: newOrder.customerTelegram,
        total_amount: newOrder.totalAmount,
        items: newOrder.items,
        status: newOrder.status,
        notes: newOrder.notes,
      },
    ]);

    if (error) {
      console.warn('Supabase order insert warning:', error.message);
    }
  } catch (err) {}

  inMemoryOrders.unshift(newOrder);
  return { success: true, orderNumber };
}

/**
 * Fetch all orders for Admin panel
 */
export async function getOrders(): Promise<OrderInquiry[]> {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (error || !data) {
      return inMemoryOrders;
    }

    const fetched = data.map((o: any) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      customerTelegram: o.customer_telegram,
      totalAmount: Number(o.total_amount),
      items: o.items,
      status: o.status,
      notes: o.notes,
      createdAt: o.created_at,
    }));

    return fetched.length > 0 ? fetched : inMemoryOrders;
  } catch (err) {
    return inMemoryOrders;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean }> {
  try {
    await supabase.from('orders').update({ status }).eq('id', orderId);
  } catch (err) {}

  inMemoryOrders = inMemoryOrders.map((o) => (o.id === orderId ? { ...o, status: status as any } : o));
  return { success: true };
}
