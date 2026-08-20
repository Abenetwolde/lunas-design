export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'dresses' | 'tops' | 'accessories' | 'shoes' | string;
  price: number; // In ETB
  originalPrice?: number; // In ETB
  rating: number;
  reviewsCount: number;
  isNew?: boolean;
  isSale?: boolean;
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
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  itemCount: number;
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
}
