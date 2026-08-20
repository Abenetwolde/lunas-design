'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category, OrderInquiry, SiteSettings, ColorOption } from '../../types';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  updateOrderStatus,
  getProducts,
  getOrders,
  getCategories,
  getSiteSettings,
  updateSiteSettings,
  supabase,
} from '../../lib/supabase';
import { uploadImageToSupabase } from '../../lib/supabaseStorage';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Send,
  Sliders,
  Database,
  Plus,
  Trash2,
  Edit,
  Eye,
  Upload,
  RefreshCw,
  LogOut,
  Menu,
  X,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  DollarSign,
  UserCheck,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  PackageCheck,
  FileText,
  Tag,
  Phone,
  Mail,
  MapPin,
  Star,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';

interface Props {
  initialProducts: Product[];
  initialCategories: Category[];
  initialOrders: OrderInquiry[];
  initialSettings?: SiteSettings;
}

export default function AdminClient({
  initialProducts,
  initialCategories,
  initialOrders,
  initialSettings,
}: Props) {
  const router = useRouter();
  const { siteSettings, updateSiteSettingsState, refreshSiteData } = useStore();

  // Pure Supabase Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Data states
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [orders, setOrders] = useState<OrderInquiry[]>(initialOrders);

  // Sidebar & Navigation states
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'site' | 'database'>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Site Settings Form state
  const [siteForm, setSiteForm] = useState<SiteSettings>(initialSettings || siteSettings);
  const [siteSaving, setSiteSaving] = useState(false);

  // Search & Filter states
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Product Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'details' | 'care' | 'delivery'>('details');
  const [viewSelectedImage, setViewSelectedImage] = useState<string>('');

  // Rich Product Form Fields
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('dresses');
  const [pPrice, setPPrice] = useState('3500');
  const [pOrigPrice, setPOrigPrice] = useState('4200');
  const [pBadgeText, setPBadgeText] = useState('SPECIAL OFFER');
  const [pDesc, setPDesc] = useState('');
  const [pMaterial, setPMaterial] = useState('Ethiopian Cotton');
  const [pOccasion, setPOccasion] = useState('Casual');
  const [pFabricCare, setPFabricCare] = useState('');
  const [pDeliveryInfo, setPDeliveryInfo] = useState('');
  const [pStock, setPStock] = useState('15');
  const [pImage, setPImage] = useState('');
  const [pSecondaryImage, setPSecondaryImage] = useState('');
  const [pGalleryImages, setPGalleryImages] = useState<string[]>([]);
  const [pIsNew, setPIsNew] = useState(true);
  const [pIsSale, setPIsSale] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Dynamic Colors state in product form
  const [pColors, setPColors] = useState<ColorOption[]>([
    { name: 'White & Gold', hex: '#FAF8F5' },
    { name: 'Black & Gold', hex: '#1A1A1A' },
  ]);

  // Dynamic Sizes state in product form
  const [pSizes, setPSizes] = useState<string[]>(['XS', 'S', 'M', 'L', 'XL']);

  // Category Modal state (Both Create & Edit)
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Order Details Modal state
  const [selectedOrder, setSelectedOrder] = useState<OrderInquiry | null>(null);

  // Copy SQL state
  const [sqlCopied, setSqlCopied] = useState(false);

  // Pure Supabase & Admin Session check
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const localAuth = typeof window !== 'undefined' ? localStorage.getItem('hiwi_admin_session') : null;
      const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('hiwi_admin_email') : null;

      if (data.session || localAuth === 'true') {
        setIsAuthenticated(true);
        setAuthEmail(data.session?.user?.email || storedEmail || 'etdev6796@gmail.com');
      } else {
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
      setAuthChecking(false);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    setSiteForm(siteSettings);
  }, [siteSettings]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const refreshAllData = async () => {
    setLoading(true);
    const p = await getProducts();
    const c = await getCategories();
    const o = await getOrders();
    const s = await getSiteSettings();
    setProducts(p);
    setCategories(c);
    setOrders(o);
    setSiteForm(s);
    await refreshSiteData();
    setLoading(false);
    showToast('Dashboard synced with Supabase!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('hiwi_admin_session');
    localStorage.removeItem('hiwi_admin_email');
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  // Product Create/Edit Handlers
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setPName('');
    setPCategory(categories[0]?.slug || 'dresses');
    setPPrice('2500');
    setPOrigPrice('3200');
    setPBadgeText('SPECIAL OFFER');
    setPDesc('Handcrafted authentic Ethiopian fashion garment.');
    setPMaterial('Ethiopian Fine Cotton');
    setPOccasion('Casual & Ceremonial');
    setPFabricCare('Traditional handwoven cotton. Hand wash cold or dry clean recommended.');
    setPDeliveryInfo('Fast delivery available in Addis Ababa within 24-48 hours.');
    setPStock('15');
    setPImage('/images/hero.jpg');
    setPSecondaryImage('');
    setPGalleryImages([]);
    setPColors([
      { name: 'White & Gold', hex: '#FAF8F5' },
      { name: 'Black & Gold', hex: '#1A1A1A' },
    ]);
    setPSizes(['XS', 'S', 'M', 'L', 'XL']);
    setPIsNew(true);
    setPIsSale(false);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setPName(prod.name);
    setPCategory(prod.category);
    setPPrice(prod.price.toString());
    setPOrigPrice(prod.originalPrice ? prod.originalPrice.toString() : '');
    setPBadgeText(prod.badgeText || (prod.isSale ? 'SPECIAL OFFER' : ''));
    setPDesc(prod.description);
    setPMaterial(prod.material || 'Cotton');
    setPOccasion(prod.occasion || 'Casual');
    setPFabricCare(prod.fabricCare || '');
    setPDeliveryInfo(prod.deliveryInfo || '');
    setPStock((prod.stockQuantity || 15).toString());
    setPImage(prod.image);
    setPSecondaryImage(prod.secondaryImage || '');
    setPGalleryImages(prod.images || [prod.image, prod.secondaryImage].filter(Boolean) as string[]);
    setPColors(prod.colors && prod.colors.length > 0 ? prod.colors : [{ name: 'Default', hex: '#1A1A1A' }]);
    setPSizes(prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['XS', 'S', 'M', 'L', 'XL']);
    setPIsNew(Boolean(prod.isNew));
    setPIsSale(Boolean(prod.isSale));
    setShowProductModal(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, targetType: 'cover' | 'secondary' | 'gallery' | 'category') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingImg(true);
      const { url } = await uploadImageToSupabase(file);
      if (url) {
        if (targetType === 'cover') setPImage(url);
        else if (targetType === 'secondary') setPSecondaryImage(url);
        else if (targetType === 'gallery') setPGalleryImages([...pGalleryImages, url]);
        else if (targetType === 'category') setCatImage(url);
        showToast('Image uploaded to Supabase Storage!');
      }
      setUploadingImg(false);
    }
  };

  const handleAddColor = () => {
    setPColors([...pColors, { name: 'Custom Color', hex: '#C5A880' }]);
  };

  const handleRemoveColor = (idx: number) => {
    setPColors(pColors.filter((_, i) => i !== idx));
  };

  const handleColorChange = (idx: number, field: 'name' | 'hex', val: string) => {
    const updated = [...pColors];
    updated[idx][field] = val;
    setPColors(updated);
  };

  const handleToggleSize = (size: string) => {
    if (pSizes.includes(size)) {
      setPSizes(pSizes.filter((s) => s !== size));
    } else {
      setPSizes([...pSizes, size]);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice) return;

    setLoading(true);
    const prodData: Partial<Product> = {
      name: pName,
      category: pCategory,
      price: Number(pPrice),
      originalPrice: pOrigPrice ? Number(pOrigPrice) : undefined,
      badgeText: pBadgeText || undefined,
      description: pDesc || 'Handcrafted Habesha garment.',
      material: pMaterial,
      occasion: pOccasion,
      fabricCare: pFabricCare,
      deliveryInfo: pDeliveryInfo,
      stockQuantity: Number(pStock || 15),
      image: pImage || '/images/hero.jpg',
      secondaryImage: pSecondaryImage || undefined,
      images: pGalleryImages.length > 0 ? pGalleryImages : [pImage].filter(Boolean),
      isNew: pIsNew,
      isSale: pIsSale,
      sizes: pSizes,
      colors: pColors,
    };

    if (editingProductId) {
      await updateProduct(editingProductId, prodData);
      showToast(`Updated "${pName}"`);
    } else {
      await createProduct(prodData);
      showToast(`Created product "${pName}"`);
    }

    setShowProductModal(false);
    refreshAllData();
    setLoading(false);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Delete product "${name}" permanently?`)) {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      showToast(`Deleted product "${name}"`);
    }
  };

  // Category Handlers (Create & Edit)
  const handleOpenAddCategory = () => {
    setEditingCatId(null);
    setCatName('');
    setCatSlug('');
    setCatImage('/images/hero.jpg');
    setCatDesc('');
    setShowCatModal(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatImage(cat.image);
    setCatDesc(cat.description || '');
    setShowCatModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    setLoading(true);
    const slug = catSlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (editingCatId) {
      await updateCategory(editingCatId, {
        name: catName,
        slug,
        image: catImage || '/images/hero.jpg',
        description: catDesc,
      });
      showToast(`Updated category "${catName}"`);
    } else {
      await createCategory({
        name: catName,
        slug,
        image: catImage || '/images/hero.jpg',
        description: catDesc,
      });
      showToast(`Created category "${catName}"`);
    }

    setShowCatModal(false);
    refreshAllData();
    setLoading(false);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Delete category "${name}"?`)) {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
      showToast(`Deleted category "${name}"`);
    }
  };

  // Site Settings Save
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiteSaving(true);
    await updateSiteSettingsState(siteForm);
    setSiteSaving(false);
    showToast('Saved all site content to Supabase!');
  };

  // Order status handler
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o)));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus as any });
    }
    showToast(`Order status updated to ${newStatus}`);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCatFilter === 'all' || p.category === productCatFilter;
    return matchesSearch && matchesCat;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return (o.status || 'Telegram Pending') === orderStatusFilter;
  });

  // Stats Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrdersCount = orders.filter((o) => !o.status || o.status === 'Telegram Pending').length;

  const navMenuItems = [
    { id: 'overview', label: 'Overview & Stats', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Inventory', icon: ShoppingBag, badge: products.length },
    { id: 'categories', label: 'Categories', icon: Layers, badge: categories.length },
    { id: 'orders', label: 'Telegram Orders', icon: Send, badge: pendingOrdersCount ? `${pendingOrdersCount} pending` : orders.length },
    { id: 'site', label: 'Site Content & Hero', icon: Sliders },
    { id: 'database', label: 'Database Setup & SQL', icon: Database },
  ];

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
          <RefreshCw className="w-5 h-5 animate-spin text-[#C5A880]" />
          <span>Verifying Admin Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col lg:flex-row font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-[#C5A880] animate-in fade-in slide-in-from-bottom">
          <Sparkles className="w-4 h-4 text-[#C5A880]" />
          <span>{notification}</span>
        </div>
      )}

      {/* MOBILE TOP HEADER BAR */}
      <div className="lg:hidden bg-[#1A1A1A] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-gray-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div>
            <h2 className="font-serif text-lg font-bold tracking-wider text-white uppercase">
              Hiwi Fashion
            </h2>
            <span className="text-[9px] text-[#C5A880] uppercase tracking-widest block -mt-1">
              Admin Console
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 text-gray-300 hover:text-red-400"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* LEFT SIDEBAR MENU */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-40 w-72 bg-[#1A1A1A] text-white flex flex-col justify-between p-6 border-r border-zinc-800 transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-8">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#C5A880] block">
                HABESHA ATELIER
              </span>
              <h1 className="font-serif text-2xl font-bold text-white tracking-wider uppercase">
                Hiwi Fashion
              </h1>
              <p className="text-[11px] text-gray-400 mt-0.5">Admin Management Console</p>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Badge */}
          <div className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#C5A880] text-black font-bold text-xs flex items-center justify-center shrink-0">
                HF
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate">{authEmail}</span>
                <span className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" /> Supabase Session
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#C5A880] text-black shadow-lg font-extrabold'
                      : 'text-gray-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-black text-white' : 'bg-zinc-800 text-gray-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Sidebar Footer Actions */}
        <div className="pt-6 border-t border-zinc-800 space-y-3">
          <button
            onClick={refreshAllData}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-gray-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-zinc-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Supabase Data</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-red-900/50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* OVERVIEW STATS TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">Dashboard Overview</h2>
              <p className="text-xs text-gray-500 mt-1">Live metrics from your Supabase database in ETB</p>
            </div>

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white p-6 rounded-3xl border border-[#E7E2DA] shadow-xs space-y-3">
                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <span>Inquiry Sales (ETB)</span>
                  <div className="w-9 h-9 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#1A1A1A]">
                  ETB {totalRevenue.toLocaleString()}
                </div>
                <p className="text-[11px] text-gray-400">Total Telegram customer inquiries</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E7E2DA] shadow-xs space-y-3">
                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <span>Telegram Orders</span>
                  <div className="w-9 h-9 rounded-2xl bg-sky-100 text-[#0088cc] flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#1A1A1A]">{orders.length}</div>
                <p className="text-[11px] text-amber-600 font-semibold">{pendingOrdersCount} pending confirmation</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E7E2DA] shadow-xs space-y-3">
                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <span>Active Products</span>
                  <div className="w-9 h-9 rounded-2xl bg-amber-100 text-[#C5A880] flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#1A1A1A]">{products.length}</div>
                <p className="text-[11px] text-gray-400">Catalog items in Supabase</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E7E2DA] shadow-xs space-y-3">
                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <span>Categories</span>
                  <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#1A1A1A]">{categories.length}</div>
                <p className="text-[11px] text-gray-400">Fashion collections</p>
              </div>

            </div>

            {/* Quick Recent Orders Summary */}
            <div className="bg-white p-6 rounded-3xl border border-[#E7E2DA] shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-[#1A1A1A]">Recent Customer Inquiry Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#0088cc] hover:underline flex items-center gap-1"
                >
                  <span>View All Orders</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-gray-500 py-4">No Telegram orders recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((o) => (
                    <div
                      key={o.id || o.orderNumber}
                      onClick={() => setSelectedOrder(o)}
                      className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA] hover:border-[#C5A880] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#1A1A1A]">{o.orderNumber}</span>
                          <span className="text-[#0088cc] font-bold">@{o.customerTelegram?.replace('@', '')}</span>
                        </div>
                        <p className="text-gray-500 text-[11px]">
                          Customer: <strong>{o.customerName || 'Direct Inbox Buyer'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-bold text-[#1A1A1A] text-sm block">
                            ETB {o.totalAmount?.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Today'}
                          </span>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          {o.status || 'Telegram Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS & INVENTORY TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">Products & Inventory</h2>
                <p className="text-xs text-gray-500 mt-1">Manage catalog items, rich specifications, color options, and gallery images</p>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="px-5 py-3 bg-[#1A1A1A] hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-colors shadow-md flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Search and Category Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-[#E7E2DA] shadow-xs flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by title or category..."
                  className="w-full pl-10 pr-4 py-2 text-xs border border-[#E7E2DA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
                />
              </div>

              <select
                value={productCatFilter}
                onChange={(e) => setProductCatFilter(e.target.value)}
                className="px-4 py-2 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-xs font-bold text-gray-700"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-[#E7E2DA] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-gray-700 uppercase tracking-wider font-bold border-b border-[#E7E2DA]">
                    <tr>
                      <th className="py-4 px-6">Product Item</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price (ETB)</th>
                      <th className="py-4 px-6">Colors / Sizes</th>
                      <th className="py-4 px-6">Badges</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E2DA]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No products found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                          <td className="py-4 px-6 flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-14 object-cover rounded-xl border border-[#E7E2DA] shrink-0"
                            />
                            <div>
                              <span className="font-bold text-[#1A1A1A] block">{p.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{p.slug}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-semibold uppercase text-gray-600">{p.category}</td>
                          <td className="py-4 px-6 font-bold text-[#1A1A1A]">
                            ETB {p.price.toLocaleString()}
                            {p.originalPrice && (
                              <span className="block text-[10px] text-gray-400 line-through">
                                ETB {p.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1 mb-1">
                              {p.colors?.map((col, i) => (
                                <span
                                  key={i}
                                  className="w-3.5 h-3.5 rounded-full border border-gray-400 inline-block"
                                  style={{ backgroundColor: col.hex }}
                                  title={col.name}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {p.sizes?.join(', ')}
                            </span>
                          </td>
                          <td className="py-4 px-6 space-x-1">
                            {p.badgeText && (
                              <span className="bg-[#1A1A1A] text-[#C5A880] text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                                {p.badgeText}
                              </span>
                            )}
                            {p.isNew && (
                              <span className="bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded">NEW</span>
                            )}
                            {p.isSale && (
                              <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">SALE</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setViewProduct(p);
                                  setViewSelectedImage(p.image);
                                  setActiveViewTab('details');
                                }}
                                className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg"
                                title="Inspect Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-2 text-gray-500 hover:text-[#C5A880] hover:bg-amber-50 rounded-lg"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORIES MANAGEMENT TAB (Full Create & Edit Support) */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">Categories Management</h2>
                <p className="text-xs text-gray-500 mt-1">Create and edit fashion categories live in Supabase</p>
              </div>

              <button
                onClick={handleOpenAddCategory}
                className="px-5 py-3 bg-[#1A1A1A] hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-colors shadow-md flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white rounded-3xl p-5 border border-[#E7E2DA] shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <img src={cat.image} alt={cat.name} className="w-full h-40 object-cover rounded-2xl border" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#C5A880] tracking-wider block">
                        {cat.slug}
                      </span>
                      <h3 className="font-bold text-base text-[#1A1A1A]">{cat.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description || 'Fashion collection'}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E7E2DA] flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700">{cat.itemCount || 0} Items</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-1.5 text-gray-500 hover:text-[#C5A880] transition-colors"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TELEGRAM ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">Telegram Inquiry Orders</h2>
                <p className="text-xs text-gray-500 mt-1">Manage customer inquiries received via Telegram inbox</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700">Filter Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#E7E2DA] rounded-xl text-xs font-bold text-gray-800"
                >
                  <option value="all">All Orders ({orders.length})</option>
                  <option value="Telegram Pending">Telegram Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-[#E7E2DA] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-gray-700 uppercase tracking-wider font-bold border-b border-[#E7E2DA]">
                    <tr>
                      <th className="py-4 px-6">Order #</th>
                      <th className="py-4 px-6">Customer Telegram</th>
                      <th className="py-4 px-6">Total Amount (ETB)</th>
                      <th className="py-4 px-6">Purchased Items</th>
                      <th className="py-4 px-6">Current Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E2DA]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No order inquiries found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id || ord.orderNumber} className="hover:bg-[#FAF8F5]/60 transition-colors">
                          <td className="py-4 px-6 font-mono font-bold text-[#1A1A1A]">{ord.orderNumber}</td>
                          <td className="py-4 px-6">
                            <a
                              href={`https://t.me/${ord.customerTelegram?.replace('@', '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-[#0088cc] hover:underline flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>@{ord.customerTelegram?.replace('@', '')}</span>
                            </a>
                            <span className="text-[10px] text-gray-400 block">{ord.customerName}</span>
                          </td>
                          <td className="py-4 px-6 font-bold text-[#1A1A1A]">
                            ETB {ord.totalAmount?.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-gray-700">
                            {ord.items?.map((item, idx) => (
                              <div key={idx} className="text-[11px]">
                                • {item.product.name} ({item.quantity}x - {item.selectedSize})
                              </div>
                            ))}
                          </td>
                          <td className="py-4 px-6">
                            <select
                              value={ord.status || 'Telegram Pending'}
                              onChange={(e) => handleStatusChange(ord.id || '', e.target.value)}
                              className="px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-[11px] font-bold text-gray-800"
                            >
                              <option value="Telegram Pending">Telegram Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3 py-1.5 bg-[#1A1A1A] text-white rounded-xl font-bold text-[11px] hover:bg-[#C5A880]"
                            >
                              View Invoice
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SITE CONTENT & HERO TAB */}
        {activeTab === 'site' && (
          <div className="bg-white p-8 rounded-3xl border border-[#E7E2DA] shadow-xs space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">Site Banner & Hero Settings</h2>
              <p className="text-xs text-gray-500 mt-1">
                Updates configured here directly update the public storefront in real-time
              </p>
            </div>

            <form onSubmit={handleSaveSiteSettings} className="space-y-6 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    Store Brand Name
                  </label>
                  <input
                    type="text"
                    value={siteForm.siteName}
                    onChange={(e) => setSiteForm({ ...siteForm, siteName: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    Tagline Subtitle
                  </label>
                  <input
                    type="text"
                    value={siteForm.tagline}
                    onChange={(e) => setSiteForm({ ...siteForm, tagline: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                  Top Announcement Bar Message
                </label>
                <input
                  type="text"
                  value={siteForm.announcementBar}
                  onChange={(e) => setSiteForm({ ...siteForm, announcementBar: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                  Hero Headline Title
                </label>
                <input
                  type="text"
                  value={siteForm.heroHeadline}
                  onChange={(e) => setSiteForm({ ...siteForm, heroHeadline: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-xl font-serif text-base font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                  Hero Subtitle Description
                </label>
                <textarea
                  rows={2}
                  value={siteForm.heroSubtitle}
                  onChange={(e) => setSiteForm({ ...siteForm, heroSubtitle: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    Hero Image URL
                  </label>
                  <input
                    type="text"
                    value={siteForm.heroImageUrl}
                    onChange={(e) => setSiteForm({ ...siteForm, heroImageUrl: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    Telegram Seller Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold">@</span>
                    <input
                      type="text"
                      value={siteForm.telegramUsername}
                      onChange={(e) => setSiteForm({ ...siteForm, telegramUsername: e.target.value })}
                      className="w-full pl-7 pr-3 py-2.5 border rounded-xl font-bold text-[#0088cc]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#E7E2DA]">
                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={siteForm.contactPhone}
                    onChange={(e) => setSiteForm({ ...siteForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={siteForm.contactEmail}
                    onChange={(e) => setSiteForm({ ...siteForm, contactEmail: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    Store Location Address
                  </label>
                  <input
                    type="text"
                    value={siteForm.storeLocation}
                    onChange={(e) => setSiteForm({ ...siteForm, storeLocation: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                  Footer Brand Bio / About Text
                </label>
                <textarea
                  rows={2}
                  value={siteForm.footerAboutText}
                  onChange={(e) => setSiteForm({ ...siteForm, footerAboutText: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                  Footer Copyright Text
                </label>
                <input
                  type="text"
                  value={siteForm.footerCopyright}
                  onChange={(e) => setSiteForm({ ...siteForm, footerCopyright: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={siteSaving}
                className="px-8 py-3.5 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-[#C5A880] transition-colors shadow-lg"
              >
                {siteSaving ? 'Saving to Supabase...' : 'Save All Site Content'}
              </button>
            </form>
          </div>
        )}

        {/* DATABASE SETUP TAB */}
        {activeTab === 'database' && (
          <div className="bg-white p-8 rounded-3xl border border-[#E7E2DA] space-y-6 shadow-xs animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-[#C5A880]" />
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A]">Supabase SQL Schema Migration</h3>
                  <p className="text-xs text-gray-500">
                    Project URL: <strong>https://xafspnuqhcpznrihtmvq.supabase.co</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA] text-xs text-gray-700 space-y-2">
              <p className="font-bold text-[#1A1A1A]">Quick Setup Steps:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Open your Supabase SQL Editor: <a href="https://xafspnuqhcpznrihtmvq.supabase.co" target="_blank" rel="noreferrer" className="text-[#0088cc] underline font-bold">Open Supabase Dashboard</a></li>
                <li>Execute SQL table migrations.</li>
              </ol>
            </div>
          </div>
        )}

        {/* COMPREHENSIVE ADD & EDIT PRODUCT FORM MODAL */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#E7E2DA] space-y-6 my-8 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-4 border-b border-[#E7E2DA]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A880]">PRODUCT SPECIFICATIONS</span>
                  <h3 className="font-bold text-xl text-[#1A1A1A]">
                    {editingProductId ? 'Edit Product Catalog Item' : 'Create New Product Item'}
                  </h3>
                </div>
                <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-black">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
                
                {/* Title & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Product Name / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="e.g. Handwoven Shemma Netela Scarf"
                      className="w-full px-3.5 py-2.5 border rounded-xl font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Category *
                    </label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 border rounded-xl bg-white font-bold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing & Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Selling Price (ETB) *
                    </label>
                    <input
                      type="number"
                      required
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      placeholder="1200"
                      className="w-full px-3.5 py-2.5 border rounded-xl font-bold text-sm text-[#1A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Original Price (ETB)
                    </label>
                    <input
                      type="number"
                      value={pOrigPrice}
                      onChange={(e) => setPOrigPrice(e.target.value)}
                      placeholder="1550"
                      className="w-full px-3.5 py-2.5 border rounded-xl text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Badge Banner Text
                    </label>
                    <input
                      type="text"
                      value={pBadgeText}
                      onChange={(e) => setPBadgeText(e.target.value)}
                      placeholder="SPECIAL OFFER"
                      className="w-full px-3.5 py-2.5 border rounded-xl font-bold text-[#C5A880] uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={pStock}
                      onChange={(e) => setPStock(e.target.value)}
                      className="w-full px-3.5 py-2.5 border rounded-xl font-bold"
                    />
                  </div>
                </div>

                {/* Cover Image & Multiple Gallery Images */}
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E7E2DA] space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#C5A880]" /> Cover Image & Gallery Images
                    </label>
                    {uploadingImg && <span className="text-xs text-[#0088cc] font-bold">Uploading image...</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="font-bold text-gray-700 block">Primary Cover Image *</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e, 'cover')}
                        className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1A1A1A] file:text-white"
                      />
                      <input
                        type="text"
                        value={pImage}
                        onChange={(e) => setPImage(e.target.value)}
                        placeholder="Or enter Image URL"
                        className="w-full px-3 py-1.5 border rounded-xl bg-white"
                      />
                      {pImage && <img src={pImage} alt="Cover Preview" className="w-20 h-24 object-cover rounded-xl border mt-2" />}
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold text-gray-700 block">Add Secondary / Gallery Images</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e, 'gallery')}
                        className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1A1A1A] file:text-white"
                      />
                      
                      {/* Gallery Thumbnails List */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {pGalleryImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={img} alt="Thumbnail" className="w-14 h-16 object-cover rounded-lg border" />
                            <button
                              type="button"
                              onClick={() => setPGalleryImages(pGalleryImages.filter((_, i) => i !== idx))}
                              className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-80 hover:opacity-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* DYNAMIC COLORS MANAGEMENT (OPTIONAL) */}
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E7E2DA] space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-[#C5A880]" /> Dynamic Color Options (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-3 py-1 bg-[#1A1A1A] text-white rounded-xl text-[11px] font-bold hover:bg-[#C5A880] flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Color
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pColors.map((col, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="color"
                            value={col.hex}
                            onChange={(e) => handleColorChange(idx, 'hex', e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                          />
                          <input
                            type="text"
                            value={col.name}
                            onChange={(e) => handleColorChange(idx, 'name', e.target.value)}
                            placeholder="Color Name e.g. White & Gold"
                            className="w-full px-2 py-1 border rounded-lg text-xs font-bold"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DYNAMIC SIZES MANAGEMENT */}
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E7E2DA] space-y-2">
                  <label className="font-bold text-gray-900 uppercase tracking-wider block mb-1">
                    Available Sizes (Select applicable)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['ONE SIZE', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'].map((sz) => {
                      const selected = pSizes.includes(sz);
                      return (
                        <button
                          type="button"
                          key={sz}
                          onClick={() => handleToggleSize(sz)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selected
                              ? 'bg-[#1A1A1A] text-white shadow-sm'
                              : 'bg-white text-gray-700 border border-[#E7E2DA] hover:border-black'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description & Rich Tabs Content */}
                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    Product Description Overview
                  </label>
                  <textarea
                    rows={2}
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    placeholder="Traditional Ethiopian handwoven cotton Netela scarf with gold and red woven borders (Tibet). Light, elegant, and versatile."
                    className="w-full px-3.5 py-2.5 border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Fabric & Care Details
                    </label>
                    <textarea
                      rows={2}
                      value={pFabricCare}
                      onChange={(e) => setPFabricCare(e.target.value)}
                      placeholder="100% Ethiopian Cotton Shemma. Dry clean or hand wash cold."
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Delivery & Returns Info
                    </label>
                    <textarea
                      rows={2}
                      value={pDeliveryInfo}
                      onChange={(e) => setPDeliveryInfo(e.target.value)}
                      placeholder="Fast delivery in Addis Ababa within 24-48 hours."
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={pIsNew}
                      onChange={(e) => setPIsNew(e.target.checked)}
                      className="rounded text-[#1A1A1A]"
                    />
                    <span>Mark as NEW ARRIVAL</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={pIsSale}
                      onChange={(e) => setPIsSale(e.target.checked)}
                      className="rounded text-red-600"
                    />
                    <span>Mark as ON SALE</span>
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-5 py-2.5 border rounded-xl font-bold hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-2.5 bg-[#1A1A1A] text-white font-bold rounded-xl hover:bg-[#C5A880] transition-colors shadow-md"
                  >
                    {editingProductId ? 'Update Product Item' : 'Save Product Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CATEGORY MODAL (Create & Edit) */}
        {showCatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-[#E7E2DA] space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-[#E7E2DA]">
                <h3 className="font-bold text-base text-[#1A1A1A]">
                  {editingCatId ? 'Edit Category' : 'Create New Category'}
                </h3>
                <button onClick={() => setShowCatModal(false)} className="text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Category Title *</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Netela & Accessories"
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Category Slug</label>
                  <input
                    type="text"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    placeholder="accessories"
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-1.5 p-3 bg-[#FAF8F5] rounded-xl border">
                  <label className="font-bold text-gray-900 block">Cover Image File / URL</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileChange(e, 'category')}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1A1A1A] file:text-white"
                  />
                  <input
                    type="text"
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    placeholder="Image URL"
                    className="w-full px-3 py-1.5 border rounded-lg bg-white"
                  />
                  {catImage && <img src={catImage} alt="Cat Preview" className="w-full h-24 object-cover rounded-lg border mt-2" />}
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Traditional handwoven scarves and accessories..."
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCatModal(false)}
                    className="px-4 py-2 border rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#1A1A1A] text-white font-bold rounded-xl hover:bg-[#C5A880]"
                  >
                    {editingCatId ? 'Update Category' : 'Save Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* RICH INSPECT PRODUCT DETAIL MODAL (Matching exact storefront detail layout) */}
        {viewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#E7E2DA] space-y-6 my-8 animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center pb-3 border-b border-[#E7E2DA]">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">
                  PRODUCT INSPECTOR & STOREFRONT PREVIEW
                </span>
                <button onClick={() => setViewProduct(null)} className="text-gray-400 hover:text-black">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Top Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left: Gallery Images */}
                <div className="space-y-4">
                  <div className="relative rounded-3xl overflow-hidden border border-[#E7E2DA] bg-[#FAF8F5]">
                    {viewProduct.badgeText && (
                      <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                        {viewProduct.badgeText}
                      </span>
                    )}
                    <img
                      src={viewSelectedImage || viewProduct.image}
                      alt={viewProduct.name}
                      className="w-full h-96 object-cover"
                    />
                  </div>

                  {/* Thumbnail Selector */}
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {[viewProduct.image, ...(viewProduct.images || [])].filter(Boolean).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setViewSelectedImage(img)}
                        className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                          viewSelectedImage === img ? 'border-black scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Product Info & Swatches */}
                <div className="space-y-5 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A880]">
                      {viewProduct.category}
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-1">
                      {viewProduct.name}
                    </h2>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-[#1A1A1A]">
                      ETB {viewProduct.price.toLocaleString()}
                    </span>
                    {viewProduct.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ETB {viewProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-amber-500 font-bold flex items-center gap-1 ml-auto">
                      <Star className="w-4 h-4 fill-amber-400" /> 4.9 (24 reviews)
                    </span>
                  </div>

                  <p className="text-gray-600 leading-relaxed">{viewProduct.description}</p>

                  {/* Color Swatches */}
                  {viewProduct.colors && viewProduct.colors.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="font-bold text-gray-800 uppercase tracking-wider block">
                        COLOR OPTIONS:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {viewProduct.colors.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E7E2DA] bg-[#FAF8F5] text-xs font-bold"
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-gray-400" style={{ backgroundColor: c.hex }} />
                            <span>{c.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {viewProduct.sizes && viewProduct.sizes.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="font-bold text-gray-800 uppercase tracking-wider block">
                        AVAILABLE SIZES:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {viewProduct.sizes.map((s, i) => (
                          <span key={i} className="px-3.5 py-2 rounded-xl bg-[#1A1A1A] text-white font-bold text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Bottom Specifications Tabs */}
              <div className="pt-6 border-t border-[#E7E2DA] space-y-4">
                <div className="flex border-b border-[#E7E2DA] gap-6 text-xs font-bold uppercase tracking-wider">
                  <button
                    onClick={() => setActiveViewTab('details')}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeViewTab === 'details' ? 'border-black text-black' : 'border-transparent text-gray-400'
                    }`}
                  >
                    Product Details
                  </button>
                  <button
                    onClick={() => setActiveViewTab('care')}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeViewTab === 'care' ? 'border-black text-black' : 'border-transparent text-gray-400'
                    }`}
                  >
                    Fabric & Care
                  </button>
                  <button
                    onClick={() => setActiveViewTab('delivery')}
                    className={`pb-2 border-b-2 transition-colors ${
                      activeViewTab === 'delivery' ? 'border-black text-black' : 'border-transparent text-gray-400'
                    }`}
                  >
                    Delivery & Returns
                  </button>
                </div>

                <div className="text-xs text-gray-600 leading-relaxed py-2">
                  {activeViewTab === 'details' && (
                    <ul className="space-y-1.5 list-disc pl-4">
                      <li>Category: {viewProduct.category}</li>
                      <li>Material: {viewProduct.material || 'Cotton Linen'}</li>
                      <li>Occasion: {viewProduct.occasion || 'Casual'}</li>
                      <li>Stock Available: {viewProduct.stockQuantity || 15} units</li>
                    </ul>
                  )}
                  {activeViewTab === 'care' && (
                    <p>{viewProduct.fabricCare || 'Traditional Ethiopian handwoven fabric. Dry clean or hand wash cold.'}</p>
                  )}
                  {activeViewTab === 'delivery' && (
                    <p>{viewProduct.deliveryInfo || 'Fast express delivery in Addis Ababa within 24-48 hours.'}</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ORDER INVOICE MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 border border-[#E7E2DA] space-y-4 my-8 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-[#E7E2DA]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#C5A880]">TELEGRAM INQUIRY INVOICE</span>
                  <h3 className="font-bold text-base font-mono text-[#1A1A1A]">{selectedOrder.orderNumber}</h3>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E7E2DA] flex justify-between">
                  <div>
                    <span className="text-gray-500 block">Customer Telegram:</span>
                    <strong className="text-[#0088cc]">@{selectedOrder.customerTelegram?.replace('@', '')}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Status:</span>
                    <strong className="uppercase text-amber-700">{selectedOrder.status}</strong>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-gray-900 uppercase">Purchased Items:</h4>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 border rounded-xl">
                      <div className="flex items-center gap-3">
                        <img src={item.product.image} alt={item.product.name} className="w-10 h-12 object-cover rounded-lg" />
                        <div>
                          <span className="font-bold block">{item.product.name}</span>
                          <span className="text-gray-500 text-[10px]">
                            {item.selectedColor.name} | Size: {item.selectedSize} | Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold">ETB {(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t flex justify-between items-center font-bold text-sm">
                  <span>Total Order Amount:</span>
                  <span className="text-base text-[#1A1A1A]">ETB {selectedOrder.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
