'use client';

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Database, Copy, Check, X, Server, ShieldCheck } from 'lucide-react';

export const SupabaseSqlModal: React.FC = () => {
  const { isSqlModalOpen, setIsSqlModalOpen } = useStore();
  const [copied, setCopied] = useState(false);

  if (!isSqlModalOpen) return null;

  const sqlSchema = `-- ========================================================
-- HIWI FASHION SUPABASE DATABASE MIGRATION SCHEMA (ETB)
-- Paste this script into your Supabase SQL Editor:
-- https://xafspnuqhcpznrihtmvq.supabase.co
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure missing columns are added if tables already exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge_text VARCHAR(100);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::text[];

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    image TEXT NOT NULL,
    description TEXT,
    item_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    rating DECIMAL(3, 2) DEFAULT 4.9,
    reviews_count INT DEFAULT 24,
    is_new BOOLEAN DEFAULT false,
    is_sale BOOLEAN DEFAULT false,
    in_stock BOOLEAN DEFAULT true,
    badge_text VARCHAR(100),
    image TEXT NOT NULL,
    secondary_image TEXT,
    images TEXT[] DEFAULT ARRAY[]::text[],
    description TEXT NOT NULL,
    sizes TEXT[] DEFAULT ARRAY['XS', 'S', 'M', 'L', 'XL'],
    colors JSONB DEFAULT '[]'::jsonb,
    material VARCHAR(100) DEFAULT 'Linen Blend',
    occasion VARCHAR(100) DEFAULT 'Casual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    customer_telegram VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    items JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'Telegram Pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public write categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public write products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E7E2DA]">
        
        {/* Header */}
        <div className="bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C5A880] flex items-center justify-center text-black font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-wide">Supabase Database Integration</h3>
              <p className="text-xs text-gray-300">Credentials & SQL Migration Schema</p>
            </div>
          </div>
          <button
            onClick={() => setIsSqlModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto no-scrollbar space-y-4">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] space-y-2 text-xs text-gray-700">
            <div className="flex items-center gap-2 font-bold text-[#1A1A1A]">
              <Server className="w-4 h-4 text-[#C5A880]" />
              <span>Connected Supabase Project:</span>
            </div>
            <div className="font-mono text-[11px] bg-white p-2 rounded border border-[#E7E2DA] break-all">
              https://xafspnuqhcpznrihtmvq.supabase.co
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                SQL Schema Script for Supabase SQL Editor
              </label>
              <button
                onClick={handleCopySql}
                className="text-xs font-bold text-[#0088cc] hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] whitespace-pre-wrap max-h-56 overflow-y-auto no-scrollbar border border-slate-700">
              {sqlSchema}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#FAF8F5] border-t border-[#E7E2DA] px-6 py-4 flex justify-end">
          <button
            onClick={handleCopySql}
            className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#C5A880] transition-colors flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
