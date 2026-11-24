'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Flame,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Upload,
  Calendar,
  Layers,
  Tag,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { formatLKR } from '@/lib/utils';

interface BannerItem {
  _id: string;
  id: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  ctaText?: string;
  ctaLink?: string;
  image?: { url: string; public_id?: string };
  mobileImage?: { url: string; public_id?: string };
  displayOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

interface FlashSaleProductItem {
  id: string;
  _id: string;
  title: string;
  slug: string;
  categoryName: string;
  roomType: string;
  regularPrice: number;
  salePrice: number;
  discountPercent: number;
  flashSale?: {
    isActive: boolean;
    salePrice?: number;
    startDate?: string | null;
    endDate?: string | null;
  };
  isExpired: boolean;
  images: Array<{ url: string }>;
}

interface FlashSaleCampaign {
  title: string;
  badge: string;
  isActive: boolean;
  endDate?: string | null;
}

interface SimpleProduct {
  id: string;
  _id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  roomType: string;
}

export default function AdminPromotionsPage() {
  const [activeTab, setActiveTab] = useState<'banners' | 'flashSale'>('banners');
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<FlashSaleProductItem[]>([]);
  const [campaign, setCampaign] = useState<FlashSaleCampaign>({
    title: 'FLASH SALE',
    badge: 'On Sale Now',
    isActive: true,
    endDate: '',
  });

  const [catalogProducts, setCatalogProducts] = useState<SimpleProduct[]>([]);

  // Banner Form State
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    badgeText: '',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    desktopImageUrl: '',
    mobileImageUrl: '',
    displayOrder: 1,
    isActive: true,
    startDate: '',
    endDate: '',
  });

  // Flash Sale Form State
  const [showFlashSaleModal, setShowFlashSaleModal] = useState(false);
  const [flashSaleForm, setFlashSaleForm] = useState({
    productId: '',
    salePrice: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  // Notification banners
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [bannersRes, flashSaleRes, productsRes] = await Promise.all([
        fetch('/api/admin/banners'),
        fetch('/api/admin/flash-sale'),
        fetch('/api/admin/products'),
      ]);

      const [bannersData, flashSaleData, productsData] = await Promise.all([
        bannersRes.json(),
        flashSaleRes.json(),
        productsRes.json(),
      ]);

      if (bannersData.banners) setBanners(bannersData.banners);
      if (flashSaleData.products) setFlashSaleProducts(flashSaleData.products);
      if (flashSaleData.campaign) setCampaign(flashSaleData.campaign);
      if (productsData.products) setCatalogProducts(productsData.products);
    } catch (err: any) {
      setErrorMsg('Failed to load promotions data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (success: string, error = '') => {
    if (success) {
      setSuccessMsg(success);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
    if (error) {
      setErrorMsg(error);
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.secure_url) {
        throw new Error(data.error || 'Image upload failed');
      }

      if (target === 'desktop') {
        setBannerForm((prev) => ({ ...prev, desktopImageUrl: data.secure_url }));
      } else {
        setBannerForm((prev) => ({ ...prev, mobileImageUrl: data.secure_url }));
      }
      showNotification('Image uploaded successfully via Cloudinary.');
    } catch (err: any) {
      showNotification('', err.message || 'Image upload failed. You can also paste an image URL directly.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Banner (Create or Update)
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim() || !bannerForm.desktopImageUrl.trim()) {
      showNotification('', 'Please provide a campaign title and desktop image.');
      return;
    }

    try {
      const method = editingBannerId ? 'PUT' : 'POST';
      const payload = {
        ...bannerForm,
        id: editingBannerId,
      };

      const res = await fetch('/api/admin/banners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save promotional banner');
      }

      showNotification(editingBannerId ? 'Banner updated successfully.' : 'New banner created successfully.');
      setShowBannerModal(false);
      setEditingBannerId(null);
      fetchData();
    } catch (err: any) {
      showNotification('', err.message);
    }
  };

  // Delete Banner
  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete banner');
      showNotification('Promotional banner deleted.');
      fetchData();
    } catch (err: any) {
      showNotification('', err.message);
    }
  };

  // Edit Banner
  const handleEditBanner = (b: BannerItem) => {
    setEditingBannerId(b._id || b.id);
    setBannerForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      badgeText: b.badgeText || '',
      ctaText: b.ctaText || 'Shop Now',
      ctaLink: b.ctaLink || '/shop',
      desktopImageUrl: b.image?.url || '',
      mobileImageUrl: b.mobileImage?.url || '',
      displayOrder: b.displayOrder || 1,
      isActive: b.isActive ?? true,
      startDate: b.startDate ? b.startDate.slice(0, 10) : '',
      endDate: b.endDate ? b.endDate.slice(0, 10) : '',
    });
    setShowBannerModal(true);
  };

  // Save Flash Sale Product
  const handleSaveFlashSaleProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashSaleForm.productId) {
      showNotification('', 'Please select a product from the catalog.');
      return;
    }

    const saleNum = Number(flashSaleForm.salePrice);
    if (isNaN(saleNum) || saleNum <= 0) {
      showNotification('', 'Please enter a valid sale price in LKR.');
      return;
    }

    const selectedProduct = catalogProducts.find((p) => (p.id || p._id) === flashSaleForm.productId);
    const regPrice = selectedProduct?.compareAtPrice || selectedProduct?.price || 0;
    if (saleNum >= regPrice) {
      showNotification(
        '',
        `Sale price (LKR ${saleNum.toLocaleString()}) must be strictly lower than regular price (LKR ${regPrice.toLocaleString()}).`
      );
      return;
    }

    try {
      const res = await fetch('/api/admin/flash-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flashSaleForm),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add product to flash sale');
      }

      showNotification('Product successfully added to Flash Sale.');
      setShowFlashSaleModal(false);
      setFlashSaleForm({
        productId: '',
        salePrice: '',
        startDate: '',
        endDate: '',
        isActive: true,
      });
      fetchData();
    } catch (err: any) {
      showNotification('', err.message);
    }
  };

  // Remove Flash Sale Product
  const handleRemoveFlashSaleProduct = async (productId: string) => {
    if (!confirm('Remove this product from the Flash Sale and restore its regular price?')) return;
    try {
      const res = await fetch(`/api/admin/flash-sale?productId=${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove from flash sale');
      showNotification('Product removed from Flash Sale. Original price restored.');
      fetchData();
    } catch (err: any) {
      showNotification('', err.message);
    }
  };

  // Save Global Campaign Settings
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/flash-sale', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update campaign');
      showNotification('Flash sale campaign settings updated. Storefront countdown synchronized.');
    } catch (err: any) {
      showNotification('', err.message);
    }
  };

  const selectedForSale = catalogProducts.find((p) => (p.id || p._id) === flashSaleForm.productId);
  const selectedRegPrice = selectedForSale?.compareAtPrice || selectedForSale?.price || 0;
  const inputSalePrice = Number(flashSaleForm.salePrice) || 0;
  const calculatedDiscount =
    selectedRegPrice > inputSalePrice && inputSalePrice > 0
      ? Math.round(((selectedRegPrice - inputSalePrice) / selectedRegPrice) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#123C2F] tracking-tight">
            Promotions &amp; Flash Sale Management
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Manage compact homepage carousel banners, promotional scheduling, and Flash Sale product discounts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#D9D9D4] text-[#123C2F] text-xs font-medium hover:bg-[#E9EDE7] transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#D9D9D4] text-xs sm:text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('banners')}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'banners'
              ? 'border-[#123C2F] text-[#123C2F] font-semibold bg-white/40'
              : 'border-transparent text-[#666666] hover:text-[#123C2F]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Promotional Carousel Banners ({banners.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('flashSale')}
          className={`py-3 px-5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'flashSale'
              ? 'border-[#123C2F] text-[#123C2F] font-semibold bg-white/40'
              : 'border-transparent text-[#666666] hover:text-[#123C2F]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Flash Sale &amp; Deals ({flashSaleProducts.length})</span>
        </button>
      </div>

      {/* TAB 1: PROMOTIONAL BANNERS */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#123C2F]">Compact Homepage Banners</h2>
              <p className="text-xs text-[#666666]">
                Landscape ~3:1 aspect ratio slides displayed at the top of the homepage below navigation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingBannerId(null);
                setBannerForm({
                  title: '',
                  subtitle: '',
                  badgeText: '',
                  ctaText: 'Shop Now',
                  ctaLink: '/shop',
                  desktopImageUrl: '',
                  mobileImageUrl: '',
                  displayOrder: banners.length + 1,
                  isActive: true,
                  startDate: '',
                  endDate: '',
                });
                setShowBannerModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#123C2F] text-white text-xs font-semibold hover:bg-[#0D2E24] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Banner</span>
            </button>
          </div>

          {/* Banner Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((b, idx) => {
              const imgUrl = b.image?.url || '';
              const isScheduled = b.startDate && new Date(b.startDate).getTime() > Date.now();
              const isExpired = b.endDate && new Date(b.endDate).getTime() <= Date.now();

              return (
                <div
                  key={b._id || b.id || idx}
                  className="bg-white border border-[#D9D9D4] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[#123C2F]/50 transition-colors shadow-xs"
                >
                  <div>
                    {/* Banner Image Preview */}
                    <div className="relative aspect-[3/1] w-full bg-[#E9EDE7] overflow-hidden border-b border-[#D9D9D4]">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={b.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#666666]">
                          No image provided
                        </div>
                      )}

                      <div className="absolute top-2 left-2 flex gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#123C2F] text-white shadow-xs">
                          Order #{b.displayOrder}
                        </span>
                        {b.isActive ? (
                          isExpired ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200">
                              Expired
                            </span>
                          ) : isScheduled ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              Scheduled
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Active
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Banner Info */}
                    <div className="p-4 space-y-2">
                      {b.badgeText && (
                        <span className="text-[10px] font-semibold text-[#123C2F] uppercase tracking-wider bg-[#E9EDE7] px-2 py-0.5 rounded">
                          {b.badgeText}
                        </span>
                      )}
                      <h3 className="text-sm font-semibold text-[#123C2F]">{b.title}</h3>
                      {b.subtitle && <p className="text-xs text-[#666666] line-clamp-2">{b.subtitle}</p>}

                      <div className="pt-2 text-[11px] text-[#666666] flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                          CTA: <strong className="text-[#123C2F]">{b.ctaText || 'Shop Now'}</strong> → {b.ctaLink || '/shop'}
                        </span>
                        {(b.startDate || b.endDate) && (
                          <span>
                            Dates: {b.startDate ? b.startDate.slice(0, 10) : 'Now'} to {b.endDate ? b.endDate.slice(0, 10) : 'Indefinite'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 bg-[#FBF8F3] border-t border-[#D9D9D4] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#666666]">
                      {b.mobileImage?.url ? 'Dedicated mobile banner configured' : 'Responsive desktop crop'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditBanner(b)}
                        className="inline-flex items-center gap-1 text-[#123C2F] hover:underline font-medium"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(b._id || b.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:underline font-medium ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FLASH SALE MANAGEMENT */}
      {activeTab === 'flashSale' && (
        <div className="space-y-8">
          {/* Global Campaign Timer Configuration Card */}
          <div className="bg-white border border-[#D9D9D4] rounded-lg p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[#D9D9D4]">
              <Clock className="w-4 h-4 text-[#123C2F]" />
              <h2 className="text-sm font-semibold text-[#123C2F]">
                Flash Sale Global Countdown &amp; Campaign Settings
              </h2>
            </div>

            <form onSubmit={handleSaveCampaign} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-[#333333] mb-1">Campaign Heading</label>
                <input
                  type="text"
                  value={campaign.title}
                  onChange={(e) => setCampaign({ ...campaign, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                  placeholder="FLASH SALE"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#333333] mb-1">Status Badge Text</label>
                <input
                  type="text"
                  value={campaign.badge}
                  onChange={(e) => setCampaign({ ...campaign, badge: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                  placeholder="On Sale Now"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#333333] mb-1">
                  Countdown End Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={campaign.endDate ? campaign.endDate.slice(0, 16) : ''}
                  onChange={(e) => setCampaign({ ...campaign, endDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-md border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs text-[#333333] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={campaign.isActive}
                    onChange={(e) => setCampaign({ ...campaign, isActive: e.target.checked })}
                    className="rounded border-[#D9D9D4] text-[#123C2F] focus:ring-[#123C2F]"
                  />
                  <span>Campaign Active</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#123C2F] hover:bg-[#0D2E24] text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>

          {/* Flash Sale Products Header & Add Action */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#123C2F]">Flash Sale Discounted Products</h2>
              <p className="text-xs text-[#666666]">
                Products currently configured with promotional sale pricing. Original regular prices are preserved.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setFlashSaleForm({
                  productId: '',
                  salePrice: '',
                  startDate: '',
                  endDate: campaign.endDate || '',
                  isActive: true,
                });
                setShowFlashSaleModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#123C2F] text-white text-xs font-semibold hover:bg-[#0D2E24] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product to Flash Sale</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white border border-[#D9D9D4] rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#E9EDE7]/60 text-[#123C2F] uppercase text-[10px] tracking-wider border-b border-[#D9D9D4]">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Regular Price</th>
                    <th className="py-3 px-4">Sale Price</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Schedule / Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D9D4]/60">
                  {flashSaleProducts.map((p) => {
                    const primaryImg = p.images?.[0]?.url || '';
                    return (
                      <tr key={p._id || p.id} className="hover:bg-[#FBF8F3] transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-[#E9EDE7] relative overflow-hidden shrink-0 border border-[#D9D9D4]">
                            {primaryImg ? (
                              <Image src={primaryImg} alt={p.title} fill className="object-cover" />
                            ) : null}
                          </div>
                          <div>
                            <span className="font-medium text-[#123C2F] block">{p.title}</span>
                            <span className="text-[10px] text-[#666666]">{p.roomType}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#666666]">{p.categoryName}</td>

                        <td className="py-3 px-4 text-[#666666] line-through">
                          {formatLKR(p.regularPrice)}
                        </td>

                        <td className="py-3 px-4 font-semibold text-[#123C2F]">
                          {formatLKR(p.salePrice)}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#123C2F] text-white">
                            -{p.discountPercent}% OFF
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {p.isExpired ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800">
                              Expired
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              Active in Sale
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveFlashSaleProduct(p._id || p.id)}
                            className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {flashSaleProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#666666]">
                        No products are currently in the Flash Sale. Click &quot;Add Product to Flash Sale&quot; to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT PROMOTIONAL BANNER */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 bg-[#123C2F]/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-[#D9D9D4] max-w-2xl w-full p-6 space-y-4 shadow-xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9D9D4]">
              <h2 className="text-base font-semibold text-[#123C2F]">
                {editingBannerId ? 'Edit Promotional Banner' : 'Create New Promotional Banner'}
              </h2>
              <button
                type="button"
                onClick={() => setShowBannerModal(false)}
                className="text-[#666666] hover:text-[#123C2F] text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#333333] mb-1">
                    Campaign Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                    placeholder="e.g. Refresh Your Living Space"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#333333] mb-1">Badge Text (Optional)</label>
                  <input
                    type="text"
                    value={bannerForm.badgeText}
                    onChange={(e) => setBannerForm({ ...bannerForm, badgeText: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                    placeholder="e.g. NEW ARRIVALS, SPECIAL OFFERS"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#333333] mb-1">Short Subtitle / Description</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                  placeholder="e.g. Handcrafted Ceylon Teak Furniture & Natural Boucle Accents"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#333333] mb-1">Button Text</label>
                  <input
                    type="text"
                    value={bannerForm.ctaText}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                    placeholder="Shop Now"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#333333] mb-1">Destination URL / Category</label>
                  <input
                    type="text"
                    value={bannerForm.ctaLink}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaLink: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                    placeholder="/shop or /shop?category=living-room"
                  />
                </div>
              </div>

              {/* Desktop Banner Image Upload */}
              <div className="space-y-1.5 p-3 rounded border border-[#D9D9D4] bg-[#FBF8F3]/50">
                <label className="block font-medium text-[#123C2F]">
                  Desktop Banner Image (~3:1 landscape ratio, e.g. 1400x480px) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={bannerForm.desktopImageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, desktopImageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded border border-[#D9D9D4] bg-white focus:border-[#123C2F] focus:outline-none"
                    placeholder="https://... or upload below"
                  />
                  <label className="px-3 py-2 rounded bg-[#E9EDE7] text-[#123C2F] font-semibold cursor-pointer hover:bg-[#123C2F] hover:text-white transition-colors shrink-0 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'desktop')}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              {/* Mobile Banner Image Upload */}
              <div className="space-y-1.5 p-3 rounded border border-[#D9D9D4] bg-[#FBF8F3]/50">
                <label className="block font-medium text-[#123C2F]">
                  Mobile Banner Image (Optional dedicated mobile crop, e.g. 800x450px)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={bannerForm.mobileImageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, mobileImageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded border border-[#D9D9D4] bg-white focus:border-[#123C2F] focus:outline-none"
                    placeholder="Leave blank to use desktop image"
                  />
                  <label className="px-3 py-2 rounded bg-[#E9EDE7] text-[#123C2F] font-semibold cursor-pointer hover:bg-[#123C2F] hover:text-white transition-colors shrink-0 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'mobile')}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-[#333333] mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={bannerForm.displayOrder}
                    onChange={(e) => setBannerForm({ ...bannerForm, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#333333] mb-1">Start Date</label>
                  <input
                    type="date"
                    value={bannerForm.startDate}
                    onChange={(e) => setBannerForm({ ...bannerForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#333333] mb-1">End Date</label>
                  <input
                    type="date"
                    value={bannerForm.endDate}
                    onChange={(e) => setBannerForm({ ...bannerForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="bannerIsActive"
                  checked={bannerForm.isActive}
                  onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                  className="rounded border-[#D9D9D4] text-[#123C2F] focus:ring-[#123C2F]"
                />
                <label htmlFor="bannerIsActive" className="text-xs text-[#333333] cursor-pointer">
                  Activate banner immediately on the storefront
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#D9D9D4]">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="px-4 py-2 rounded bg-white border border-[#D9D9D4] text-[#666666] hover:bg-[#FBF8F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-5 py-2 rounded bg-[#123C2F] text-white font-semibold hover:bg-[#0D2E24] transition-colors"
                >
                  {editingBannerId ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PRODUCT TO FLASH SALE */}
      {showFlashSaleModal && (
        <div className="fixed inset-0 z-50 bg-[#123C2F]/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-[#D9D9D4] max-w-lg w-full p-6 space-y-4 shadow-xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9D9D4]">
              <h2 className="text-base font-semibold text-[#123C2F]">Add Product to Flash Sale</h2>
              <button
                type="button"
                onClick={() => setShowFlashSaleModal(false)}
                className="text-[#666666] hover:text-[#123C2F] text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveFlashSaleProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#333333] mb-1">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={flashSaleForm.productId}
                  onChange={(e) => setFlashSaleForm({ ...flashSaleForm, productId: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                >
                  <option value="">-- Choose from Catalog --</option>
                  {catalogProducts.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.title} — LKR {p.price.toLocaleString()} ({p.roomType})
                    </option>
                  ))}
                </select>
              </div>

              {selectedForSale && (
                <div className="p-3 rounded bg-[#E9EDE7]/60 border border-[#D9D9D4] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Current Regular Price:</span>
                    <strong className="text-[#123C2F]">LKR {selectedRegPrice.toLocaleString()}</strong>
                  </div>
                  {calculatedDiscount > 0 && (
                    <div className="flex justify-between items-center pt-1 border-t border-[#D9D9D4]/60">
                      <span className="text-[#666666]">Calculated Discount:</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#123C2F] text-white">
                        -{calculatedDiscount}% OFF
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-medium text-[#333333] mb-1">
                  Discounted Flash Sale Price (LKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={flashSaleForm.salePrice}
                  onChange={(e) => setFlashSaleForm({ ...flashSaleForm, salePrice: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                  placeholder="e.g. 74500"
                />
                <span className="text-[10px] text-[#666666] mt-0.5 block">
                  Must be strictly lower than the regular price.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#333333] mb-1">Start Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={flashSaleForm.startDate}
                    onChange={(e) => setFlashSaleForm({ ...flashSaleForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#333333] mb-1">End Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={flashSaleForm.endDate}
                    onChange={(e) => setFlashSaleForm({ ...flashSaleForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-[#D9D9D4] bg-[#FBF8F3] focus:border-[#123C2F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="flashSaleIsActive"
                  checked={flashSaleForm.isActive}
                  onChange={(e) => setFlashSaleForm({ ...flashSaleForm, isActive: e.target.checked })}
                  className="rounded border-[#D9D9D4] text-[#123C2F] focus:ring-[#123C2F]"
                />
                <label htmlFor="flashSaleIsActive" className="text-xs text-[#333333] cursor-pointer">
                  Activate Flash Sale for this product immediately
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#D9D9D4]">
                <button
                  type="button"
                  onClick={() => setShowFlashSaleModal(false)}
                  className="px-4 py-2 rounded bg-white border border-[#D9D9D4] text-[#666666] hover:bg-[#FBF8F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#123C2F] text-white font-semibold hover:bg-[#0D2E24] transition-colors"
                >
                  Add to Flash Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

