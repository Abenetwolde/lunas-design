'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, ColorOption, Review } from '../../../types';
import { useStore } from '../../../context/StoreContext';
import { ProductCard } from '../../../components/ProductCard';
import {
  Send,
  ShoppingBag,
  Heart,
  Star,
  ChevronRight,
  MessageSquare,
  CheckCircle,
  User,
} from 'lucide-react';
import { recordTelegramOrder, getProductReviews, addReview } from '../../../lib/supabase';

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product: initialProduct, relatedProducts }: Props) {
  const { addToCart, toggleWishlist, isInWishlist, telegramUsername } = useStore();
  const [product, setProduct] = useState<Product>(initialProduct);

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
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping' | 'reviews'>('details');

  // Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);
  const [revAuthor, setRevAuthor] = useState<string>('');
  const [revRating, setRevRating] = useState<number>(5);
  const [revComment, setRevComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  const isWishlisted = isInWishlist(product.id);
  const totalAmount = product.price * quantity;
  const isInStock = product.inStock !== false;

  const galleryList = Array.from(
    new Set([product.image, product.secondaryImage, ...(product.images || [])].filter(Boolean) as string[])
  );

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullImageUrl = activeImage.startsWith('http') ? activeImage : `${baseUrl}${activeImage}`;

  // Fetch real reviews
  useEffect(() => {
    const fetchRevs = async () => {
      setLoadingReviews(true);
      const revs = await getProductReviews(product.id);
      setReviewsList(revs);
      setLoadingReviews(false);
    };
    fetchRevs();
  }, [product.id]);

  const productUrl = `${baseUrl}/product/${product.slug || product.id}`;

  // Formatted Telegram Message in ETB (Clean No Emoji Clutter)
  const formattedMessage = `HIWI FASHION — PRODUCT INQUIRY

Hello! I am interested in purchasing this product:

Product: ${product.name}
Category: ${product.category.toUpperCase()}
Price: ETB ${product.price.toLocaleString('en-US')}
Color: ${selectedColor.name}
Size: ${selectedSize}
Quantity: ${quantity}
Total Amount: ETB ${totalAmount.toLocaleString('en-US')}

Product Link: ${productUrl}

${customerName ? `Customer Name: ${customerName}\n` : ''}${
    customerNote ? `Delivery Address/Note: ${customerNote}\n` : ''
}Please confirm stock availability and payment options. Thank you!`;

  const handleOrderTelegram = async () => {
    if (!isInStock) return;
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revComment.trim()) return;
    setSubmittingReview(true);
    
    const res = await addReview(product.id, revAuthor, revRating, revComment);
    if (res.success && res.review) {
      const updatedRevs = [res.review, ...reviewsList];
      setReviewsList(updatedRevs);
      const avg = updatedRevs.reduce((acc, r) => acc + r.rating, 0) / updatedRevs.length;
      setProduct({ ...product, rating: avg, reviewsCount: updatedRevs.length });
      setRevAuthor('');
      setRevComment('');
      setRevRating(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    }
    setSubmittingReview(false);
  };

  const hasOriginalPrice = Boolean(product.originalPrice && product.originalPrice > product.price);

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
                className={`w-full h-full object-cover object-top transition-all duration-500 ${
                  !isInStock ? 'grayscale opacity-80' : ''
                }`}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {!isInStock ? (
                  <span className="bg-red-600 text-white text-[10px] font-bold tracking-widest px-3 py-1 uppercase rounded-md shadow-sm">
                    OUT OF STOCK
                  </span>
                ) : (
                  <>
                    {product.badgeText && (
                      <span className="bg-[#1A1A1A] text-white text-[10px] font-extrabold tracking-widest px-3 py-1 uppercase rounded-md shadow-sm">
                        {product.badgeText}
                      </span>
                    )}
                    {product.isNew && !product.badgeText && (
                      <span className="bg-[#1A1A1A] text-white text-[10px] font-bold tracking-widest px-3 py-1 uppercase rounded-md shadow-sm">
                        NEW ARRIVAL
                      </span>
                    )}
                    {product.isSale && hasOriginalPrice && !product.badgeText && (
                      <span className="bg-red-600 text-white text-[10px] font-bold tracking-widest px-3 py-1 uppercase rounded-md shadow-sm">
                        SPECIAL OFFER
                      </span>
                    )}
                  </>
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880]">
                  {product.category}
                </span>
                {isInStock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                    ● In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                    ● Out of Stock
                  </span>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl font-light text-[#1A1A1A] mt-1">
                {product.name}
              </h1>

              {/* Price & Rating in ETB (Conditional Discount Price) */}
              <div className="flex items-center justify-between pt-2 border-b border-[#E7E2DA] pb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-[#1A1A1A]">
                    ETB {product.price.toLocaleString()}
                  </span>
                  {hasOriginalPrice && (
                    <span className="text-base text-gray-400 line-through">
                      ETB {product.originalPrice!.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold text-gray-900">{product.rating.toFixed(1)}</span>
                  <span className="text-gray-400">({reviewsList.length || product.reviewsCount} reviews)</span>
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

            {/* DIRECT TELEGRAM ORDER BOX - SITE BASE COLOR SCHEME */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] text-[#1A1A1A] space-y-4 border border-[#E7E2DA]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center text-white shadow-xs">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1A1A]">Order via Telegram Inbox</h4>
                    <p className="text-[11px] text-gray-500">Direct seller message</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#0088cc]">@{telegramUsername}</span>
              </div>

              {/* Message snippet preview */}
              <div className="p-3.5 bg-white rounded-xl font-mono text-[11px] text-gray-800 max-h-32 overflow-y-auto whitespace-pre-wrap border border-[#E7E2DA]">
                {formattedMessage}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={handleOrderTelegram}
                  disabled={!isInStock}
                  className={`flex-1 py-3.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                    isInStock
                      ? 'bg-[#0088cc] hover:bg-[#0077b3] text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{isInStock ? 'Send Order to Telegram' : 'Currently Out of Stock'}</span>
                </button>

                <button
                  onClick={() => isInStock && addToCart(product, selectedColor, selectedSize, quantity)}
                  disabled={!isInStock}
                  className={`py-3.5 px-5 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    isInStock
                      ? 'bg-[#1A1A1A] text-white hover:bg-[#C5A880] hover:text-black'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Tabbed Info (Product Details, Fabric & Care, Delivery & Returns, Customer Reviews) */}
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
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'reviews' ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' : 'text-gray-400'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Customer Reviews ({reviewsList.length})</span>
            </button>
          </div>

          <div className="pt-6 text-xs text-gray-600 leading-relaxed max-w-4xl">
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

            {/* REAL USER REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                
                {/* Write a review form */}
                <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-[#E7E2DA] space-y-4">
                  <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#C5A880]" />
                    <span>Write a Customer Review</span>
                  </h3>

                  {reviewSuccess && (
                    <div className="p-3 bg-green-50 text-green-700 text-xs font-semibold rounded-xl border border-green-200 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Thank you! Your review has been saved to Supabase and published.</span>
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-gray-800 block mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={revAuthor}
                          onChange={(e) => setRevAuthor(e.target.value)}
                          placeholder="e.g. Bethlehem Alemu"
                          className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-800 block mb-1">Rating</label>
                        <div className="flex items-center gap-1.5 pt-1">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => setRevRating(starVal)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  starVal <= revRating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="ml-2 font-bold text-gray-800">{revRating} / 5 Stars</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-gray-800 block mb-1">Review Comment</label>
                      <textarea
                        required
                        rows={3}
                        value={revComment}
                        onChange={(e) => setRevComment(e.target.value)}
                        placeholder="Write your authentic feedback about the fabric, fitting, or delivery experience..."
                        className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 bg-[#1A1A1A] text-white font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-[#C5A880] transition-colors shadow-md"
                    >
                      {submittingReview ? 'Submitting Review...' : 'Submit Review'}
                    </button>
                  </form>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs">
                    Customer Feedback ({reviewsList.length})
                  </h4>

                  {loadingReviews ? (
                    <p className="text-gray-400 italic">Loading customer reviews...</p>
                  ) : reviewsList.length === 0 ? (
                    <p className="text-gray-500 italic">No reviews submitted yet. Be the first to review this product!</p>
                  ) : (
                    <div className="space-y-3">
                      {reviewsList.map((rev) => (
                        <div key={rev.id} className="p-4 bg-white rounded-2xl border border-[#E7E2DA] space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center text-gray-600">
                                <User className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-gray-900 text-xs">{rev.authorName}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'
                                  }`}
                                />
                              ))}
                              <span className="text-[10px] text-gray-400 ml-1">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-700 text-xs font-light leading-relaxed pl-9">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
