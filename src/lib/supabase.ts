import { createClient } from '@supabase/supabase-js';
import { Product, Category, OrderInquiry, SiteSettings } from '../types';
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
  telegramUsername: process.env.NEXT_PUBLIC_TELEGRAM_USERNAME || 'abigail2',
  contactPhone: '+251 91 123 4567',
  contactEmail: 'contact@hiwifashion.com',
  storeLocation: 'Bole Subcity, Addis Ababa, Ethiopia',
  footerAboutText: 'Hiwi Fashion offers handcrafted authentic Habesha Kemis, modern Ethiopian evening gowns, Shemma Netela scarves, and artisanal leather fashion.',
  footerCopyright: '© 2026 Hiwi Fashion. All rights reserved. Addis Ababa, Ethiopia.',
  freeShippingThreshold: 2500,
};

let inMemorySiteSettings: SiteSettings = { ...DEFAULT_SITE_SETTINGS };
let inMemoryProducts: Product[] = [...INITIAL_PRODUCTS];
let inMemoryCategories: Category[] = [...INITIAL_CATEGORIES];
let inMemoryOrders: OrderInquiry[] = [];

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
    const { error } = await supabase.from('site_settings').upsert([
      {
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
      },
    ]);

    if (error) {
      console.warn('Supabase site_settings update warning:', error.message);
    }
  } catch (err) {}

  inMemorySiteSettings = updated;
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
      rating: Number(item.rating || 4.9),
      reviewsCount: Number(item.reviews_count || 24),
      isNew: Boolean(item.is_new),
      isSale: Boolean(item.is_sale),
      badgeText: item.badge_text || (item.is_sale ? 'SPECIAL OFFER' : item.is_new ? 'NEW ARRIVAL' : undefined),
      image: item.image,
      secondaryImage: item.secondary_image,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image, item.secondary_image].filter(Boolean),
      description: item.description,
      sizes: Array.isArray(item.sizes) ? item.sizes : ['XS', 'S', 'M', 'L', 'XL'],
      colors: Array.isArray(item.colors) ? item.colors : [{ name: 'Default', hex: '#1A1A1A' }],
      material: item.material || 'Ethiopian Cotton',
      occasion: item.occasion || 'Casual',
      fabricCare: item.fabric_care || 'Hand wash cold or dry clean recommended.',
      deliveryInfo: item.delivery_info || 'Fast delivery available in Addis Ababa within 24-48 hours.',
      stockQuantity: item.stock_quantity || 15,
      created_at: item.created_at,
    }));

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
    rating: productData.rating || 5.0,
    reviewsCount: productData.reviewsCount || 1,
    isNew: productData.isNew !== undefined ? productData.isNew : true,
    isSale: productData.isSale || false,
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
    stockQuantity: productData.stockQuantity || 10,
  };

  try {
    const { data, error } = await supabase.from('products').insert([
      {
        name: newProduct.name,
        slug: newProduct.slug,
        category: newProduct.category,
        price: newProduct.price,
        original_price: newProduct.originalPrice,
        rating: newProduct.rating,
        reviews_count: newProduct.reviewsCount,
        is_new: newProduct.isNew,
        is_sale: newProduct.isSale,
        badge_text: newProduct.badgeText,
        image: newProduct.image,
        secondary_image: newProduct.secondaryImage,
        images: newProduct.images,
        description: newProduct.description,
        sizes: newProduct.sizes,
        colors: newProduct.colors,
        material: newProduct.material,
        occasion: newProduct.occasion,
        fabric_care: newProduct.fabricCare,
        delivery_info: newProduct.deliveryInfo,
        stock_quantity: newProduct.stockQuantity,
      },
    ]).select();

    if (error) {
      console.warn('Supabase product creation warning:', error.message);
    }
  } catch (err: any) {}

  inMemoryProducts.unshift(newProduct);
  return { success: true, data: newProduct };
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, productData: Partial<Product>): Promise<{ success: boolean; data?: Product }> {
  try {
    const { error } = await supabase.from('products').update({
      name: productData.name,
      category: productData.category,
      price: productData.price,
      original_price: productData.originalPrice,
      description: productData.description,
      badge_text: productData.badgeText,
      image: productData.image,
      secondary_image: productData.secondaryImage,
      images: productData.images,
      sizes: productData.sizes,
      colors: productData.colors,
      material: productData.material,
      occasion: productData.occasion,
      fabric_care: productData.fabricCare,
      delivery_info: productData.deliveryInfo,
      is_new: productData.isNew,
      is_sale: productData.isSale,
      stock_quantity: productData.stockQuantity,
    }).eq('id', id);

    if (error) {
      console.warn('Supabase updateProduct warning:', error.message);
    }
  } catch (err) {}

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
 * Fetch categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from('categories').select('*');

    if (error || !data || data.length === 0) {
      return inMemoryCategories;
    }

    const fetched = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      image: item.image,
      description: item.description || '',
      itemCount: Number(item.item_count || 10),
    }));

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
  };

  try {
    await supabase.from('categories').insert([
      {
        name: newCat.name,
        slug: newCat.slug,
        image: newCat.image,
        description: newCat.description,
      },
    ]);
  } catch (err) {}

  inMemoryCategories.push(newCat);
  return { success: true };
}

/**
 * Update Category
 */
export async function updateCategory(id: string, catData: Partial<Category>): Promise<{ success: boolean }> {
  try {
    await supabase.from('categories').update({
      name: catData.name,
      slug: catData.slug,
      image: catData.image,
      description: catData.description,
    }).eq('id', id);
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
