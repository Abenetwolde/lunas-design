'use client';

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { recordTelegramOrder } from '../lib/supabase';
import { Product, ColorOption } from '../types';
import { Send, X, Copy, Check } from 'lucide-react';

export const TelegramOrderModal: React.FC = () => {
  const {
    isTelegramModalOpen,
    closeTelegramModal,
    telegramModalProduct,
    selectedModalColor,
    selectedModalSize,
    telegramUsername,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  if (!isTelegramModalOpen || !telegramModalProduct) return null;

  const product = telegramModalProduct;
  const activeColor = selectedColor || selectedModalColor?.name || product.colors[0]?.name || 'Standard';
  const activeSize = selectedSize || selectedModalSize || product.sizes[0] || 'M';
  const unitPrice = product.price;
  const totalAmount = unitPrice * quantity;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const productUrl = `${baseUrl}/product/${product.slug || product.id}`;

  // Clean Telegram Order Message Payload (No Emoji Clutter)
  const formattedMessage = `HIWI FASHION — PRODUCT INQUIRY

Hello! I would like to order:

Product: ${product.name}
Category: ${product.category.toUpperCase()}
Price: ETB ${unitPrice.toLocaleString('en-US')}
Color: ${activeColor}
Size: ${activeSize}
Quantity: ${quantity}
Total Amount: ETB ${totalAmount.toLocaleString('en-US')}

Product Link: ${productUrl}

${customerName ? `Customer Name: ${customerName}\n` : ''}${
    customerNote ? `Delivery Note: ${customerNote}\n` : ''
}Please confirm stock availability. Thank you!`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenTelegram = async () => {
    await recordTelegramOrder({
      customerName: customerName || undefined,
      customerTelegram: `@${telegramUsername}`,
      totalAmount,
      notes: customerNote,
      items: [
        {
          product,
          selectedColor: product.colors.find((c: ColorOption) => c.name === activeColor) || {
            name: activeColor,
            hex: '#1A1A1A',
          },
          selectedSize: activeSize,
          quantity,
        },
      ],
    });

    const tgUrl = `https://t.me/${telegramUsername}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(tgUrl, '_blank');
  };

  const handleShareDeepLink = () => {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(formattedMessage)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 my-8">
        
        {/* Header - Light Clean Vibe */}
        <div className="bg-gradient-to-r from-slate-50 via-sky-50/30 to-white border-b border-slate-200 p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-mono font-semibold uppercase tracking-wider border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Direct Order
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Order via Telegram Inbox
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Target handle: <span className="font-semibold text-sky-600">@{telegramUsername}</span>
            </p>
          </div>

          <button
            onClick={closeTelegramModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto text-slate-800">
          
          {/* Product Summary Tech Card */}
          <div className="flex gap-4 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-20 object-cover rounded-xl border border-slate-200 shadow-xs"
            />
            <div className="flex-1 space-y-1">
              <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                {product.category}
              </span>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">{product.name}</h4>
              <div className="text-xs font-semibold text-slate-900 font-mono">
                ETB {unitPrice.toLocaleString('en-US')}
              </div>
            </div>
          </div>

          {/* Specs Selection */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Color Choice
              </label>
              <select
                value={activeColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
              >
                {product.colors.map((c: ColorOption) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Size Choice
              </label>
              <select
                value={activeSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
              >
                {product.sizes.map((sz: string) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex justify-between items-center text-xs pt-1">
            <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">Quantity</span>
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                -
              </button>
              <span className="px-3 text-xs font-mono font-bold text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Customer Input Fields */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Almaz Bekele"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Delivery Address / Note
              </label>
              <input
                type="text"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="e.g. Bole Subcity, Addis Ababa"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Minimal Payload Preview Box */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                Telegram Payload Preview
              </span>
              <button
                onClick={handleCopyText}
                className="text-[11px] font-mono font-semibold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-50 text-slate-700 rounded-xl font-mono text-[10px] whitespace-pre-wrap max-h-36 overflow-y-auto border border-slate-200 leading-relaxed">
              {formattedMessage}
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500 uppercase tracking-wider">Total Payload Value:</span>
            <span className="text-base font-bold text-slate-900">ETB {totalAmount.toLocaleString('en-US')}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShareDeepLink}
              className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
            >
              Share Deep Link
            </button>

            <button
              onClick={handleOpenTelegram}
              className="py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Inbox @{telegramUsername}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
