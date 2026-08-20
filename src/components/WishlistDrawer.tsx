'use client';

import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Heart, Send, Trash2 } from 'lucide-react';

export const WishlistDrawer: React.FC = () => {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, toggleWishlist, openTelegramModal } = useStore();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#E7E2DA] animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 bg-[#1A1A1A] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
              <h2 className="text-base font-bold uppercase tracking-wider">Saved Wishlist ({wishlist.length})</h2>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlist.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center mx-auto text-gray-400">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">No items saved yet</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Click the heart icon on any Habesha dress or accessory to save it to your wishlist.
                </p>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-[#E7E2DA]">
                {wishlist.map((product) => (
                  <div key={product.id} className="pt-4 first:pt-0 flex gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-24 object-cover rounded-lg border border-[#E7E2DA]"
                    />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-[#1A1A1A] line-clamp-1">{product.name}</h4>
                        <button
                          onClick={() => toggleWishlist(product)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs font-bold text-[#1A1A1A]">
                        ETB {product.price.toLocaleString()}
                      </div>

                      <button
                        onClick={() => {
                          setIsWishlistOpen(false);
                          openTelegramModal(product);
                        }}
                        className="w-full py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Order via Telegram</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
