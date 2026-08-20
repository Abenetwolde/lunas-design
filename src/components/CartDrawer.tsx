'use client';

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { recordTelegramOrder } from '../lib/supabase';
import { X, Trash2, Send, ShoppingBag, Copy, Check } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    telegramUsername,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isCartOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Multi-item Telegram Message Generator in ETB
  const formattedCartMessage = `🛍️ *MULTI-ITEM ORDER CHECKOUT — HIWI FASHION*

Hello! I would like to place an order for the following cart items:

${cart
  .map(
    (item, idx) =>
      `[Item ${idx + 1}]
▪️ *Product:* ${item.product.name}
🎨 *Color:* ${item.selectedColor.name} | 📐 *Size:* ${item.selectedSize}
🔢 *Qty:* ${item.quantity} × ETB ${item.product.price.toLocaleString()} = ETB ${(
        item.product.price * item.quantity
      ).toLocaleString()}
🖼️ *Link:* ${item.product.image.startsWith('http') ? item.product.image : `${baseUrl}${item.product.image}`}`
  )
  .join('\n\n')}

-----------------------------------
💵 *TOTAL AMOUNT:* ETB ${totalAmount.toLocaleString()}

${customerName ? `👤 *Customer Name:* ${customerName}\n` : ''}${
    customerNote ? `💬 *Delivery Address/Note:* ${customerNote}\n` : ''
}Please confirm item availability and payment instructions. Thank you!`;

  const handleCheckoutTelegram = async () => {
    if (cart.length === 0) return;

    await recordTelegramOrder({
      customerName: customerName || undefined,
      customerTelegram: `@${telegramUsername}`,
      totalAmount,
      notes: customerNote,
      items: cart,
    });

    const tgUrl = `https://t.me/${telegramUsername}?text=${encodeURIComponent(formattedCartMessage)}`;
    window.open(tgUrl, '_blank');
  };

  const handleCopyCartText = () => {
    navigator.clipboard.writeText(formattedCartMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#E7E2DA] animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 bg-[#1A1A1A] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C5A880]" />
              <h2 className="text-base font-bold uppercase tracking-wider">Your Shopping Bag ({cart.length})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center mx-auto text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Your bag is currently empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Explore our authentic Habesha collection and order items directly via Telegram in ETB!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C5A880] transition-colors inline-block"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 divide-y divide-[#E7E2DA]">
                  {cart.map((item, idx) => (
                    <div key={idx} className="pt-4 first:pt-0 flex gap-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-24 object-cover rounded-lg border border-[#E7E2DA]"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-[#1A1A1A] line-clamp-1">{item.product.name}</h4>
                          <button
                            onClick={() =>
                              removeFromCart(item.product.id, item.selectedColor.name, item.selectedSize)
                            }
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-[11px] text-gray-500 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block border border-black/20"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            {item.selectedColor.name}
                          </span>
                          <span>•</span>
                          <span>Size: {item.selectedSize}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-[#E7E2DA] rounded bg-[#FAF8F5]">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.selectedColor.name,
                                  item.selectedSize,
                                  item.quantity - 1
                                )
                              }
                              className="px-2 py-0.5 text-xs font-bold text-gray-600"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold text-[#1A1A1A]">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.selectedColor.name,
                                  item.selectedSize,
                                  item.quantity + 1
                                )
                              }
                              className="px-2 py-0.5 text-xs font-bold text-gray-600"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-xs font-bold text-[#1A1A1A]">
                            ETB {(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional Customer info input */}
                <div className="pt-4 border-t border-[#E7E2DA] space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                      Customer Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Almaz Bekele"
                      className="w-full px-3 py-1.5 text-xs border border-[#E7E2DA] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                      Delivery Address / Note
                    </label>
                    <input
                      type="text"
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      placeholder="e.g. Bole Subcity, Addis Ababa"
                      className="w-full px-3 py-1.5 text-xs border border-[#E7E2DA] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Actions */}
          {cart.length > 0 && (
            <div className="p-6 bg-[#FAF8F5] border-t border-[#E7E2DA] space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-[#1A1A1A]">
                <span>Total Amount:</span>
                <span className="text-lg">ETB {totalAmount.toLocaleString()}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyCartText}
                  className="px-3 py-3 rounded-xl border border-[#E7E2DA] bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleCheckoutTelegram}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-[#0088cc] hover:bg-[#0077b3] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Checkout via Telegram (@{telegramUsername})</span>
                </button>
              </div>

              <button
                onClick={clearCart}
                className="w-full text-center text-[11px] text-gray-400 hover:text-red-600 transition-colors py-1"
              >
                Empty Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
