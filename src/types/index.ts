export interface ColorOption {
  name: string;
  hex: string;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'dresses' | 'tops' | 'accessories' | 'shoes' | string;
  subcategory?: string;
  price: number; // In ETB
  originalPrice?: number; // In ETB (Optional - for discount strikethrough)
  rating: number;
  reviewsCount: number;
  isNew?: boolean;
  isSale?: boolean;
  inStock?: boolean; // In Stock or Out of Stock option
  badgeText?: string; // Optional e.g. "SPECIAL OFFER"
  image: string; // Cover image
  secondaryImage?: string;
  images?: string[]; // Multiple gallery images array
  description: string;
  sizes: string[];
  colors: ColorOption[];
  material?: string;
  occasion?: string;
  fabricCare?: string; // Optional Fabric & Care details
  deliveryInfo?: string; // Optional Delivery & Returns info
  stockQuantity?: number;
  created_at?: string;
  reviewsList?: Review[];
  // DYNAMIC METADATA-DRIVEN ATTRIBUTES (Record keyed by property slug or ID)
  attributes?: Record<string, any>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  itemCount: number;
  subcategories?: string[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categorySlug: string; // Parent Category slug or name
  parentSlug?: string;  // Optional parent SubCategory — enables Category → SubCategory → Child Collection trees
  description?: string;
  itemCount?: number;
  badgeColor?: string;
}

export type PropertyType = 'select' | 'multi_select' | 'color' | 'number' | 'range' | 'boolean' | 'text';

export interface PropertyOption {
  id: string;
  name: string;
  value: string;
  hex?: string; // Hex color for color swatches
}

export interface PropertyDefinition {
  id: string;
  name: string;
  slug: string;
  type: PropertyType;
  description?: string;
  unit?: string; // E.g. "cm", "g", "ETB"
  options?: PropertyOption[];
  categoryIds: string[]; // ['dresses', 'tops'] or ['all']
  filterable: boolean; // Auto-generates storefront filter if true
  variant: boolean; // Used as product variant option
  required: boolean;
  showOnProductPage: boolean;
  showOnProductCard: boolean;
  displayOrder: number;
  created_at?: string;
}

export interface ProductProperty {
  id: string;
  type: 'material' | 'occasion' | 'tag';
  name: string;
  slug: string;
  description?: string;
  badgeColor?: string;
}

export interface CartItem {
  product: Product;
  selectedColor: ColorOption;
  selectedSize: string;
  quantity: number;
}

export interface OrderInquiry {
  id?: string;
  orderNumber?: string;
  customerName?: string;
  customerTelegram: string;
  items: CartItem[];
  totalAmount: number; // In ETB
  notes?: string;
  status?: 'Telegram Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt?: string;
}

export interface SiteSettings {
  id?: string;
  siteName: string;
  tagline: string;
  announcementBar: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroCtaText: string;
  telegramUsername: string;
  contactPhone: string;
  contactEmail: string;
  storeLocation: string;
  footerAboutText: string;
  footerCopyright: string;
  freeShippingThreshold: number; // ETB

  // Dynamic SEO Fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoOgImage?: string;

  // Dynamic Mini Cards (Feature Bar)
  miniCard1Title?: string;
  miniCard1Desc?: string;
  miniCard2Title?: string;
  miniCard2Desc?: string;
  miniCard3Title?: string;
  miniCard3Desc?: string;
  miniCard4Title?: string;
  miniCard4Desc?: string;

  // Dynamic Promo Ad Banner
  promoBannerHeadline?: string;
  promoBannerSubtitle?: string;
  promoBannerImage?: string;
  promoBannerCtaText?: string;
  promoBannerCtaLink?: string;

  // Dynamic Instagram Showcase
  instagramTitle?: string;
  instagramSubtitle?: string;
  instagramHandle?: string;
  instagramImages?: string[];

  // Dynamic App Theme Customizer Colors
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  themeHeaderBg?: string;
  themeHeaderTextColor?: string;
  themeAppBg?: string;
  themeCardBg?: string;
  themeCardTextColor?: string;
  themeCardMutedText?: string;
  themeCardBorderColor?: string;
  themeCardBadgeBg?: string;
  themeCardButtonBg?: string;
  themeCardButtonTextColor?: string;
  themeButtonBg?: string;
  themeButtonTextColor?: string;
  themeBadgeBg?: string;
  themeAnnouncementBg?: string;
  themeAnnouncementTextColor?: string;
  themeTextPrimary?: string;
  themeTextMuted?: string;
  themeBorderColor?: string;
  themePresetName?: string;
}
