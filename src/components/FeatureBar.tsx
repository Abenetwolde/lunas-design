'use client';

import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headset } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const FeatureBar: React.FC = () => {
  const { siteSettings } = useStore();

  const features = [
    {
      icon: Truck,
      title: siteSettings.miniCard1Title || 'LOCAL DELIVERY',
      description: siteSettings.miniCard1Desc || 'Free in Addis Ababa over ETB 2,500',
    },
    {
      icon: ShieldCheck,
      title: siteSettings.miniCard2Title || 'DIRECT INQUIRE & BUY',
      description: siteSettings.miniCard2Desc || '100% instant inbox order confirmation',
    },
    {
      icon: RefreshCw,
      title: siteSettings.miniCard3Title || 'FITTING GUARANTEE',
      description: siteSettings.miniCard3Desc || 'Easy exchange & size customization',
    },
    {
      icon: Headset,
      title: siteSettings.miniCard4Title || 'CUSTOMER CONCIERGE',
      description: siteSettings.miniCard4Desc || '24/7 direct seller support in ETB',
    },
  ];

  return (
    <section className="bg-white border-b border-[#E7E2DA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#FAF8F5]/70 hover:bg-[#FAF8F5] transition-colors border border-[#E7E2DA]">
                <div className="w-11 h-11 rounded-full bg-[#1A1A1A] text-[#C5A880] flex items-center justify-center shrink-0 shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A1A] tracking-wider uppercase">{f.title}</h4>
                  <p className="text-[11px] text-gray-500 font-medium">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
