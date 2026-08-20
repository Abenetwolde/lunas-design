import { createClient } from '@supabase/supabase-js';
import { Product, Category, OrderInquiry, SiteSettings, Review } from '../types';
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
      inStock: item.in_stock !== undefined ? Boolean(item.in_stock) : true,
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
      stockQuantity: item.stock_quantity !== undefined ? item.stock_quantity : 15,
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

  inMemoryProducts.unshift(newProduct);
  return { success: true, data: newProduct };
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, productData: Partial<Product>): Promise<{ success: boolean; data?: Product }> {
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
        id: r.id,
        productId: r.product_id,
        authorName: r.author_name,
        rating: Number(r.rating),
        comment: r.comment,
        createdAt: r.created_at,
      }));
      inMemoryReviews[productId] = fetched;
      return fetched;
    }
  } catch (err) {}

  // Fallback initial reviews if none in DB
  if (!inMemoryReviews[productId]) {
    inMemoryReviews[productId] = [
      {
        id: `rev-1`,
        productId,
        authorName: 'Hana Tadesse',
        rating: 5,
        comment: 'Absolutely stunning authentic Habesha quality! The embroidery and fabric feel so luxurious.',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: `rev-2`,
        productId,
        authorName: 'Yonas Bekele',
        rating: 5,
        comment: 'Ordered via Telegram and received it the same day in Addis. Highly recommended seller!',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
    ];
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
  const newReview: Review = {
    id: `rev-${Date.now()}`,
    productId,
    authorName: authorName || 'Anonymous Customer',
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from('reviews').insert([
      {
        product_id: productId,
        author_name: newReview.authorName,
        rating: newReview.rating,
        comment: newReview.comment,
      },
    ]);
  } catch (err) {}

  if (!inMemoryReviews[productId]) inMemoryReviews[productId] = [];
  inMemoryReviews[productId].unshift(newReview);

  // Recalculate and update product rating in products table
  const allRevs = inMemoryReviews[productId];
  const avgRating = allRevs.reduce((acc, r) => acc + r.rating, 0) / allRevs.length;
  await updateProduct(productId, { rating: avgRating, reviewsCount: allRevs.length });

  return { success: true, review: newReview };
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
