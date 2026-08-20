-- ========================================================
-- HIWI FASHION E-COMMERCE SUPABASE DATABASE SCHEMA (ETB)
-- Execute this script in your Supabase SQL Editor:
-- https://xafspnuqhcpznrihtmvq.supabase.co
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SITE SETTINGS TABLE (Dynamic Storefront Configuration)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    site_name VARCHAR(255) DEFAULT 'Hiwi Fashion',
    tagline VARCHAR(255) DEFAULT 'HABESHA & MODERN ATELIER',
    announcement_bar TEXT DEFAULT 'FREE DELIVERY IN ADDIS ABABA OVER ETB 2,500 | AUTHENTIC HABESHA CLOTHING',
    hero_headline TEXT DEFAULT 'Everyday Habesha Style',
    hero_subtitle TEXT DEFAULT 'Handcrafted Ethiopian Kemis dresses, fine cotton Shemma scarves, and modern tailored silhouettes.',
    hero_image_url TEXT DEFAULT '/images/hero.jpg',
    hero_cta_text VARCHAR(100) DEFAULT 'SHOP CATALOG',
    telegram_username VARCHAR(100) DEFAULT 'abigel2',
    contact_phone VARCHAR(50) DEFAULT '+251 91 123 4567',
    contact_email VARCHAR(255) DEFAULT 'contact@hiwifashion.com',
    store_location VARCHAR(255) DEFAULT 'Bole Subcity, Addis Ababa, Ethiopia',
    footer_about_text TEXT DEFAULT 'Hiwi Fashion offers handcrafted authentic Habesha Kemis, modern Ethiopian evening gowns, Shemma Netela scarves, and artisanal leather fashion.',
    footer_copyright VARCHAR(255) DEFAULT '© 2026 Hiwi Fashion. All rights reserved. Addis Ababa, Ethiopia.',
    free_shipping_threshold DECIMAL(10, 2) DEFAULT 2500.00,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    seo_og_image TEXT,
    mini_card1_title TEXT,
    mini_card1_desc TEXT,
    mini_card2_title TEXT,
    mini_card2_desc TEXT,
    mini_card3_title TEXT,
    mini_card3_desc TEXT,
    mini_card4_title TEXT,
    mini_card4_desc TEXT,
    promo_banner_headline TEXT,
    promo_banner_subtitle TEXT,
    promo_banner_image TEXT,
    promo_banner_cta_text TEXT,
    promo_banner_cta_link TEXT,
    instagram_handle TEXT,
    instagram_images TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure all columns exist on existing table instances
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS store_location VARCHAR(255);
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS footer_about_text TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS footer_copyright VARCHAR(255);
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS free_shipping_threshold DECIMAL(10, 2);
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS seo_og_image TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS mini_card1_title TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS mini_card1_desc TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS mini_card2_title TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS mini_card2_desc TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS mini_card3_title TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS mini_card3_desc TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS mini_card4_title TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS mini_card4_desc TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS promo_banner_headline TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS promo_banner_subtitle TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS promo_banner_image TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS promo_banner_cta_text TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS promo_banner_cta_link TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS instagram_images TEXT[];

-- Seed default site settings
INSERT INTO public.site_settings (id, site_name, tagline, announcement_bar, hero_headline, hero_subtitle, hero_image_url, hero_cta_text, telegram_username, contact_email, footer_about_text, footer_copyright)
VALUES (
    'default',
    'Hiwi Fashion',
    'HABESHA & MODERN ATELIER',
    'FREE DELIVERY IN ADDIS ABABA OVER ETB 2,500 | AUTHENTIC HABESHA CLOTHING',
    'Everyday Habesha Style',
    'Handcrafted Ethiopian Kemis dresses, fine cotton Shemma scarves, and modern tailored silhouettes.',
    '/images/hero.jpg',
    'SHOP CATALOG',
    'abigel2',
    'contact@hiwifashion.com',
    'Hiwi Fashion offers handcrafted authentic Habesha Kemis, modern Ethiopian evening gowns, Shemma Netela scarves, and artisanal leather fashion.',
    '© 2026 Hiwi Fashion. All rights reserved. Addis Ababa, Ethiopia.'
)
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    image TEXT NOT NULL,
    description TEXT,
    item_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. PRODUCTS TABLE (Prices in Ethiopian Birr - ETB)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- In ETB
    original_price DECIMAL(10, 2), -- Optional discount price
    rating DECIMAL(3, 2) DEFAULT 4.9,
    reviews_count INT DEFAULT 24,
    is_new BOOLEAN DEFAULT false,
    is_sale BOOLEAN DEFAULT false,
    in_stock BOOLEAN DEFAULT true, -- In Stock / Out of Stock
    badge_text VARCHAR(100),
    image TEXT NOT NULL,
    secondary_image TEXT,
    images TEXT[] DEFAULT ARRAY[]::text[],
    description TEXT NOT NULL,
    sizes TEXT[] DEFAULT ARRAY['XS', 'S', 'M', 'L', 'XL'],
    colors JSONB DEFAULT '[]'::jsonb,
    material VARCHAR(100) DEFAULT 'Linen Blend',
    occasion VARCHAR(100) DEFAULT 'Casual',
    fabric_care TEXT,
    delivery_info TEXT,
    stock_quantity INT DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. REVIEWS TABLE (Real User Product Reviews & Ratings)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. ORDERS TABLE (Telegram Inquiry Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    customer_telegram VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL, -- In ETB
    items JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'Telegram Pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. STORAGE BUCKET CREATION FOR PRODUCT ASSETS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hiwi-fashion-assets', 'hiwi-fashion-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Access Policies
DROP POLICY IF EXISTS "Public Read Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Assets" ON storage.objects;

CREATE POLICY "Public Read Assets" ON storage.objects FOR SELECT USING (bucket_id = 'hiwi-fashion-assets');
CREATE POLICY "Public Insert Assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hiwi-fashion-assets');
CREATE POLICY "Public Update Assets" ON storage.objects FOR UPDATE USING (bucket_id = 'hiwi-fashion-assets');
CREATE POLICY "Public Delete Assets" ON storage.objects FOR DELETE USING (bucket_id = 'hiwi-fashion-assets');

-- Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public write site_settings" ON public.site_settings;
CREATE POLICY "Allow public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public write site_settings" ON public.site_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public write categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public write categories" ON public.categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read products" ON public.products;
DROP POLICY IF EXISTS "Allow public write products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public write products" ON public.products FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public insert reviews" ON public.reviews;
CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);
