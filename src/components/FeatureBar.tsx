'use client';

import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headset } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const FeatureBar: React.FC = () => {
  const { siteSettings, t } = useStore();

  const features = [
    {
      icon: Truck,
      title: siteSettings.miniCard1Title || t('localDelivery'),
      description: siteSettings.miniCard1Desc || t('localDeliveryDesc'),
    },
    {
      icon: ShieldCheck,
      title: siteSettings.miniCard2Title || t('directInquireBuy'),
      description: siteSettings.miniCard2Desc || t('directInquireBuyDesc'),
    },
    {
      icon: RefreshCw,
      title: siteSettings.miniCard3Title || t('fittingGuarantee'),
      description: siteSettings.miniCard3Desc || t('fittingGuaranteeDesc'),
    },
    {
      icon: Headset,
      title: siteSettings.miniCard4Title || t('customerConcierge'),
      description: siteSettings.miniCard4Desc || t('customerConciergeDesc'),
    },
  ];

  return (
    <section
      className="py-8 border-b transition-colors duration-300"
      style={{
        backgroundColor: 'var(--theme-app-bg, #F0FDF4)',
        borderColor: 'var(--theme-border-color, #A7F3D0)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all border shadow-xs"
                style={{
                  backgroundColor: 'var(--theme-card-bg, #FFFFFF)',
                  borderColor: 'var(--theme-card-border, var(--theme-border-color, #A7F3D0))',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    backgroundColor: 'var(--theme-secondary, #064E3B)',
                    color: 'var(--theme-primary, #10B981)',
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--theme-text-primary, #064E3B)' }}>
                    {f.title}
                  </h4>
                  <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--theme-text-muted, #047857)' }}>
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
