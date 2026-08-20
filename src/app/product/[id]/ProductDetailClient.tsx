'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, ColorOption } from '../../../types';
import { useStore } from '../../../context/StoreContext';
import { ProductCard } from '../../../components/ProductCard';
import {
  Send,
  ShoppingBag,
  Heart,
  Star,
  ChevronRight,
} from 'lucide-react';
import { recordTelegramOrder } from '../../../lib/supabase';

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const { addToCart, toggleWishlist, isInWishlist, telegramUsername } = useStore();

  const [selectedColor, setSelectedColor] = useState<ColorOption>(
    product.colors && product.colors.length > 0 ? product.colors[0] : { name: 'Standard', hex: '#1A1A1A' }
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'ONE SIZE'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerNote, setCustomerNote] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');

  const isWishlisted = isInWishlist(product.id);
  const totalAmount = product.price * quantity;

  const galleryList = Array.from(
    new Set([product.image, product.secondaryImage, ...(product.images || [])].filter(Boolean) as string[])
  );

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullImageUrl = activeImage.startsWith('http') ? activeImage : `${baseUrl}${activeImage}`;

  // Formatted Telegram Message in ETB
  const formattedMessage = `🛍️ *PRODUCT ORDER INQUIRY — HIWI FASHION*

Hello! I am interested in purchasing this product:

📌 *Product:* ${product.name}
🏷️ *Category:* ${product.category.toUpperCase()}
💰 *Price:* ETB ${product.price.toLocaleString()}
🎨 *Color:* ${selectedColor.name}
📐 *Size:* ${selectedSize}
🔢 *Quantity:* ${quantity}
💵 *TOTAL AMOUNT:* ETB ${totalAmount.toLocaleString()}

🖼️ *Product Image URL:*
${fullImageUrl}

${customerName ? `👤 *Customer Name:* ${customerName}\n` : ''}${
    customerNote ? `💬 *Delivery Address/Note:* ${customerNote}\n` : ''
}Please let me know if this item is in stock and send payment options. Thank you!`;

  const handleOrderTelegram = async () => {
    await recordTelegramOrder({
      customerName: customerName || undefined,
      customerTelegram: `@${telegramUsername}`,
      totalAmount,
      notes: customerNote,
      items: [{ product, selectedColor, selectedSize, quantity }],
    });

    const tgUrl = `https://t.me/${telegramUsername}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(tgUrl, '_blank');
  };

  return (
    <div className="bg-[#F9F7F4] min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <Link href="/catalog" className="hover:text-black">
            Catalog
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <Link href={`/catalog?category=${product.category}`} className="hover:text-black">
            {product.category}
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-[#1A1A1A] font-bold line-clamp-1">{product.name}</span>
        </nav>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 bg-white p-5 sm:p-10 rounded-3xl border border-[#E7E2DA] shadow-sm">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E7E2DA]">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-top transition-all duration-500"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {product.badgeText && (
                  <span className="bg-red-600 text-white text-[10px] font-extrabold tracking-widest px-3 py-1 uppercase rounded-md shadow-sm">
                    {product.badgeText}
                  </span>
                )}
                {product.isNew && !product.badgeText && (
                  <span className="bg-[#1A1A1A] text-white text-[10px] font-bold tracking-widest px-3 py-1 uppercase rounded-md shadow-sm">
                    NEW ARRIVAL
                  </span>
                )}
                {product.isSale && !product.badgeText && (
                  <span className="bg-red-600 text-white text-[10px] font-bold tracking-widest px-3 py-1 uppercase rounded-md shadow-sm">
                    SPECIAL OFFER
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isWishlisted
                    ? 'bg-red-50 text-red-600 shadow-md'
                    : 'bg-white/80 backdrop-blur-md text-gray-700 hover:bg-white hover:text-black shadow-sm'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Gallery Thumbnail Selector */}
            {galleryList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === imgUrl ? 'border-[#1A1A1A] scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="Thumbnail view" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Detail Controls & Telegram Order */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880]">
                  {product.category}
                </span>
                <h1 className="font-serif text-2xl sm:text-4xl font-light text-[#1A1A1A] mt-1">
                  {product.name}
                </h1>
              </div>

              {/* Price & Rating in ETB */}
              <div className="flex items-center justify-between pt-2 border-b border-[#E7E2DA] pb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-[#1A1A1A]">
                    ETB {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-base text-gray-400 line-through">
                      ETB {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold text-gray-900">{product.rating.toFixed(1)}</span>
                  <span className="text-gray-400">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                {product.description}
              </p>

              {/* Dynamic Color Swatch Picker */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                    Color: <span className="text-[#C5A880] font-extrabold">{selectedColor.name}</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                          selectedColor.name === c.name
                            ? 'border-[#1A1A1A] bg-white ring-2 ring-[#1A1A1A]/20 font-bold'
                            : 'border-[#E7E2DA] bg-[#FAF8F5] hover:border-gray-400'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/20"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Size Picker */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-gray-900 uppercase tracking-wider">
                      Size: <span className="text-[#1A1A1A] font-extrabold">{selectedSize}</span>
                    </label>
                    <span className="text-gray-400 underline cursor-pointer">Fitting Guide</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`min-w-[48px] h-11 px-4 rounded-xl border text-xs font-bold transition-all ${
                          selectedSize === sz
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md'
                            : 'bg-[#FAF8F5] text-gray-800 border-[#E7E2DA] hover:border-gray-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Counter */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                  Quantity
                </label>
                <div className="flex items-center w-36 border border-[#E7E2DA] rounded-xl bg-[#FAF8F5] overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-[#1A1A1A]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* DIRECT TELEGRAM ORDER BOX */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-black text-white space-y-4 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center text-white">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Order via Telegram Inbox</h4>
                    <p className="text-[11px] text-gray-400">Direct message with auto image payload</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#C5A880]">@{telegramUsername}</span>
              </div>

              {/* Message snippet preview */}
              <div className="p-3 bg-slate-800/80 rounded-xl font-mono text-[11px] text-gray-300 max-h-32 overflow-y-auto whitespace-pre-wrap border border-slate-700">
                {formattedMessage}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleOrderTelegram}
                  className="flex-1 py-3.5 px-4 bg-[#0088cc] hover:bg-[#0077b3] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Order to Telegram</span>
                </button>

                <button
                  onClick={() => addToCart(product, selectedColor, selectedSize, quantity)}
                  className="py-3.5 px-5 bg-white text-black hover:bg-[#C5A880] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Tabbed Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E2DA]">
          <div className="flex border-b border-[#E7E2DA] gap-6 sm:gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                activeTab === 'details' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : 'text-gray-400'
              }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`pb-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                activeTab === 'care' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : 'text-gray-400'
              }`}
            >
              Fabric & Care
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                activeTab === 'shipping' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : 'text-gray-400'
              }`}
            >
              Delivery & Returns
            </button>
          </div>

          <div className="pt-6 text-xs text-gray-600 leading-relaxed max-w-3xl">
            {activeTab === 'details' && (
              <div className="space-y-3">
                <p>{product.description}</p>
                <ul className="list-disc pl-4 space-y-1 text-gray-700">
                  <li>Category: {product.category}</li>
                  <li>Material: {product.material || 'Organic Ethiopian Cotton'}</li>
                  <li>Occasion: {product.occasion || 'Authentic Ethiopian Fashion'}</li>
                  <li>Ethically woven and tailored by traditional artisans.</li>
                </ul>
              </div>
            )}
            {activeTab === 'care' && (
              <div className="space-y-2">
                <p>{product.fabricCare || 'To preserve the tailored drape and embroidery vibrancy of your Habesha garment:'}</p>
                {!product.fabricCare && (
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Hand wash or gentle cold cycle recommended.</li>
                    <li>Do not bleach or tumble dry; dry in shade.</li>
                    <li>Iron on warm setting avoiding direct heavy steam on embroidery threads.</li>
                  </ul>
                )}
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="space-y-2">
                <p>{product.deliveryInfo || 'We provide fast courier delivery across Addis Ababa and all regions of Ethiopia.'}</p>
                {!product.deliveryInfo && (
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Free delivery in Addis Ababa on orders over ETB 2,500.</li>
                    <li>Telegram order confirmation processed within hours.</li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products Recommendation */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <div className="border-b border-[#E7E2DA] pb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C5A880]">
                Complement Your Style
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mt-1">
                You May Also Like
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
