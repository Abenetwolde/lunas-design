'use client';

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { recordTelegramOrder } from '../lib/supabase';
import { Product, ColorOption } from '../types';
import {
  Send,
  X,
  Copy,
  Check,
} from 'lucide-react';

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
  const [orderSent, setOrderSent] = useState(false);

  if (!isTelegramModalOpen || !telegramModalProduct) return null;

  const product = telegramModalProduct;
  const activeColor = selectedColor || selectedModalColor?.name || product.colors[0]?.name || 'Standard';
  const activeSize = selectedSize || selectedModalSize || product.sizes[0] || 'M';
  const unitPrice = product.price;
  const totalAmount = unitPrice * quantity;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullImageUrl = product.image.startsWith('http')
    ? product.image
    : `${baseUrl}${product.image}`;

  // Formatted Telegram Order Payload (ETB)
  const formattedMessage = `🛍️ *PRODUCT ORDER INQUIRY — HIWI FASHION*

Hello! I would like to order the following item:

📌 *Product:* ${product.name}
🏷️ *Category:* ${product.category.toUpperCase()}
💰 *Unit Price:* ETB ${unitPrice.toLocaleString('en-US')}
🎨 *Color:* ${activeColor}
📐 *Size:* ${activeSize}
🔢 *Quantity:* ${quantity}
💵 *TOTAL AMOUNT:* ETB ${totalAmount.toLocaleString('en-US')}

🖼️ *Product Image URL:*
${fullImageUrl}

${customerName ? `👤 *Customer Name:* ${customerName}\n` : ''}${
    customerNote ? `💬 *Delivery Note:* ${customerNote}\n` : ''
}Please confirm item stock and send payment options. Thank you!`;

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

    setOrderSent(true);
    const tgUrl = `https://t.me/${telegramUsername}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(tgUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E7E2DA] animate-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-[#1A1A1A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center text-white font-bold shadow-md">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-wide flex items-center gap-2">
                Order via Telegram Inbox
              </h3>
              <p className="text-xs text-gray-300">Target Seller: @{telegramUsername}</p>
            </div>
          </div>
          <button
            onClick={closeTelegramModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Product Summary Card */}
          <div className="flex gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA]">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-24 object-cover rounded-xl border border-[#E7E2DA]"
            />
            <div className="flex-1 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                {product.category}
              </span>
              <h4 className="text-sm font-bold text-[#1A1A1A]">{product.name}</h4>
              <div className="text-xs font-bold text-[#1A1A1A]">
                ETB {unitPrice.toLocaleString()} <span className="text-gray-400 font-normal">/ unit</span>
              </div>
            </div>
          </div>

          {/* Color & Size Specs Selection */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1.5 uppercase tracking-wider">
                Color Choice
              </label>
              <select
                value={activeColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E7E2DA] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
              >
                {product.colors.map((c: ColorOption) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#1A1A1A] block mb-1.5 uppercase tracking-wider">
                Size Choice
              </label>
              <select
                value={activeSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E7E2DA] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
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
          <div className="flex justify-between items-center text-xs pt-2 border-t border-[#E7E2DA]">
            <span className="font-bold text-[#1A1A1A] uppercase tracking-wider">Quantity:</span>
            <div className="flex items-center border border-[#E7E2DA] rounded-xl bg-[#FAF8F5] overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200"
              >
                -
              </button>
              <span className="px-3 text-xs font-bold text-[#1A1A1A]">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>

          {/* Optional Customer Inputs */}
          <div className="space-y-3 pt-2 border-t border-[#E7E2DA]">
            <div>
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Almaz Bekele"
                className="w-full px-3 py-2 text-xs border border-[#E7E2DA] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                Delivery Address / Specific Note
              </label>
              <input
                type="text"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="e.g. Bole Subcity, Addis Ababa"
                className="w-full px-3 py-2 text-xs border border-[#E7E2DA] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
              />
            </div>
          </div>

          {/* Generated Message Payload Box */}
          <div className="space-y-2 pt-2 border-t border-[#E7E2DA]">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                Pre-Filled Telegram Message Payload
              </span>
              <button
                onClick={handleCopyText}
                className="text-xs font-bold text-[#0088cc] hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] whitespace-pre-wrap max-h-40 overflow-y-auto border border-slate-700">
              {formattedMessage}
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="bg-[#FAF8F5] border-t border-[#E7E2DA] p-5 space-y-3">
          <div className="flex justify-between items-center text-sm font-bold text-[#1A1A1A]">
            <span>Total Inquiry Amount:</span>
            <span className="text-lg text-[#1A1A1A]">ETB {totalAmount.toLocaleString()}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopyText}
              className="px-4 py-3 rounded-xl border border-[#E7E2DA] bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleOpenTelegram}
              className="flex-1 py-3.5 px-4 bg-[#0088cc] hover:bg-[#0077b3] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Open Telegram Inbox (@{telegramUsername})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
