'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, Category, SubCategory, PropertyDefinition, PropertyOption, PropertyType, OrderInquiry, SiteSettings, ColorOption } from '../../types';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getPropertyDefinitions,
  createPropertyDefinition,
  updatePropertyDefinition,
  deletePropertyDefinition,
  updateOrderStatus,
  getProducts,
  getOrders,
  getCategories,
  getSiteSettings,
  updateSiteSettings,
  isProductInCategory,
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
  SlidersHorizontal,
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
  ChevronLeft,
  PackageCheck,
  FileText,
  Tag,
  Phone,
  Mail,
  MapPin,
  Star,
  Palette,
  Globe,
  Camera,
  Truck,
  Image as ImageIcon,
} from 'lucide-react';

/* ===== Product Atelier constants ===== */
const PA_COLOR_PRESETS: ColorOption[] = [
  { name: 'Pure White', hex: '#FAFAFA' },
  { name: 'Ivory Cream', hex: '#FAF8F5' },
  { name: 'Habesha Gold', hex: '#C5A880' },
  { name: 'Royal Gold', hex: '#D4AF37' },
  { name: 'Emerald Green', hex: '#1B4D3E' },
  { name: 'Deep Burgundy', hex: '#800020' },
  { name: 'Royal Navy', hex: '#002366' },
  { name: 'Charcoal Black', hex: '#1A1A1A' },
];
const PA_SIZE_PRESETS = ['One Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

const PaToggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }> = ({ checked, onChange, label, hint }) => (
  <div className="flex items-center justify-between gap-3 py-1">
    <div>
      <span className="text-xs font-semibold text-gray-800">{label}</span>
      {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={'relative w-10 h-[22px] rounded-full transition-colors shrink-0 ' + (checked ? 'bg-[#C5A880]' : 'bg-gray-200')}
    >
      <span className={'absolute top-[3px] w-4 h-4 bg-white rounded-full shadow transition-all ' + (checked ? 'left-[21px]' : 'left-[3px]')} />
    </button>
  </div>
);

interface Props {
  initialProducts: Product[];
  initialCategories: Category[];
  initialSubcategories?: SubCategory[];
  initialOrders: OrderInquiry[];
  initialSettings?: SiteSettings;
  initialTab?: 'overview' | 'products' | 'categories' | 'subcategories' | 'orders' | 'site';
}

export default function AdminClient({
  initialProducts,
  initialCategories,
  initialSubcategories = [],
  initialOrders,
  initialSettings,
  initialTab = 'overview',
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
  const [subcategories, setSubcategories] = useState<SubCategory[]>(initialSubcategories);
  const [orders, setOrders] = useState<OrderInquiry[]>(initialOrders);

  // Sidebar & Navigation states
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'subcategories' | 'properties' | 'orders' | 'site'>(initialTab as any);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Site Settings Form state
  const [siteForm, setSiteForm] = useState<SiteSettings>(initialSettings || siteSettings);
  const [siteSaving, setSiteSaving] = useState(false);

  // Site Image Upload states
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingPromo, setUploadingPromo] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);
  const [uploadingIgIndex, setUploadingIgIndex] = useState<number | null>(null);

  const handleUploadSiteImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof SiteSettings,
    setLoadingState: (loading: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingState(true);
    try {
      const { url, error } = await uploadImageToSupabase(file);
      if (url) {
        setSiteForm((prev) => ({ ...prev, [field]: url }));
        showToast('Image uploaded successfully!');
      } else {
        showToast(`Image upload failed: ${error || ''}`);
      }
    } catch (err: any) {
      showToast(`Upload error: ${err?.message || err}`);
    } finally {
      setLoadingState(false);
    }
  };

  const handleUploadIgImage = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIgIndex(index);
    try {
      const { url, error } = await uploadImageToSupabase(file);
      if (url) {
        setSiteForm((prev) => {
          const currentIg = [...(prev.instagramImages || [])];
          currentIg[index] = url;
          return { ...prev, instagramImages: currentIg };
        });
        showToast('Instagram photo uploaded!');
      } else {
        showToast(`Upload error: ${error || ''}`);
      }
    } catch (err: any) {
      showToast(`Upload error: ${err?.message || err}`);
    } finally {
      setUploadingIgIndex(null);
    }
  };

  const handleAddIgSlot = () => {
    setSiteForm((prev) => ({
      ...prev,
      instagramImages: [...(prev.instagramImages || []), ''],
    }));
  };

  const handleRemoveIgSlot = (index: number) => {
    setSiteForm((prev) => ({
      ...prev,
      instagramImages: (prev.instagramImages || []).filter((_, i) => i !== index),
    }));
  };

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
  const [pSubcategory, setPSubcategory] = useState('');
  const [pChildCollection, setPChildCollection] = useState(''); // Brand / child level under a Sub-Category
  const [subParent, setSubParent] = useState('');               // Sub-Category manager: optional parent slug
  const [pPrice, setPPrice] = useState('3500');
  const [pOrigPrice, setPOrigPrice] = useState('4200');
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
  const [pInStock, setPInStock] = useState(true);

  // ---- Product Atelier: variant matrix & media drag state ----
  const [variantMatrix, setVariantMatrix] = useState<Record<string, { price?: string; stock?: string; inStock: boolean }>>({});
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#C5A880');
  const [customSizeValue, setCustomSizeValue] = useState('');
  const [dragOverCover, setDragOverCover] = useState(false);
  const [pFeatured, setPFeatured] = useState(false);
  const [attrVisibility, setAttrVisibility] = useState<Record<string, boolean>>({}); // per-product attribute Active/Hidden
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
  const [catSubcategories, setCatSubcategories] = useState('');

  // SubCategory Modal state (Separate Interface Create & Edit)
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subName, setSubName] = useState('');
  const [subSlug, setSubSlug] = useState('');
  const [subCategorySlug, setSubCategorySlug] = useState('dresses');
  const [subDesc, setSubDesc] = useState('');
  const [subBadgeColor, setSubBadgeColor] = useState('#C5A880');
  const [subSaving, setSubSaving] = useState(false);
  // Dynamic Property Definition Metadata Studio state
  const [propertyDefinitions, setPropertyDefinitions] = useState<PropertyDefinition[]>([]);
  const [showPropDefModal, setShowPropDefModal] = useState(false);
  const [editingPropDefId, setEditingPropDefId] = useState<string | null>(null);
  const [defName, setDefName] = useState('');
  const [defSlug, setDefSlug] = useState('');
  const [defType, setDefType] = useState<PropertyType>('select');
  const [defDesc, setDefDesc] = useState('');
  const [defUnit, setDefUnit] = useState('');
  const [defOptions, setDefOptions] = useState<PropertyOption[]>([]);
  const [defCategoryIds, setDefCategoryIds] = useState<string[]>(['all']);
  const [defFilterable, setDefFilterable] = useState(true);
  const [defVariant, setDefVariant] = useState(false);
  const [defRequired, setDefRequired] = useState(false);
  const [defShowOnProductPage, setDefShowOnProductPage] = useState(true);
  const [defShowOnProductCard, setDefShowOnProductCard] = useState(false);
  const [defDisplayOrder, setDefDisplayOrder] = useState(1);
  const [defSaving, setDefSaving] = useState(false);

  // New option input state inside property def modal
  const [newOptName, setNewOptName] = useState('');
  const [newOptValue, setNewOptValue] = useState('');
  const [newOptHex, setNewOptHex] = useState('#1A1A1A');

  // Telegram Orders state
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [subParentFilter, setSubParentFilter] = useState<string>('all');
  const [subSearch, setSubSearch] = useState('');

  // Dynamic Product Attributes state (for Product Atelier)
  const [pAttributes, setPAttributes] = useState<Record<string, any>>({});

  // Pure Supabase & Admin Session check
  useEffect(() => {
    getPropertyDefinitions().then((data) => setPropertyDefinitions(data));
    if (!initialSubcategories || initialSubcategories.length === 0) {
      getSubcategories().then((data) => setSubcategories(data));
    }
  }, []);

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
    setPSubcategory('');
    setPOrigPrice(''); // Empty by default (Optional)
    setPDesc('Handcrafted authentic Ethiopian fashion garment.');
    setPMaterial('Ethiopian Fine Cotton');
    setPOccasion('Casual & Ceremonial');
    setPFabricCare('Traditional handwoven cotton. Hand wash cold or dry clean recommended.');
    setPDeliveryInfo('Fast delivery available in Addis Ababa within 24-48 hours.');
    setPStock('15');
    setPImage('');
    setPSecondaryImage('');
    setPGalleryImages([]);
    setPColors([
      { name: 'White & Gold', hex: '#FAF8F5' },
      { name: 'Black & Gold', hex: '#1A1A1A' },
    ]);
    setPSizes(['XS', 'S', 'M', 'L', 'XL']);
    setPIsNew(true);
    setPIsSale(false);
    setPInStock(true);
    setPAttributes({});
    setAttrVisibility({});
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setPName(prod.name);
    setPCategory(prod.category);
    setPSubcategory(prod.subcategory || '');
    setPPrice(prod.price.toString());
    setPOrigPrice(prod.originalPrice ? prod.originalPrice.toString() : '');
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
    setPInStock(prod.inStock !== false);
    setPAttributes(prod.attributes || {});
    setAttrVisibility({});
    setShowProductModal(true);
  };

  // Multi-file upload support for gallery images
  const uploadToTarget = async (files: File[], targetType: 'cover' | 'secondary' | 'gallery' | 'category') => {
    if (files.length === 0) return;
    setUploadingImg(true);
    try {
      if (targetType === 'gallery') {
        const uploadedUrls: string[] = [];
        for (const file of files) {
          const { url } = await uploadImageToSupabase(file);
          if (url) uploadedUrls.push(url);
        }
        if (uploadedUrls.length > 0) {
          setPGalleryImages((prev) => [...prev, ...uploadedUrls]);
          showToast(`${uploadedUrls.length} image(s) uploaded to Supabase Storage!`);
        }
      } else {
        const { url } = await uploadImageToSupabase(files[0]);
        if (url) {
          if (targetType === 'cover') setPImage(url);
          else if (targetType === 'secondary') setPSecondaryImage(url);
          else if (targetType === 'category') setCatImage(url);
          showToast('Image uploaded to Supabase Storage!');
        }
      }
    } finally {
      setUploadingImg(false);
    }
  };

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetType: 'cover' | 'secondary' | 'gallery' | 'category'
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadToTarget(Array.from(e.target.files), targetType);
    }
    e.target.value = '';
  };

  const handleAddColor = () => {
    setPColors([...pColors, { name: 'Pure White', hex: '#FFFFFF' }]);
  };

  const handleAddPresetColor = (preset: ColorOption) => {
    if (!pColors.some((c) => c.name === preset.name || c.hex.toLowerCase() === preset.hex.toLowerCase())) {
      setPColors([...pColors, preset]);
    }
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

  const handleSaveProduct = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (!pName.trim()) {
      showToast('Product name is required.');
      return;
    }
    if (!isDraft && !pImage) {
      showToast('Please add a cover image before publishing.');
      return;
    }

    setLoading(true);
    const hasOrigPrice = Boolean(pOrigPrice && Number(pOrigPrice) > Number(pPrice));

    // Sanitize variant dimensions at the source — never emit malformed values
    const cleanSizes = Array.from(new Set(pSizes.map((s) => String(s).trim()).filter(Boolean)));
    const cleanColors = pColors.filter((c) => c && c.name && c.hex);

    // Roll the per-variant matrix up into the catalog's shared price/stock model
    const finalPrice = matrixPrices.length > 0 ? String(Math.min(...matrixPrices)) : pPrice;
    const finalStock = matrixStocks.length > 0 ? String(matrixStocks.reduce((a, b) => a + b, 0)) : pStock;
    const finalInStock = matrixStocks.length > 0 ? activeVariantRows.some((r) => r.cell.inStock !== false) : pInStock;

    // Drop attributes the admin toggled Hidden for this product
    const savedAttributes = Object.fromEntries(
      Object.entries(pAttributes).filter(([k]) => attrVisibility[k] !== false)
    );

    const prodData: Partial<Product> = {
      name: pName.trim(),
      category: pCategory,
      subcategory: pChildCollection || pSubcategory || undefined,
      price: Number(finalPrice || (isDraft ? 2500 : 0)),
      originalPrice: hasOrigPrice ? Number(pOrigPrice) : undefined,
      description: pDesc || 'Handcrafted Habesha garment.',
      material: typeof savedAttributes.fabric === 'string' && savedAttributes.fabric ? savedAttributes.fabric : undefined,
      occasion: typeof savedAttributes.occasion === 'string' && savedAttributes.occasion ? savedAttributes.occasion : undefined,
      fabricCare: pFabricCare,
      deliveryInfo: pDeliveryInfo,
      stockQuantity: Number(finalStock || (isDraft ? 0 : 15)),
      image: pImage || '/images/hero.jpg',
      secondaryImage: pSecondaryImage || undefined,
      images: pGalleryImages.length > 0 ? pGalleryImages : [pImage].filter(Boolean),
      isNew: isDraft ? false : pIsNew,
      isSale: isDraft ? false : hasOrigPrice,
      inStock: finalInStock,
      sizes: cleanSizes,
      colors: cleanColors,
      badgeText: pFeatured ? 'FEATURED' : undefined,
      attributes: savedAttributes,
    };

    if (editingProductId) {
      const result = await updateProduct(editingProductId, prodData);
      if (result.data) {
        setProducts((prev) => prev.map((p) => (p.id === editingProductId ? { ...p, ...result.data } : p)));
      }
      showToast(isDraft ? 'Draft saved.' : `Updated product "${pName.trim()}"`);
    } else {
      const result = await createProduct(prodData);
      if (result.data) {
        setProducts((prev) => [result.data!, ...prev]);
      }
      showToast(isDraft ? 'Draft saved to catalog.' : `Created product "${pName.trim()}"`);
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

  const handleOpenAddCategory = () => {
    setEditingCatId(null);
    setCatName('');
    setCatSlug('');
    setCatImage('/images/hero.jpg');
    setCatDesc('');
    setCatSubcategories('');
    setShowCatModal(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatImage(cat.image);
    setCatDesc(cat.description || '');
    setCatSubcategories((cat.subcategories || []).join(', '));
    setShowCatModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    setLoading(true);
    const slug = catSlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const subcats = catSubcategories
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingCatId) {
      await updateCategory(editingCatId, {
        name: catName,
        slug,
        image: catImage || '/images/hero.jpg',
        description: catDesc,
        subcategories: subcats,
      });
      showToast(`Updated category "${catName}"`);
    } else {
      await createCategory({
        name: catName,
        slug,
        image: catImage || '/images/hero.jpg',
        description: catDesc,
        subcategories: subcats,
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

  // SubCategory Handlers (Separate Interface Create & Edit)
  const handleOpenAddSubcategory = () => {
    setEditingSubId(null);
    setSubName('');
    setSubSlug('');
    setSubCategorySlug(categories[0]?.slug || 'dresses');
    setSubParent('');
    setSubDesc('');
    setSubBadgeColor('#C5A880');
    setShowSubModal(true);
  };

  const handleOpenEditSubcategory = (sub: SubCategory) => {
    setEditingSubId(sub.id);
    setSubName(sub.name);
    setSubSlug(sub.slug);
    setSubCategorySlug(sub.categorySlug);
    setSubParent(sub.parentSlug || '');
    setSubDesc(sub.description || '');
    setSubBadgeColor(sub.badgeColor || '#C5A880');
    setShowSubModal(true);
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName) return;

    setSubSaving(true);
    const slug = subSlug || subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (editingSubId) {
      await updateSubcategory(editingSubId, {
        name: subName,
        slug,
        categorySlug: subCategorySlug,
        parentSlug: subParent || undefined,
        description: subDesc,
        badgeColor: subBadgeColor,
      });
      showToast(`Updated subcategory "${subName}"`);
    } else {
      await createSubcategory({
        name: subName,
        slug,
        categorySlug: subCategorySlug,
        parentSlug: subParent || undefined,
        description: subDesc,
        badgeColor: subBadgeColor,
      });
      showToast(`Created new subcategory "${subName}"`);
    }

    const updated = await getSubcategories();
    setSubcategories(updated);
    const updatedCats = await getCategories();
    setCategories(updatedCats);
    setSubSaving(false);
    setShowSubModal(false);
  };

  const handleDeleteSubcategory = async (id: string, name: string) => {
    if (confirm(`Delete subcategory style "${name}"?`)) {
      await deleteSubcategory(id);
      setSubcategories(subcategories.filter((s) => s.id !== id));
      showToast(`Deleted subcategory "${name}"`);
    }
  };

  // Attribute scoping across the full taxonomy chain: Category → Sub-Category → Child Collection.
  // An attribute shows up when bound to ANY level the product currently targets.
  const activeTaxonomyKeys = [String(pCategory), pSubcategory.trim(), pChildCollection.trim()]
    .map((k) => k.toLowerCase())
    .filter(Boolean);
  const isDefActive = (pdef: PropertyDefinition) =>
    pdef.categoryIds.includes('all') ||
    pdef.categoryIds.some((cid) => activeTaxonomyKeys.includes(cid.toLowerCase()));

  // Property Definition Metadata Studio Handlers
  const handleOpenAddPropDef = () => {
    setEditingPropDefId(null);
    setDefName('');
    setDefSlug('');
    setDefType('select');
    setDefDesc('');
    setDefUnit('');
    setDefOptions([]);
    setDefCategoryIds(['all']);
    setDefFilterable(true);
    setDefVariant(false);
    setDefRequired(false);
    setDefShowOnProductPage(true);
    setDefShowOnProductCard(false);
    setDefDisplayOrder(propertyDefinitions.length + 1);
    setNewOptName('');
    setNewOptValue('');
    setNewOptHex('#1A1A1A');
    setShowPropDefModal(true);
  };

  const handleOpenEditPropDef = (pdef: PropertyDefinition) => {
    setEditingPropDefId(pdef.id);
    setDefName(pdef.name);
    setDefSlug(pdef.slug);
    setDefType(pdef.type);
    setDefDesc(pdef.description || '');
    setDefUnit(pdef.unit || '');
    setDefOptions(pdef.options || []);
    setDefCategoryIds(pdef.categoryIds || ['all']);
    setDefFilterable(pdef.filterable);
    setDefVariant(pdef.variant);
    setDefRequired(pdef.required);
    setDefShowOnProductPage(pdef.showOnProductPage);
    setDefShowOnProductCard(pdef.showOnProductCard);
    setDefDisplayOrder(pdef.displayOrder || 1);
    setNewOptName('');
    setNewOptValue('');
    setNewOptHex('#1A1A1A');
    setShowPropDefModal(true);
  };

  const handleAddPropDefOption = () => {
    if (!newOptName.trim()) return;
    const optVal = newOptValue.trim() || newOptName.trim();
    const newOpt: PropertyOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newOptName.trim(),
      value: optVal,
      hex: defType === 'color' ? newOptHex : undefined,
    };
    setDefOptions([...defOptions, newOpt]);
    setNewOptName('');
    setNewOptValue('');
  };

  const handleRemovePropDefOption = (id: string) => {
    setDefOptions(defOptions.filter((o) => o.id !== id));
  };

  const handleToggleDefCategory = (catSlug: string) => {
    if (catSlug === 'all') {
      setDefCategoryIds(['all']);
      return;
    }
    const currentWithoutAll = defCategoryIds.filter((c) => c !== 'all');
    if (currentWithoutAll.includes(catSlug)) {
      const next = currentWithoutAll.filter((c) => c !== catSlug);
      setDefCategoryIds(next.length === 0 ? ['all'] : next);
    } else {
      setDefCategoryIds([...currentWithoutAll, catSlug]);
    }
  };

  const handleSavePropDef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!defName.trim()) return;

    setDefSaving(true);
    const slug = defSlug.trim() || defName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const propData: Partial<PropertyDefinition> = {
      name: defName.trim(),
      slug,
      type: defType,
      description: defDesc,
      unit: defUnit,
      options: defOptions,
      categoryIds: defCategoryIds,
      filterable: defFilterable,
      variant: defVariant,
      required: defRequired,
      showOnProductPage: defShowOnProductPage,
      showOnProductCard: defShowOnProductCard,
      displayOrder: Number(defDisplayOrder) || 1,
    };

    if (editingPropDefId) {
      await updatePropertyDefinition(editingPropDefId, propData);
      showToast(`Updated property definition "${defName}"`);
    } else {
      await createPropertyDefinition(propData);
      showToast(`Created new property definition "${defName}"`);
    }

    const updated = await getPropertyDefinitions();
    setPropertyDefinitions(updated);
    setShowPropDefModal(false);
    setDefSaving(false);
  };

  const handleDeletePropDef = async (id: string, name: string) => {
    if (confirm(`Delete property definition "${name}"? Stores and filters will automatically update.`)) {
      await deletePropertyDefinition(id);
      setPropertyDefinitions(propertyDefinitions.filter((p) => p.id !== id));
      showToast(`Deleted property "${name}"`);
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

  // ---- Variant combinations (Color × Size) ----
  const variantCombos =
    pColors.length > 0 && pSizes.length > 0
      ? pColors.flatMap((c) => pSizes.map((s) => ({ color: c, size: s })))
      : [];
  const hasVariants = variantCombos.length > 0;
  const getCell = (k: string) => variantMatrix[k] || { price: '', stock: '', inStock: true };
  const setCell = (k: string, patch: Partial<{ price?: string; stock?: string; inStock: boolean }>) =>
    setVariantMatrix((m) => ({ ...m, [k]: { ...getCell(k), ...patch } }));
  const activeVariantRows = variantCombos.map(({ color, size }) => ({
    key: color.name + '/' + size,
    color,
    size,
    cell: getCell(color.name + '/' + size),
  }));
  const matrixPrices = activeVariantRows.map((r) => parseFloat(r.cell.price || '')).filter((n) => !isNaN(n) && n > 0);
  const matrixStocks = activeVariantRows.map((r) => parseInt(r.cell.stock || '', 10)).filter((n) => !isNaN(n) && n >= 0);

  const toggleVariantColor = (c: ColorOption) =>
    setPColors((prev) => (prev.some((x) => x.name === c.name) ? prev.filter((x) => x.name !== c.name) : [...prev, c]));
  const toggleVariantSize = (s: string) =>
    setPSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const addCustomVariantColor = () => {
    const name = customColorName.trim();
    if (!name) return;
    toggleVariantColor({ name, hex: customColorHex });
    setCustomColorName('');
  };
  const addCustomVariantSize = () => {
    const v = customSizeValue.trim().toUpperCase();
    if (v && !pSizes.includes(v)) setPSizes((prev) => [...prev, v]);
    setCustomSizeValue('');
  };
  const moveGalleryImage = (idx: number, dir: -1 | 1) =>
    setPGalleryImages((arr) => {
      const a = [...arr];
      const j = idx + dir;
      if (j < 0 || j >= a.length) return a;
      [a[idx], a[j]] = [a[j], a[idx]];
      return a;
    });
  const removeGalleryImage = (idx: number) => setPGalleryImages((arr) => arr.filter((_, i) => i !== idx));

  // Stats Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrdersCount = orders.filter((o) => !o.status || o.status === 'Telegram Pending').length;

  const navMenuItems = [
    { id: 'overview', label: 'Overview & Stats', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Inventory', icon: ShoppingBag, badge: products.length },
    { id: 'categories', label: 'Categories', icon: Layers, badge: categories.length },
    { id: 'subcategories', label: 'Sub-Categories / Styles', icon: Tag, badge: subcategories.length },
    { id: 'orders', label: 'Telegram Orders', icon: Send, badge: pendingOrdersCount ? `${pendingOrdersCount} pending` : orders.length },
    { id: 'site', label: 'Site Content & Hero', icon: Sliders },
  ];

  const handleTabClick = (tabId: 'overview' | 'products' | 'categories' | 'subcategories' | 'orders' | 'site') => {
    setActiveTab(tabId);
    setMobileSidebarOpen(false);
    if (tabId === 'overview') {
      router.push('/admin');
    } else {
      router.push(`/admin/${tabId}`);
    }
  };

  // ---- Sub-Categories table data ----
  const q = subSearch.trim().toLowerCase();
  const matchedSubs = subcategories.filter((sub) => {
    if (subParentFilter !== 'all') {
      const pc = categories.find((c) => c.slug === subParentFilter);
      if (!(sub.categorySlug.toLowerCase() === subParentFilter.toLowerCase() || (pc && sub.categorySlug.toLowerCase() === pc.name.toLowerCase()))) return false;
    }
    if (!q) return true;
    return sub.name.toLowerCase().includes(q) || (sub.slug || '').toLowerCase().includes(q) || (sub.description || '').toLowerCase().includes(q);
  });
  const orderedSubRows: { sub: SubCategory; isChild: boolean; parentName?: string }[] = [];
  matchedSubs.filter((s) => !s.parentSlug).forEach((parent) => {
    orderedSubRows.push({ sub: parent, isChild: false });
    matchedSubs.filter((c) => c.parentSlug && (c.parentSlug === parent.slug || c.parentSlug.toLowerCase() === parent.name.toLowerCase())).forEach((child) => orderedSubRows.push({ sub: child, isChild: true, parentName: parent.name }));
  });
  matchedSubs.filter((s) => s.parentSlug && !orderedSubRows.some((r) => r.sub.id === s.id)).forEach((s) => orderedSubRows.push({ sub: s, isChild: true, parentName: s.parentSlug }));
  const liveSubCount = (sub: SubCategory) => products.filter((p) => { const pSub = (p.subcategory || '').toLowerCase(); const s = sub.name.toLowerCase(); return pSub.includes(s) || s.includes(pSub); }).length;

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
    <div className="hiwi-admin min-h-screen bg-[#FAF8F5] flex flex-col lg:flex-row font-sans">
      
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
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-80" title="Visit Storefront Website">
            <div>
              <h2 className="font-serif text-lg font-bold tracking-wider text-white uppercase flex items-center gap-1">
                Hiwi Fashion <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
              </h2>
              <span className="text-[9px] text-[#C5A880] uppercase tracking-widest block -mt-1">
                Admin Console
              </span>
            </div>
          </Link>
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
          
          {/* Brand Header (Clickable Link to Public Storefront) */}
          <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
            <Link href="/" className="group cursor-pointer block" title="Visit Storefront Website">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#C5A880] group-hover:underline block">
                {siteSettings?.tagline}
              </span>
              <h1 className="font-serif text-2xl font-bold text-white tracking-wider uppercase flex items-center gap-2 group-hover:text-[#C5A880] transition-colors">
               {siteSettings?.siteName} <ExternalLink className="w-4 h-4 text-[#C5A880]" />
              </h1>
              <p className="text-[11px] text-gray-400 mt-0.5">Admin Management Console</p>
            </Link>
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
                  <CheckCircle className="w-2.5 h-2.5" /> Admin
                </span>
              </div>
            </div>
          </div>

          <span className="text-[9px] font-bold tracking-[0.3em] text-zinc-600 uppercase px-1">Manage</span>
          <nav className="space-y-1">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
          <Link
            href="/"
            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-[#C5A880] hover:text-black text-gray-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Go to Storefront Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
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
              
              <div className="adm-card p-6 space-y-3">
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

              <div className="adm-card p-6 space-y-3">
                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <span>Telegram Orders</span>
                  <div className="w-9 h-9 rounded-2xl bg-sky-100 text-[#0088cc] flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#1A1A1A]">{orders.length}</div>
                <p className="text-[11px] text-amber-600 font-semibold">{pendingOrdersCount} pending confirmation</p>
              </div>

              <div className="adm-card p-6 space-y-3">
                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <span>Active Products</span>
                  <div className="w-9 h-9 rounded-2xl bg-amber-100 text-[#C5A880] flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#1A1A1A]">{products.length}</div>
                <p className="text-[11px] text-gray-400">Catalog items in Supabase</p>
              </div>

              <div className="adm-card p-6 space-y-3">
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
            <div className="adm-card p-6 space-y-4">
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
              {categories.map((cat) => {
                const liveCount = products.filter((p) => isProductInCategory(p.category, cat.slug, cat.name)).length;

                return (
                  <div key={cat.id} className="bg-white rounded-3xl p-5 border border-[#E7E2DA] shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <img src={cat.image} alt={cat.name} className="w-full h-40 object-cover rounded-2xl border" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#C5A880] tracking-wider block">
                          {cat.slug}
                        </span>
                        <h3 className="font-bold text-base text-[#1A1A1A]">{cat.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description || 'Fashion collection'}</p>

                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {cat.subcategories.map((sc) => (
                              <span key={sc} className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-md text-[10px] font-semibold text-gray-700">
                                {sc}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E7E2DA] flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        {liveCount} Active Products
                      </span>
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
                );
              })}
            </div>
          </div>
        )}

        {/* SUBCATEGORIES & STYLE FILTERS MANAGEMENT TAB */}
        {activeTab === 'subcategories' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">Sub-Categories & Style Filters</h2>
                <p className="text-xs text-gray-500 mt-1">Dedicated management for storefront style tags, filter badges, and taxonomy groups</p>
              </div>

              <button
                onClick={handleOpenAddSubcategory}
                className="px-5 py-3 bg-[#1A1A1A] hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-colors shadow-md flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Sub-Category / Style</span>
              </button>
            </div>

            {/* Toolbar */}
            <div className="adm-card p-3 flex flex-col md:flex-row gap-3 md:items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={subSearch} onChange={(e) => setSubSearch(e.target.value)} placeholder="Search by name, slug or description…" className="w-full pl-9 pr-3 py-2.5 text-xs font-medium" />
              </div>
              <select value={subParentFilter} onChange={(e) => setSubParentFilter(e.target.value)} className="md:w-56 px-3 py-2.5 text-xs font-semibold cursor-pointer">
                <option value="all">All main categories ({subcategories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name} ({subcategories.filter((s) => s.categorySlug.toLowerCase() === c.slug.toLowerCase()).length})</option>
                ))}
              </select>
              {(subSearch || subParentFilter !== 'all') && (
                <button onClick={() => { setSubSearch(''); setSubParentFilter('all'); }} className="text-[11px] font-bold text-gray-500 hover:text-[#C5A880] flex items-center gap-1 shrink-0">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Table */}
            <div className="adm-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-xs">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100 bg-[#FAFAF8]">
                      <th className="px-5 py-3 font-semibold">Name</th>
                      <th className="px-5 py-3 font-semibold">Slug</th>
                      <th className="px-5 py-3 font-semibold">Main Category</th>
                      <th className="px-5 py-3 font-semibold">Hierarchy</th>
                      <th className="px-5 py-3 font-semibold text-center">Products</th>
                      <th className="px-5 py-3 font-semibold text-right pr-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orderedSubRows.map(({ sub, isChild, parentName }) => {
                      const parentCat = categories.find((c) => c.slug.toLowerCase() === sub.categorySlug.toLowerCase() || c.name.toLowerCase() === sub.categorySlug.toLowerCase());
                      const count = liveSubCount(sub);
                      return (
                        <tr key={sub.id} className="group hover:bg-[#FBF9F5]/70 transition-colors">
                          <td className="px-5 py-3">
                            <div className={'flex items-center gap-2 ' + (isChild ? 'pl-5' : '')}>
                              {isChild && <span className="text-gray-300 text-[10px]">↳</span>}
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: sub.badgeColor || '#C5A880' }} />
                              <span className="font-bold text-[#1A1A1A]">{sub.name}</span>
                            </div>
                            {sub.description && <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{sub.description}</p>}
                          </td>
                          <td className="px-5 py-3 font-mono text-[11px] text-gray-400">/{sub.slug}</td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 text-[10px] font-semibold">{parentCat?.name || sub.categorySlug}</span>
                          </td>
                          <td className="px-5 py-3">
                            {isChild ? (
                              <span className="text-[11px] text-gray-500">Child of <span className="font-semibold text-gray-700">{parentName || sub.parentSlug}</span></span>
                            ) : (
                              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Top level</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={'inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ' + (count > 0 ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-400')}>{count}</span>
                          </td>
                          <td className="px-5 py-3 text-right pr-5">
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenEditSubcategory(sub)} className="p-2 text-gray-500 hover:text-[#C5A880] hover:bg-[#C5A880]/10 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteSubcategory(sub.id, sub.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {orderedSubRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center">
                          <Tag className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                          <p className="text-xs text-gray-500 font-medium">No sub-categories match your search.</p>
                          <button onClick={() => { setSubSearch(''); setSubParentFilter('all'); }} className="text-[11px] font-bold text-[#C5A880] hover:underline mt-1">Clear filters</button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* UNIFIED ATTRIBUTES NOTICE */}
            <div className="pt-8">
              <div className="p-5 bg-gradient-to-r from-amber-50/80 to-transparent rounded-2xl border border-amber-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-[#1A1A1A]">Materials, Fabrics, Occasions & every other property live in one place.</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xl">
                    The old separate Material/Occasion lists are retired. Create unlimited attributes (with options, colors,
                    ranges and per-category binding) in the <span className="font-bold">Product Properties Studio</span> tab below.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('properties')}
                  className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#C5A880] hover:text-black text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shrink-0"
                >
                  Open Attribute Manager
                </button>
              </div>
            </div>

          </div>
        )}

        {/* PRODUCT PROPERTIES STUDIO TAB (METADATA-DRIVEN SCHEMA MANAGER) */}
        {activeTab === 'properties' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#E7E2DA] shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                    Metadata Architecture
                  </span>
                  <span className="text-xs text-gray-400 font-bold">• Admin Schema Control</span>
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#1A1A1A] mt-1">Product Properties Studio</h2>
                <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                  Decoupled product attributes system. Define custom schema properties (e.g., Size, Sleeve Type, Material, Heel Height) and map them to categories and automated storefront filters.
                </p>
              </div>

              <button
                onClick={handleOpenAddPropDef}
                className="px-5 py-3 bg-[#1A1A1A] hover:bg-[#C5A880] text-white hover:text-black text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Property Definition</span>
              </button>
            </div>

            {/* Property Definitions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertyDefinitions.map((pdef) => (
                <div
                  key={pdef.id}
                  className="bg-white rounded-3xl p-6 border border-[#E7E2DA] hover:border-[#C5A880] transition-all shadow-xs flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider">
                          slug: {pdef.slug}
                        </span>
                        <h3 className="font-bold text-lg text-[#1A1A1A] group-hover:text-[#C5A880] transition-colors">
                          {pdef.name}
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] text-[11px] font-extrabold uppercase text-[#1A1A1A]">
                        {pdef.type} {pdef.unit ? `(${pdef.unit})` : ''}
                      </span>
                    </div>

                    {pdef.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{pdef.description}</p>
                    )}

                    {/* Pre-defined Options preview */}
                    {pdef.options && pdef.options.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          Configured Options ({pdef.options.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                          {pdef.options.map((opt) => (
                            <span
                              key={opt.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-[11px] font-bold text-gray-700"
                            >
                              {opt.hex && (
                                <span
                                  className="w-3 h-3 rounded-full border border-black/20"
                                  style={{ backgroundColor: opt.hex }}
                                />
                              )}
                              <span>{opt.name}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Categories Assignment Badges */}
                    <div className="space-y-1 pt-2 border-t border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Assigned Categories:</span>
                      <div className="flex flex-wrap gap-1">
                        {pdef.categoryIds.includes('all') ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                            All Categories
                          </span>
                        ) : (
                          pdef.categoryIds.map((cId) => (
                            <span
                              key={cId}
                              className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 text-[10px] font-bold uppercase"
                            >
                              {cId}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Settings Flags & Action Controls */}
                  <div className="pt-4 border-t border-[#E7E2DA] flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {pdef.filterable && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Filterable
                        </span>
                      )}
                      {pdef.variant && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                          Variant
                        </span>
                      )}
                      {pdef.showOnProductCard && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                          On Card
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditPropDef(pdef)}
                        className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-all"
                        title="Edit Configuration"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePropDef(pdef.id, pdef.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Property"
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

            <form onSubmit={handleSaveSiteSettings} className="space-y-8 text-xs">
              
              {/* SECTION 1: BRAND & HERO SETTINGS */}
              <div className="space-y-4 border-b border-[#E7E2DA] pb-6">
                <h4 className="font-bold text-sm text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C5A880]" /> Brand Identity & Hero Section
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Store Brand Name
                    </label>
                    <input
                      type="text"
                      value={siteForm.siteName || ''}
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
                      value={siteForm.tagline || ''}
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
                    value={siteForm.announcementBar || ''}
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
                    value={siteForm.heroHeadline || ''}
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
                    value={siteForm.heroSubtitle || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, heroSubtitle: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hero Cover Image Upload */}
                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Hero Cover Image Upload
                    </label>
                    <div className="space-y-2">
                      {siteForm.heroImageUrl && (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-[#E7E2DA]">
                          <img
                            src={siteForm.heroImageUrl}
                            alt="Hero Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <label className="flex-1 px-4 py-2.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl cursor-pointer hover:bg-gray-100 flex items-center justify-center gap-2 text-xs font-bold text-gray-700">
                          {uploadingHero ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                              <span>Uploading Hero Image...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-[#C5A880]" />
                              <span>{siteForm.heroImageUrl ? 'Change Hero Image' : 'Upload Hero Image'}</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadSiteImage(e, 'heroImageUrl', setUploadingHero)}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={siteForm.heroImageUrl || ''}
                        onChange={(e) => setSiteForm({ ...siteForm, heroImageUrl: e.target.value })}
                        placeholder="or paste image URL"
                        className="w-full px-3 py-1.5 border rounded-lg text-gray-500 text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Telegram Seller Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400 font-bold">@</span>
                      <input
                        type="text"
                        value={siteForm.telegramUsername || ''}
                        onChange={(e) => setSiteForm({ ...siteForm, telegramUsername: e.target.value })}
                        className="w-full pl-7 pr-3 py-2.5 border rounded-xl font-bold text-[#0088cc]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: SEO & METADATA CONFIGURATION */}
              <div className="space-y-4 border-b border-[#E7E2DA] pb-6">
                <h4 className="font-bold text-sm text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#0088cc]" /> SEO & Search Engine Optimization
                </h4>
                <p className="text-gray-500 text-[11px]">
                  Custom meta titles, descriptions, keywords, and social preview images for search engines (Google, Bing) and social platforms.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      SEO Meta Title
                    </label>
                    <input
                      type="text"
                      value={siteForm.seoTitle || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, seoTitle: e.target.value })}
                      placeholder="Hiwi Fashion | Authentic Habesha Kemis & Modern Atelier (ETB)"
                      className="w-full px-3 py-2.5 border rounded-xl font-medium"
                    />
                  </div>

                  {/* SEO Social OpenGraph Image Upload */}
                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Social OpenGraph Preview Image Upload
                    </label>
                    <div className="space-y-2">
                      {siteForm.seoOgImage && (
                        <div className="relative w-full h-24 rounded-xl overflow-hidden border border-[#E7E2DA]">
                          <img
                            src={siteForm.seoOgImage}
                            alt="Social Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <label className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl cursor-pointer hover:bg-gray-100 flex items-center justify-center gap-2 text-xs font-bold text-gray-700">
                        {uploadingOg ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                            <span>Uploading Social Image...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-[#0088cc]" />
                            <span>{siteForm.seoOgImage ? 'Change Social Card Image' : 'Upload Social Card Image'}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadSiteImage(e, 'seoOgImage', setUploadingOg)}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={siteForm.seoOgImage || ''}
                        onChange={(e) => setSiteForm({ ...siteForm, seoOgImage: e.target.value })}
                        placeholder="or paste image URL"
                        className="w-full px-3 py-1.5 border rounded-lg text-gray-500 text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    SEO Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={siteForm.seoDescription || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, seoDescription: e.target.value })}
                    placeholder="Handcrafted Habesha Kemis dresses, fine Shemma Netelas, and modern fashion garments in Ethiopia."
                    className="w-full px-3 py-2.5 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    SEO Keywords (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={siteForm.seoKeywords || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, seoKeywords: e.target.value })}
                    placeholder="habesha kemis, ethiopian dress, shemma netela, etb fashion"
                    className="w-full px-3 py-2.5 border rounded-xl"
                  />
                </div>
              </div>

              {/* SECTION 3: DYNAMIC MINI CARDS (FEATURE HIGHLIGHTS) */}
              <div className="space-y-4 border-b border-[#E7E2DA] pb-6">
                <h4 className="font-bold text-sm text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" /> Homepage Feature Bar (4 Mini Cards)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1 */}
                  <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E7E2DA] space-y-2">
                    <span className="font-bold text-gray-700 block">Mini Card 1</span>
                    <input
                      type="text"
                      value={siteForm.miniCard1Title || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, miniCard1Title: e.target.value })}
                      placeholder="LOCAL DELIVERY"
                      className="w-full px-3 py-2 border rounded-xl font-bold"
                    />
                    <input
                      type="text"
                      value={siteForm.miniCard1Desc || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, miniCard1Desc: e.target.value })}
                      placeholder="Free in Addis Ababa over ETB 2,500"
                      className="w-full px-3 py-2 border rounded-xl text-gray-600"
                    />
                  </div>

                  {/* Card 2 */}
                  <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E7E2DA] space-y-2">
                    <span className="font-bold text-gray-700 block">Mini Card 2</span>
                    <input
                      type="text"
                      value={siteForm.miniCard2Title || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, miniCard2Title: e.target.value })}
                      placeholder="DIRECT INQUIRE & BUY"
                      className="w-full px-3 py-2 border rounded-xl font-bold"
                    />
                    <input
                      type="text"
                      value={siteForm.miniCard2Desc || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, miniCard2Desc: e.target.value })}
                      placeholder="100% instant inbox order confirmation"
                      className="w-full px-3 py-2 border rounded-xl text-gray-600"
                    />
                  </div>

                  {/* Card 3 */}
                  <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E7E2DA] space-y-2">
                    <span className="font-bold text-gray-700 block">Mini Card 3</span>
                    <input
                      type="text"
                      value={siteForm.miniCard3Title || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, miniCard3Title: e.target.value })}
                      placeholder="FITTING GUARANTEE"
                      className="w-full px-3 py-2 border rounded-xl font-bold"
                    />
                    <input
                      type="text"
                      value={siteForm.miniCard3Desc || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, miniCard3Desc: e.target.value })}
                      placeholder="Easy exchange & size customization"
                      className="w-full px-3 py-2 border rounded-xl text-gray-600"
                    />
                  </div>

                  {/* Card 4 */}
                  <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E7E2DA] space-y-2">
                    <span className="font-bold text-gray-700 block">Mini Card 4</span>
                    <input
                      type="text"
                      value={siteForm.miniCard4Title || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, miniCard4Title: e.target.value })}
                      placeholder="CUSTOMER CONCIERGE"
                      className="w-full px-3 py-2 border rounded-xl font-bold"
                    />
                    <input
                      type="text"
                      value={siteForm.miniCard4Desc || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, miniCard4Desc: e.target.value })}
                      placeholder="24/7 direct seller support in ETB"
                      className="w-full px-3 py-2 border rounded-xl text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: DYNAMIC PROMO AD BANNER */}
              <div className="space-y-4 border-b border-[#E7E2DA] pb-6">
                <h4 className="font-bold text-sm text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-600" /> Dynamic Promo Ad Banner
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Banner Headline
                    </label>
                    <input
                      type="text"
                      value={siteForm.promoBannerHeadline || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, promoBannerHeadline: e.target.value })}
                      placeholder="Crafted for Every Special Moment"
                      className="w-full px-3 py-2.5 border rounded-xl font-bold"
                    />
                  </div>

                  {/* Promo Ad Banner Image Upload */}
                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Promo Ad Banner Image Upload
                    </label>
                    <div className="space-y-2">
                      {siteForm.promoBannerImage && (
                        <div className="relative w-full h-24 rounded-xl overflow-hidden border border-[#E7E2DA]">
                          <img
                            src={siteForm.promoBannerImage}
                            alt="Banner Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <label className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl cursor-pointer hover:bg-gray-100 flex items-center justify-center gap-2 text-xs font-bold text-gray-700">
                        {uploadingPromo ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                            <span>Uploading Promo Image...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-amber-600" />
                            <span>{siteForm.promoBannerImage ? 'Change Banner Image' : 'Upload Banner Image'}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadSiteImage(e, 'promoBannerImage', setUploadingPromo)}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={siteForm.promoBannerImage || ''}
                        onChange={(e) => setSiteForm({ ...siteForm, promoBannerImage: e.target.value })}
                        placeholder="or paste image URL"
                        className="w-full px-3 py-1.5 border rounded-lg text-gray-500 text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    Banner Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={siteForm.promoBannerSubtitle || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, promoBannerSubtitle: e.target.value })}
                    placeholder="From traditional Ethiopian celebrations to casual everyday wear."
                    className="w-full px-3 py-2.5 border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Button CTA Text
                    </label>
                    <input
                      type="text"
                      value={siteForm.promoBannerCtaText || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, promoBannerCtaText: e.target.value })}
                      placeholder="DISCOVER COLLECTION"
                      className="w-full px-3 py-2.5 border rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Button CTA Link
                    </label>
                    <input
                      type="text"
                      value={siteForm.promoBannerCtaLink || ''}
                      onChange={(e) => setSiteForm({ ...siteForm, promoBannerCtaLink: e.target.value })}
                      placeholder="/catalog"
                      className="w-full px-3 py-2.5 border rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: INSTAGRAM SHOWCASE */}
              <div className="space-y-4 border-b border-[#E7E2DA] pb-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                    <Camera className="w-4 h-4 text-purple-600" /> Dynamic Instagram Showcase Photos
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddIgSlot}
                    className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-xs font-bold text-purple-700 hover:bg-purple-50 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo Slot</span>
                  </button>
                </div>

                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    Instagram Account Handle
                  </label>
                  <input
                    type="text"
                    value={siteForm.instagramHandle || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, instagramHandle: e.target.value })}
                    placeholder="@HIWI.FASHION"
                    className="w-full px-3 py-2.5 border rounded-xl font-bold text-purple-600"
                  />
                </div>

                {/* Photo Grid with Direct Uploads per item */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
                  {(siteForm.instagramImages && siteForm.instagramImages.length > 0
                    ? siteForm.instagramImages
                    : [
                        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
                        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
                        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600',
                        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600',
                        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
                        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600',
                      ]
                  ).map((imgUrl, idx) => (
                    <div key={idx} className="relative bg-white p-2 rounded-2xl border border-[#E7E2DA] space-y-2 group">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        {imgUrl ? (
                          <img src={imgUrl} alt={`IG ${idx + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Empty
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveIgSlot(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-80 hover:opacity-100 shadow-sm"
                          title="Remove Photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      <label className="w-full py-1.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl cursor-pointer hover:bg-gray-100 flex items-center justify-center gap-1 text-[10px] font-bold text-gray-700">
                        {uploadingIgIndex === idx ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-purple-600" />
                        ) : (
                          <Upload className="w-3 h-3 text-purple-600" />
                        )}
                        <span>{imgUrl ? 'Change' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadIgImage(e, idx)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 6: CONTACT & FOOTER */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" /> Store Contact & Footer Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={siteForm.contactPhone || ''}
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
                      value={siteForm.contactEmail || ''}
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
                      value={siteForm.storeLocation || ''}
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
                    value={siteForm.footerAboutText || ''}
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
                    value={siteForm.footerCopyright || ''}
                    onChange={(e) => setSiteForm({ ...siteForm, footerCopyright: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E7E2DA]">
                <button
                  type="submit"
                  disabled={siteSaving}
                  className="px-8 py-3.5 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-[#C5A880] transition-colors shadow-lg flex items-center gap-2"
                >
                  {siteSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>Save All Site Content & SEO Settings</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* COMPREHENSIVE ADD & EDIT PRODUCT FORM MODAL */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-5 sm:p-8 space-y-0 my-auto max-h-[85vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
              
{/* Page Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-5 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="mt-0.5 p-2 -ml-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
                    title="Back to Products"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <span className="adm-kicker">Products</span>
                    <h3 className="font-serif text-xl text-[#1A1A1A] leading-tight mt-0.5">Product Atelier</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {editingProductId ? 'Edit and configure this product' : 'Create and configure a new product'}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-8">

                {/* 01 BASIC INFORMATION */}
                <section className="space-y-4">
                  <div className="adm-section-head">
                    <span className="adm-kicker">01</span>
                    <strong>Basic Information</strong>
                  </div>

                  <div>
                    <label className="block mb-1.5">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="e.g. Handwoven Shemma Netela Scarf"
                      className="w-full px-3.5 py-2.5 font-semibold text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1.5">Main Category *</label>
                      <select
                        value={pCategory}
                        onChange={(e) => {
                          setPCategory(e.target.value);
                          setPSubcategory('');
                          setPChildCollection('');
                        }}
                        className="w-full px-3.5 py-2.5 font-semibold cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1.5">Subcategory / Style</label>
                      {(() => {
                        const activeCatObj = categories.find(
                          (c) => c.slug === pCategory || c.name.toLowerCase() === pCategory.toLowerCase()
                        );
                        const managed = subcategories
                          .filter(
                            (s) =>
                              s.categorySlug.toLowerCase() === pCategory.toLowerCase() ||
                              (activeCatObj && s.categorySlug.toLowerCase() === activeCatObj.slug.toLowerCase())
                          )
                          .map((s) => s.name);
                        const opts = Array.from(new Set([...(activeCatObj?.subcategories || []), ...managed]));
                        const chosenSub = subcategories.find((s) => s.name === pSubcategory || s.slug === pSubcategory);
                        const children = pSubcategory
                          ? subcategories.filter(
                              (s) =>
                                s.parentSlug &&
                                (s.parentSlug === chosenSub?.slug || s.parentSlug.toLowerCase() === pSubcategory.toLowerCase())
                            )
                          : [];
                        return (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              list="pa-subcat-options"
                              value={pSubcategory}
                              onChange={(e) => { setPSubcategory(e.target.value); setPChildCollection(''); }}
                              placeholder={opts.length > 0 ? 'Select or type…' : 'e.g. Traditional Habesha Kemis'}
                              className="w-full px-3.5 py-2.5 font-medium"
                            />
                            <datalist id="pa-subcat-options">
                              {opts.map((sc) => <option key={sc} value={sc} />)}
                            </datalist>
                            {children.length > 0 && (
                              <select
                                value={pChildCollection}
                                onChange={(e) => setPChildCollection(e.target.value)}
                                className="w-full px-3 py-2 font-medium"
                              >
                                <option value="">-- Child collection / brand (optional) --</option>
                                {children.map((ch) => <option key={ch.id} value={ch.name}>{ch.name}</option>)}
                              </select>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </section>

                {/* 02 PRODUCT MEDIA */}
                <section className="space-y-4">
                  <div className="adm-section-head">
                    <span className="adm-kicker">02</span>
                    <strong>Product Media</strong>
                    {uploadingImg && (
                      <span className="ml-auto text-[10px] bg-[#C5A880]/15 text-[#A88B64] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Uploading…
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    <div className="lg:col-span-2">
                      <label className="block mb-1.5">Cover Image *</label>
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOverCover(true); }}
                        onDragLeave={() => setDragOverCover(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverCover(false);
                          const f = e.dataTransfer.files?.[0];
                          if (f) uploadToTarget([f], 'cover');
                        }}
                        onClick={() => document.getElementById('pa-cover-input')?.click()}
                        className={
                          'relative rounded-2xl border-2 border-dashed cursor-pointer transition-colors overflow-hidden group ' +
                          (dragOverCover ? 'border-[#C5A880] bg-[#C5A880]/5' : 'border-gray-200 hover:border-[#C5A880]/60 bg-[#FBFAF7]')
                        }
                      >
                        {pImage ? (
                          <>
                            <img src={pImage} alt="Cover preview" className="w-full aspect-[3/4] object-cover" />
                            <div className="absolute inset-x-0 bottom-0 p-2 flex gap-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="flex-1 py-1.5 text-center text-[11px] font-bold text-white bg-black/50 hover:bg-black/70 rounded-lg">Replace</span>
                              <span
                                onClick={(ev) => { ev.stopPropagation(); setPImage(''); }}
                                className="py-1.5 px-3 text-[11px] font-bold text-red-300 hover:text-red-100 bg-black/50 hover:bg-black/70 rounded-lg"
                              >
                                Remove
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="py-12 flex flex-col items-center justify-center gap-1.5 text-center px-4">
                            <ImageIcon className="w-8 h-8 text-gray-300" />
                            <p className="text-xs font-bold text-gray-600 mt-1">Upload Cover Image</p>
                            <p className="text-[10px] text-gray-400">Drag &amp; drop or browse</p>
                            <p className="text-[9px] text-gray-300 uppercase tracking-wider">PNG · JPG · WEBP</p>
                          </div>
                        )}
                      </div>
                      <input id="pa-cover-input" type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleImageFileChange(e, 'cover')} />
                      <input type="text" value={pImage} onChange={(e) => setPImage(e.target.value)} placeholder="…or paste an image URL" className="w-full px-3 py-2 mt-2 text-[11px]" />
                    </div>

                    <div className="lg:col-span-3">
                      <label className="block mb-1.5">Gallery Images</label>
                      <label
                        htmlFor="pa-gallery-input"
                        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#C5A880]/60 bg-[#FBFAF7] py-6 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-600">Add photos</span>
                        <span className="text-[10px] text-gray-300 uppercase hidden sm:inline">JPG · PNG · WEBP</span>
                      </label>
                      <input id="pa-gallery-input" type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(e) => handleImageFileChange(e, 'gallery')} />

                      {pGalleryImages.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 mt-3">
                          {pGalleryImages.map((imgUrl, idx) => (
                            <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                              <img src={imgUrl} alt={'Gallery ' + (idx + 1)} className="aspect-square w-full object-cover" />
                              <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 py-1 bg-white/85 backdrop-blur-sm">
                                <button type="button" onClick={() => moveGalleryImage(idx, -1)} disabled={idx === 0}
                                  className="p-0.5 px-1 text-gray-500 hover:text-gray-900 disabled:opacity-25 text-[10px]">◀</button>
                                <button type="button" onClick={() => removeGalleryImage(idx)}
                                  className="p-0.5 px-1 text-red-400 hover:text-red-600 text-[10px]" title="Remove">✕</button>
                                <button type="button" onClick={() => moveGalleryImage(idx, 1)} disabled={idx === pGalleryImages.length - 1}
                                  className="p-0.5 px-1 text-gray-500 hover:text-gray-900 disabled:opacity-25 text-[10px]">▶</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-300 mt-2">No gallery photos yet — arrows let you reorder after upload.</p>
                      )}
                    </div>
                  </div>
                </section>

                {/* 03 PRODUCT VARIANTS */}
                <section className="space-y-4">
                  <div className="adm-section-head">
                    <span className="adm-kicker">03</span>
                    <strong>Product Variants</strong>
                    {hasVariants && (
                      <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {variantCombos.length} combinations
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* COLOR dimension */}
                    <div className="rounded-2xl bg-[#FBFAF7] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800">Color</span>
                        <span className="text-[10px] text-gray-400">{pColors.length} selected</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PA_COLOR_PRESETS.map((c) => {
                          const on = pColors.some((x) => x.name === c.name);
                          return (
                            <button key={c.name} type="button" onClick={() => toggleVariantColor(c)}
                              className={'flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border text-[11px] font-semibold transition-all ' +
                                (on ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400')}>
                              <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                              {c.name}
                            </button>
                          );
                        })}
                        {pColors.filter((c) => !PA_COLOR_PRESETS.some((p) => p.name === c.name)).map((c) => (
                          <button key={c.name} type="button" onClick={() => toggleVariantColor(c)}
                            className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border text-[11px] font-semibold bg-[#C5A880]/15 text-[#A88B64] border-[#C5A880]/40">
                            <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                            {c.name} ✕
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <input type="color" value={customColorHex} onChange={(e) => setCustomColorHex(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 bg-white shrink-0" title="Pick custom color" />
                        <input type="text" value={customColorName} onChange={(e) => setCustomColorName(e.target.value)}
                          placeholder="Custom color name" className="flex-1 min-w-[120px] px-3 py-1.5 text-xs font-medium" />
                        <button type="button" onClick={addCustomVariantColor}
                          className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#C5A880] text-[11px] font-bold text-gray-700">
                          + Add
                        </button>
                      </div>
                    </div>

                    {/* SIZE dimension */}
                    <div className="rounded-2xl bg-[#FBFAF7] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800">Size</span>
                        <span className="text-[10px] text-gray-400">{pSizes.length} selected</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PA_SIZE_PRESETS.map((s) => {
                          const on = pSizes.includes(s);
                          return (
                            <button key={s} type="button" onClick={() => toggleVariantSize(s)}
                              className={'px-3 py-1 rounded-lg border text-[11px] font-bold transition-all ' +
                                (on ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400')}>
                              {s}
                            </button>
                          );
                        })}
                        {pSizes.filter((s) => !PA_SIZE_PRESETS.includes(s)).map((s) => (
                          <button key={s} type="button" onClick={() => toggleVariantSize(s)}
                            className="px-3 py-1 rounded-lg border text-[11px] font-bold bg-[#C5A880]/15 text-[#A88B64] border-[#C5A880]/40">
                            {s} ✕
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <input type="text" value={customSizeValue} onChange={(e) => setCustomSizeValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomVariantSize(); } }}
                          placeholder='Custom size (e.g. "42", "Kids 8Y")' className="flex-1 px-3 py-1.5 text-xs font-medium" />
                        <button type="button" onClick={addCustomVariantSize}
                          className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#C5A880] text-[11px] font-bold text-gray-700">
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Variant matrix — only when both dimensions are active */}
                  {hasVariants ? (
                    <div className="rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-xs">
                          <thead>
                            <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400 bg-[#FAFAF8] border-b border-gray-100">
                              <th className="px-4 py-2.5 font-semibold">Variant</th>
                              <th className="px-4 py-2.5 font-semibold">Price (ETB)</th>
                              <th className="px-4 py-2.5 font-semibold">Stock</th>
                              <th className="px-4 py-2.5 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {activeVariantRows.map((row) => (
                              <tr key={row.key} className="hover:bg-[#FBF9F5]/60 transition-colors">
                                <td className="px-4 py-2.5">
                                  <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800">
                                    <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: row.color.hex }} />
                                    {row.color.name} / {row.size}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <input type="number" min={0} value={row.cell.price}
                                    onChange={(e) => setCell(row.key, { price: e.target.value })}
                                    placeholder={pPrice || '—'} className="w-24 px-2 py-1.5 text-right" />
                                </td>
                                <td className="px-4 py-2.5">
                                  <input type="number" min={0} value={row.cell.stock}
                                    onChange={(e) => setCell(row.key, { stock: e.target.value })}
                                    placeholder="—" className="w-20 px-2 py-1.5 text-right" />
                                </td>
                                <td className="px-4 py-2.5">
                                  <button type="button"
                                    onClick={() => setCell(row.key, { inStock: !row.cell.inStock })}
                                    className={'inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ' +
                                      (row.cell.inStock !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')}>
                                    <span className={'w-1.5 h-1.5 rounded-full ' + (row.cell.inStock !== false ? 'bg-emerald-500' : 'bg-red-500')} />
                                    {row.cell.inStock !== false ? 'In Stock' : 'Out of Stock'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-4 py-2 bg-[#FAFAF8] border-t border-gray-100 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5" />
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          On save: lowest variant price becomes the catalog price · stock quantities are summed · availability follows any in-stock row.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                      <Palette className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                      <p className="text-xs text-gray-500">Pick at least one color AND one size above to generate the variant matrix.</p>
                      <p className="text-[10px] text-gray-400 mt-1">No variants? Set a single price &amp; stock in the next section.</p>
                    </div>
                  )}
                </section>

                {/* 04 PRICING & INVENTORY */}
                <section className="space-y-4">
                  <div className="adm-section-head">
                    <span className="adm-kicker">04</span>
                    <strong>Pricing &amp; Inventory</strong>
                    {hasVariants && (
                      <span className="ml-auto text-[10px] text-gray-400">managed per variant in 03</span>
                    )}
                  </div>

                  {hasVariants ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="adm-card p-4 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Combinations</p>
                        <p className="text-xl font-bold text-[#1A1A1A] mt-1">{variantCombos.length}</p>
                      </div>
                      <div className="adm-card p-4 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Catalog Price</p>
                        <p className="text-xl font-bold text-[#1A1A1A] mt-1">
                          ETB {(matrixPrices.length ? Math.min(...matrixPrices) : Number(pPrice) || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="adm-card p-4 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total Stock</p>
                        <p className="text-xl font-bold text-[#1A1A1A] mt-1">
                          {matrixStocks.length ? matrixStocks.reduce((a, b) => a + b, 0) : 0}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block mb-1.5">Selling Price (ETB) *</label>
                        <input type="number" min={0} required value={pPrice} onChange={(e) => setPPrice(e.target.value)}
                          placeholder="2500" className="w-full px-3.5 py-2.5 font-bold text-sm" />
                      </div>
                      <div>
                        <label className="block mb-1.5">Original Price</label>
                        <input type="number" min={0} value={pOrigPrice} onChange={(e) => setPOrigPrice(e.target.value)}
                          placeholder="Optional — sale badge" className="w-full px-3.5 py-2.5 text-gray-600" />
                      </div>
                      <div>
                        <label className="block mb-1.5">Stock Quantity</label>
                        <input type="number" min={0} value={pStock} onChange={(e) => setPStock(e.target.value)}
                          placeholder="15" className="w-full px-3.5 py-2.5 font-semibold" />
                      </div>
                      <div>
                        <label className="block mb-1.5">Availability</label>
                        <select value={pInStock ? 'true' : 'false'} onChange={(e) => setPInStock(e.target.value === 'true')}
                          className="w-full px-3.5 py-2.5 font-semibold cursor-pointer">
                          <option value="true">● In Stock</option>
                          <option value="false">○ Out of Stock</option>
                        </select>
                      </div>
                    </div>
                  )}
                </section>

                {/* 05 PRODUCT DESCRIPTION */}
                <section className="space-y-4">
                  <div className="adm-section-head">
                    <span className="adm-kicker">05</span>
                    <strong>Product Description</strong>
                  </div>

                  <div>
                    <label className="block mb-1.5">Product Description *</label>
                    <textarea rows={4} required value={pDesc} onChange={(e) => setPDesc(e.target.value)}
                      placeholder="Describe the fabric, craftsmanship, fit and what makes this piece special…"
                      className="w-full px-3.5 py-2.5 leading-relaxed" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1.5">Fabric &amp; Care Details</label>
                      <textarea rows={3} value={pFabricCare} onChange={(e) => setPFabricCare(e.target.value)}
                        placeholder="100% Ethiopian cotton. Hand wash cold or dry clean…" className="w-full px-3.5 py-2.5" />
                    </div>
                    <div>
                      <label className="block mb-1.5">Delivery &amp; Shipping Information</label>
                      <textarea rows={3} value={pDeliveryInfo} onChange={(e) => setPDeliveryInfo(e.target.value)}
                        placeholder="Free delivery in Addis Ababa over ETB 2,500. Dispatched within 24–48h…" className="w-full px-3.5 py-2.5" />
                    </div>
                  </div>
                </section>

                {/* 06 STOREFRONT SETTINGS */}
                <section className="space-y-3">
                  <div className="adm-section-head">
                    <span className="adm-kicker">06</span>
                    <strong>Storefront Settings</strong>
                  </div>

                  <div className="adm-card px-5 py-2 grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-gray-100">
                    <div className="px-1 py-1 sm:px-4">
                      <PaToggle checked={pIsNew} onChange={setPIsNew} label="New Arrival" hint="Shows the NEW badge" />
                    </div>
                    <div className="px-1 py-1 border-t sm:border-t-0 border-gray-100 sm:px-4">
                      <PaToggle checked={pIsSale} onChange={setPIsSale} label="On Sale" hint="Enable sale styling" />
                    </div>
                    <div className="px-1 py-1 border-t sm:border-t-0 border-gray-100 sm:px-4">
                      <PaToggle checked={pInStock} onChange={setPInStock} label="Available for Sale" hint="Out-of-stock items appear greyed out" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 -mt-1">Featured products use the “FEATURED” badge — toggle below in Dynamic Attributes or via badge text.</p>
                </section>

                {/* 07 DYNAMIC ATTRIBUTES */}
                <section className="space-y-4">
                  <div className="adm-section-head">
                    <span className="adm-kicker">07</span>
                    <strong>Dynamic Attributes</strong>
                    {propertyDefinitions.filter(isDefActive).length > 0 && (
                      <span className="ml-auto text-[10px] text-gray-400">
                        {propertyDefinitions.filter(isDefActive).filter((d) => !['sizes', 'colors', 'color-theme'].includes(d.slug)).length} configured · admin-managed
                      </span>
                    )}
                  </div>

                  {(() => {
                    const dynamicDefs = propertyDefinitions
                      .filter(isDefActive)
                      .filter((d) => !['sizes', 'colors', 'color-theme'].includes(d.slug));

                    if (dynamicDefs.length === 0) {
                      return (
                        <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                          <SlidersHorizontal className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                          <p className="text-xs text-gray-500">No attributes are bound to this category yet.</p>
                          <button type="button" onClick={() => setActiveTab('properties')}
                            className="text-[11px] font-bold text-[#C5A880] hover:underline mt-1">
                            Create attributes in Properties Studio →
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dynamicDefs.map((pdef) => {
                          const val = pAttributes[pdef.slug] !== undefined ? pAttributes[pdef.slug] : '';
                          const attrVisible = attrVisibility[pdef.slug] !== false;
                          return (
                            <div key={pdef.id} className="space-y-1.5">
                              <div className="flex items-center justify-between gap-3">
                                <label className="block">
                                  {pdef.name}
                                  {pdef.required && <span className="text-red-400 ml-0.5">*</span>}
                                  {pdef.unit && <span className="text-gray-300 font-normal ml-1">({pdef.unit})</span>}
                                </label>
                                <PaToggle
                                  checked={attrVisible}
                                  onChange={(v) => setAttrVisibility((m) => ({ ...m, [pdef.slug]: v }))}
                                  label={attrVisible ? 'Active' : 'Hidden'}
                                />
                              </div>
                              {attrVisible && (
                                <>

                              {pdef.type === 'select' && (
                                <select
                                  value={String(val)}
                                  onChange={(e) => setPAttributes({ ...pAttributes, [pdef.slug]: e.target.value })}
                                  className="w-full px-3 py-2.5 font-medium cursor-pointer"
                                >
                                  <option value="">-- Choose {pdef.name} --</option>
                                  {(pdef.options || []).map((opt) => (
                                    <option key={opt.id} value={opt.value}>{opt.name}</option>
                                  ))}
                                </select>
                              )}

                              {pdef.type === 'multi_select' && (
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                  {(pdef.options || []).map((opt) => {
                                    const list: string[] = Array.isArray(val) ? val : [];
                                    const on = list.includes(opt.value);
                                    return (
                                      <button key={opt.id} type="button"
                                        onClick={() => setPAttributes({
                                          ...pAttributes,
                                          [pdef.slug]: on ? list.filter((v) => v !== opt.value) : [...list, opt.value],
                                        })}
                                        className={'px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ' +
                                          (on ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400')}>
                                        {on ? '✓ ' : ''}{opt.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {pdef.type === 'color' && (
                                <div className="flex flex-wrap gap-2 pt-0.5">
                                  {(pdef.options || []).map((opt) => {
                                    const on = val === opt.value;
                                    return (
                                      <button key={opt.id} type="button" title={opt.name}
                                        onClick={() => setPAttributes({ ...pAttributes, [pdef.slug]: on ? '' : opt.value })}
                                        className={'w-7 h-7 rounded-full border border-black/10 flex items-center justify-center transition-transform ' +
                                          (on ? 'ring-2 ring-[#C5A880] scale-110' : 'hover:scale-105')}
                                        style={{ backgroundColor: opt.hex || '#ccc' }}>
                                        {on && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {(pdef.type === 'number' || pdef.type === 'range') && (
                                <div>
                                  {pdef.type === 'range' ? (
                                    <div className="flex items-center gap-3 pt-1.5">
                                      <input type="range" min={0} max={100} value={Number(val) || 0}
                                        onChange={(e) => setPAttributes({ ...pAttributes, [pdef.slug]: Number(e.target.value) })}
                                        className="flex-1 accent-[#C5A880]" />
                                      <span className="text-xs font-bold text-gray-700 w-12 text-right">
                                        {Number(val) || 0}{pdef.unit}
                                      </span>
                                    </div>
                                  ) : (
                                    <input type="number" min={0} value={String(val)}
                                      onChange={(e) => setPAttributes({ ...pAttributes, [pdef.slug]: e.target.value === '' ? '' : Number(e.target.value) })}
                                      placeholder={'Enter ' + pdef.name.toLowerCase() + '…'} className="w-full px-3 py-2.5 font-semibold" />
                                  )}
                                </div>
                              )}

                              {pdef.type === 'boolean' && (
                                <div className="pt-1">
                                  <PaToggle checked={Boolean(val)} onChange={(v) => setPAttributes({ ...pAttributes, [pdef.slug]: v })} label="Enabled" />
                                </div>
                              )}

                              {pdef.type === 'text' && (
                                <input type="text" value={String(val)}
                                  onChange={(e) => setPAttributes({ ...pAttributes, [pdef.slug]: e.target.value })}
                                  placeholder={'Enter ' + pdef.name.toLowerCase() + '…'} className="w-full px-3 py-2.5 font-medium" />
                              )}
                              </>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </section>

                {/* STICKY ACTION BAR */}
                <div className="sticky bottom-0 -mx-5 sm:-mx-8 px-5 sm:px-8 py-3.5 bg-white/95 backdrop-blur border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-2 z-10">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors order-last sm:order-first"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={(e) => handleSaveProduct(e as unknown as React.FormEvent, true)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#C5A880] disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold hover:bg-[#C5A880] hover:text-black transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    {editingProductId ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* CATEGORY MODAL (Create & Edit) */}
        {showCatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 my-auto max-h-[85vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
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
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-900 block">Cover Image File / URL</label>
                    {uploadingImg && (
                      <span className="text-[10px] bg-[#C5A880] text-black font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Uploading...
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImg}
                    onChange={(e) => handleImageFileChange(e, 'category')}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1A1A1A] file:text-white disabled:opacity-50"
                  />
                  {uploadingImg && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800 text-[10px] font-bold">
                      <RefreshCw className="w-3 h-3 animate-spin text-[#C5A880]" />
                      <span>Uploading category image to Storage...</span>
                    </div>
                  )}
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

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Sub-Categories / Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={catSubcategories}
                    onChange={(e) => setCatSubcategories(e.target.value)}
                    placeholder="e.g. Habesha Kemis, Linen Gown, Bridal, Casual"
                    className="w-full px-3 py-2 border rounded-xl font-medium"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Used for dynamic storefront filtering and category product grouping.
                  </p>
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

      {/* SUB-CATEGORY / STYLE MODAL (CREATE & EDIT) */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#C5A880]/20 text-[#1A1A1A] flex items-center justify-center">
                  <Tag className="w-5 h-5 text-[#C5A880]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                    {editingSubId ? 'Edit Sub-Category Style' : 'Add New Sub-Category / Style'}
                  </h3>
                  <p className="text-xs text-gray-500">Configure catalog style filter tags and taxonomy</p>
                </div>
              </div>
              <button
                onClick={() => setShowSubModal(false)}
                className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubcategory} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                  Sub-Category / Style Name *
                </label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Traditional Habesha Kemis, Bridal & Wedding, Leather Sandals"
                  className="w-full px-3.5 py-2.5 border rounded-xl font-bold text-[#1A1A1A] focus:ring-2 focus:ring-[#C5A880]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                  Parent Main Category *
                </label>
                <select
                  value={subCategorySlug}
                  onChange={(e) => {
                    setSubCategorySlug(e.target.value);
                    setSubParent('');
                  }}
                  className="w-full px-3.5 py-2.5 border rounded-xl font-bold bg-[#FAF8F5] focus:ring-2 focus:ring-[#C5A880]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* HIERARCHY: optional Parent Collection turns this entry into a child / brand level */}
              <div>
                <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                  Parent Collection (Optional)
                </label>
                <select
                  value={subParent}
                  onChange={(e) => setSubParent(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl font-bold bg-[#FAF8F5] focus:ring-2 focus:ring-[#C5A880]"
                >
                  <option value="">
                    -- None — top-level Sub-Category --
                  </option>
                  {subcategories
                    .filter((s) => s.categorySlug === subCategorySlug && !s.parentSlug && s.id !== editingSubId)
                    .map((s) => (
                      <option key={s.id} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                  Pick a parent to make this a <span className="font-semibold">Child Collection / Brand</span> — e.g. under “Addis” add “Yizz” or “Olde School”. Attributes can be bound to any level.
                </p>
              </div>

              <div>
                <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                  URL Tag Slug (Optional)
                </label>
                <input
                  type="text"
                  value={subSlug}
                  onChange={(e) => setSubSlug(e.target.value)}
                  placeholder="e.g. traditional-habesha-kemis"
                  className="w-full px-3 py-2 border rounded-xl font-mono text-gray-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                  Description / Style Tagline
                </label>
                <textarea
                  rows={2}
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  placeholder="Authentic handwoven ceremonial dresses with fine Ethiopian borders..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                  Tag Theme Color Accent
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="color"
                    value={subBadgeColor}
                    onChange={(e) => setSubBadgeColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-[#E7E2DA]"
                  />
                  <div className="flex gap-2">
                    {['#C5A880', '#1A1A1A', '#D4AF37', '#1B4D3E', '#800020', '#002366'].map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setSubBadgeColor(color)}
                        className={`w-7 h-7 rounded-full border border-black/20 transition-transform ${
                          subBadgeColor === color ? 'scale-110 ring-2 ring-offset-2 ring-[#C5A880]' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E7E2DA]">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="px-5 py-2.5 border rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subSaving}
                  className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#C5A880] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center gap-2"
                >
                  {subSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                      <span>Saving Sub-Category...</span>
                    </>
                  ) : (
                    <span>Save Sub-Category / Style</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT PROPERTY DEFINITION MODAL (ADMIN SCHEMA MANAGER) */}
      {showPropDefModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E7E2DA] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 my-auto max-h-[90vh] overflow-y-auto no-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-5 h-5 text-[#C5A880]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                    {editingPropDefId ? 'Edit Schema Property Definition' : 'Create New Schema Property Definition'}
                  </h3>
                  <p className="text-xs text-gray-500">Configure custom product property metadata and storefront filters</p>
                </div>
              </div>
              <button
                onClick={() => setShowPropDefModal(false)}
                className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePropDef} className="space-y-6 text-xs">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    Property Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={defName}
                    onChange={(e) => setDefName(e.target.value)}
                    placeholder="e.g. Sleeve Type, Heel Height, Material"
                    className="w-full px-3.5 py-2.5 border rounded-xl font-bold text-[#1A1A1A] focus:ring-2 focus:ring-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    Property Slug (Unique ID)
                  </label>
                  <input
                    type="text"
                    value={defSlug}
                    onChange={(e) => setDefSlug(e.target.value)}
                    placeholder="e.g. sleeve-type, heel-height"
                    className="w-full px-3.5 py-2.5 border rounded-xl font-mono text-gray-600 focus:ring-2 focus:ring-[#C5A880]"
                  />
                </div>
              </div>

              {/* Type and Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    Data Input Type *
                  </label>
                  <select
                    value={defType}
                    onChange={(e: any) => setDefType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl font-bold bg-[#FAF8F5] focus:ring-2 focus:ring-[#C5A880]"
                  >
                    <option value="select">Select (Single Choice Dropdown)</option>
                    <option value="multi_select">Multi-Select (Multiple Choice Pills)</option>
                    <option value="color">Color Palette (Swatches with Hex Codes)</option>
                    <option value="number">Number (Numeric Value)</option>
                    <option value="range">Range / Measurement (Min–Max Numeric)</option>
                    <option value="boolean">Boolean (Yes/No Toggle)</option>
                    <option value="text">Text (Free text note)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                    Measurement Unit (Optional)
                  </label>
                  <input
                    type="text"
                    value={defUnit}
                    onChange={(e) => setDefUnit(e.target.value)}
                    placeholder="e.g. cm, mm, g, ETB"
                    className="w-full px-3.5 py-2.5 border rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-gray-800 uppercase tracking-wider block mb-1">
                  Property Description / Help Text
                </label>
                <textarea
                  rows={2}
                  value={defDesc}
                  onChange={(e) => setDefDesc(e.target.value)}
                  placeholder="Explain what this property represents..."
                  className="w-full px-3.5 py-2 border rounded-xl"
                />
              </div>

              {/* Options Configurator for Select / Multi-Select / Color */}
              {['select', 'multi_select', 'color'].includes(defType) && (
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E7E2DA] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                      Pre-defined Options ({defOptions.length})
                    </label>
                    <span className="text-[10px] text-gray-400">Add options that admins can select</span>
                  </div>

                  {/* Add option row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {defType === 'color' && (
                      <input
                        type="color"
                        value={newOptHex}
                        onChange={(e) => setNewOptHex(e.target.value)}
                        className="w-9 h-9 rounded-xl cursor-pointer border border-[#E7E2DA] shrink-0"
                        title="Pick option color"
                      />
                    )}
                    <input
                      type="text"
                      value={newOptName}
                      onChange={(e) => setNewOptName(e.target.value)}
                      placeholder={defType === 'color' ? 'Color Name (e.g. Habesha Gold)' : 'Option Name (e.g. Long Sleeve)'}
                      className="flex-1 px-3 py-2 border rounded-xl font-bold bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddPropDefOption}
                      className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#C5A880] text-white hover:text-black font-bold rounded-xl transition-all shrink-0"
                    >
                      + Add Option
                    </button>
                  </div>

                  {/* Existing options list */}
                  <div className="flex flex-wrap gap-2 pt-2 max-h-36 overflow-y-auto">
                    {defOptions.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E7E2DA] shadow-2xs font-bold text-xs"
                      >
                        {opt.hex && (
                          <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: opt.hex }} />
                        )}
                        <span>{opt.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePropDefOption(opt.id)}
                          className="text-gray-400 hover:text-red-600 ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Assignments */}
              <div className="space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <label className="font-bold text-xs text-gray-900 uppercase tracking-wider block">
                  Category Assignment
                </label>
                <p className="text-[11px] text-gray-500">
                  Select which categories show this property in the catalog filter and product creation form.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleToggleDefCategory('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      defCategoryIds.includes('all')
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    All Categories
                  </button>

                  {categories.map((cat) => {
                    const isAssigned = defCategoryIds.includes(cat.slug) && !defCategoryIds.includes('all');
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => handleToggleDefCategory(cat.slug)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isAssigned
                            ? 'bg-[#1A1A1A] text-white shadow-xs'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-black'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Settings Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#FAF8F5] rounded-2xl border border-[#E7E2DA]">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={defFilterable}
                    onChange={(e) => setDefFilterable(e.target.checked)}
                    className="rounded text-[#1A1A1A]"
                  />
                  <span>Filterable</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={defVariant}
                    onChange={(e) => setDefVariant(e.target.checked)}
                    className="rounded text-[#1A1A1A]"
                  />
                  <span>Variant</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={defShowOnProductPage}
                    onChange={(e) => setDefShowOnProductPage(e.target.checked)}
                    className="rounded text-[#1A1A1A]"
                  />
                  <span>Product Page</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={defShowOnProductCard}
                    onChange={(e) => setDefShowOnProductCard(e.target.checked)}
                    className="rounded text-[#1A1A1A]"
                  />
                  <span>Product Card</span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E2DA]">
                <button
                  type="button"
                  onClick={() => setShowPropDefModal(false)}
                  className="px-5 py-2.5 border border-[#E7E2DA] hover:bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={defSaving}
                  className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#C5A880] text-white hover:text-black font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  {defSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                      <span>Saving Schema...</span>
                    </>
                  ) : (
                    <span>Save Property Definition</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

        {/* RICH INSPECT PRODUCT DETAIL MODAL (Matching exact storefront detail layout) */}
        {viewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#E7E2DA] space-y-6 my-auto max-h-[85vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
              
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 border border-[#E7E2DA] space-y-4 my-auto max-h-[85vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
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
                  {selectedOrder.items?.map((item: any, idx: number) => (
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
