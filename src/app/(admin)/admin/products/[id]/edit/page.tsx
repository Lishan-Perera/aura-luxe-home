'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Sparkles,
  UploadCloud,
  X,
  Trash2,
  Star,
  Layers,
  DollarSign,
  Package,
  Sliders,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { slugify } from '@/lib/utils';

interface CategoryItem {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  roomType?: string;
  subcategories?: Array<{
    _id?: string;
    name: string;
    slug: string;
  }>;
}

interface ImageUploadItem {
  url: string;
  public_id: string;
  alt?: string;
  isDefault: boolean;
}

interface VariantItem {
  sku: string;
  title: string;
  colorName?: string;
  colorHex?: string;
  sizeLabel?: string;
  priceAdjustment: number;
  stockQuantity: number;
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('Aura Luxe');
  const [shortSummary, setShortSummary] = useState('');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [unit, setUnit] = useState('cm');

  // Categories
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  const [roomType, setRoomType] = useState('Living Room');

  // Pricing
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');

  // Images & Variants
  const [images, setImages] = useState<ImageUploadItem[]>([]);
  const [variants, setVariants] = useState<VariantItem[]>([]);
  const [hasVariants, setHasVariants] = useState(false);

  // Inventory
  const [stockQuantity, setStockQuantity] = useState('10');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');

  // Settings
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Inactive'>('Active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);

  // Loading & Submission
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Fetch Categories
        const catRes = await fetch('/api/admin/categories');
        const catData = await catRes.json();
        if (catData.categories) {
          setCategories(catData.categories);
        }

        // 2. Fetch Product
        const prodRes = await fetch(`/api/admin/products?id=${productId}`);
        const prodData = await prodRes.json();

        if (prodData.product) {
          const p = prodData.product;
          setTitle(p.title || '');
          setSlug(p.slug || '');
          setBrand(p.brand || 'Aura Luxe');
          setRoomType(p.roomType || 'Living Room');
          setPrice(p.price?.toString() || '');
          setCompareAtPrice(p.compareAtPrice ? p.compareAtPrice.toString() : '');
          setShortSummary(p.shortSummary || '');
          setDescription(p.description || '');
          setCareInstructions(p.careInstructions || '');
          setMaterials(Array.isArray(p.materials) ? p.materials.join(', ') : p.materials || '');

          if (p.dimensions) {
            setLength(p.dimensions.length?.toString() || '');
            setWidth(p.dimensions.width?.toString() || '');
            setHeight(p.dimensions.height?.toString() || '');
            setUnit(p.dimensions.unit || 'cm');
          }

          if (p.categoryId) {
            const cId = typeof p.categoryId === 'object' ? p.categoryId._id : p.categoryId;
            setSelectedCategoryId(cId || '');
          }

          setSelectedSubCategory(p.subCategory || '');
          setSelectedSubCategoryId(p.subCategoryId || '');

          setImages(p.images || []);
          if (p.variants && p.variants.length > 0) {
            setVariants(p.variants);
            setHasVariants(p.variants.length > 1);
            setSku(p.variants[0].sku || '');
            setStockQuantity(p.variants[0].stockQuantity?.toString() || '10');
          } else {
            setSku(`ALH-${Date.now().toString().slice(-5)}`);
          }

          if (p.inventory) {
            setStockQuantity(p.inventory.stockQuantity?.toString() || '10');
            setLowStockThreshold(p.inventory.lowStockThreshold?.toString() || '5');
          }

          setStatus(p.isActive ? 'Active' : 'Inactive');
          setIsFeatured(Boolean(p.isFeatured));
          setIsNewArrival(Boolean(p.isNewArrival));
        }
      } catch (err: any) {
        console.error('Failed to load product for editing:', err);
        setStatusMessage({ type: 'error', text: `Failed to load product: ${err.message}` });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [productId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadError('');
    setUploading(true);

    const files = Array.from(e.target.files);
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds 10MB limit.`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.image) {
          setImages((prev) => [
            ...prev,
            {
              url: data.image.url,
              public_id: data.image.public_id,
              alt: title || file.name,
              isDefault: prev.length === 0,
            },
          ]);
        }
      } catch (err: any) {
        setUploadError(`Upload failed: ${err.message}`);
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length > 0 && !updated.some((img) => img.isDefault)) {
        updated[0].isDefault = true;
      }
      return updated;
    });
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isDefault: idx === index,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        id: productId,
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        categoryId: selectedCategoryId,
        subCategory: selectedSubCategory,
        subCategoryId: selectedSubCategoryId || undefined,
        roomType,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        shortSummary: shortSummary.trim(),
        description: description.trim(),
        materials: materials.split(',').map((m) => m.trim()).filter(Boolean),
        dimensions: {
          length: length ? Number(length) : undefined,
          width: width ? Number(width) : undefined,
          height: height ? Number(height) : undefined,
          unit,
        },
        careInstructions: careInstructions.trim(),
        images,
        variants: hasVariants ? variants : undefined,
        stockQuantity: Number(stockQuantity),
        lowStockThreshold: Number(lowStockThreshold),
        status,
        isActive: status === 'Active',
        isFeatured,
        isNewArrival,
      };

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update product');

      setStatusMessage({ type: 'success', text: '✨ Product successfully updated in MongoDB Atlas!' });
      setTimeout(() => {
        router.push('/admin/products');
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Update failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => (c._id || c.id) === selectedCategoryId);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-xs text-forest-700 font-medium">
        <div className="w-6 h-6 border-2 border-forest-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Loading product details from catalog...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-300 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg bg-white border border-cream-300 hover:bg-cream-100 text-forest-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-forest-900 tracking-tight">
              Edit Handcrafted Piece
            </h1>
            <p className="text-xs text-forest-600 mt-0.5">
              Update pricing, inventory, dimensions, and photography in MongoDB Atlas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Link
            href="/admin/products"
            className="px-4 py-2 text-xs font-semibold text-forest-700 bg-white border border-cream-300 rounded-lg hover:bg-cream-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-cream-50 font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-cream-50 border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#E9EDE7]" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-cream-300 p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-cream-200 text-forest-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-[#123C2F]" />
                <span>Basic Information</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-3 bg-cream-50/50 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full text-xs p-3 bg-cream-50/50 border border-cream-300 rounded-lg font-mono text-forest-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="w-full text-xs p-3 bg-cream-50/50 border border-cream-300 rounded-lg font-mono text-forest-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Short Editorial Summary
                </label>
                <input
                  type="text"
                  value={shortSummary}
                  onChange={(e) => setShortSummary(e.target.value)}
                  className="w-full text-xs p-3 bg-cream-50/50 border border-cream-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Full Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-3 bg-cream-50/50 border border-cream-300 rounded-lg leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Materials (Comma-separated)
                </label>
                <input
                  type="text"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  className="w-full text-xs p-3 bg-cream-50/50 border border-cream-300 rounded-lg"
                />
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl border border-cream-300 p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                <div className="flex items-center gap-2 text-forest-900 font-bold text-sm">
                  <ImageIcon className="w-4 h-4 text-[#123C2F]" />
                  <span>Product Photography ({images.length} images)</span>
                </div>
              </div>

              <label className="block border-2 border-dashed border-cream-300 hover:border-[#123C2F] bg-cream-50/60 rounded-xl p-5 text-center cursor-pointer transition-all">
                <UploadCloud className="w-7 h-7 text-[#123C2F] mx-auto mb-1" />
                <span className="text-xs font-bold text-forest-900 block">Click to upload additional photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              {uploading && (
                <div className="p-2 text-center text-xs text-forest-700 animate-pulse">Uploading new images...</div>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={img.public_id || idx}
                      className={`relative rounded-lg overflow-hidden border ${
                        img.isDefault ? 'border-[#123C2F] ring-2 ring-[#E9EDE7]' : 'border-cream-300'
                      } p-1 bg-white`}
                    >
                      <div className="relative h-24 w-full rounded overflow-hidden bg-cream-100">
                        <Image src={img.url} alt={img.alt || 'Product preview'} fill className="object-cover" />
                      </div>
                      <div className="flex items-center justify-between p-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          className={`flex items-center gap-1 font-semibold ${
                            img.isDefault ? 'text-[#123C2F]' : 'text-forest-500 hover:text-[#123C2F]'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${img.isDefault ? 'fill-[#123C2F] text-[#123C2F]' : ''}`} />
                          <span>{img.isDefault ? 'Primary' : 'Set'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Category Placement */}
            <div className="bg-white rounded-xl border border-cream-300 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-cream-200 text-forest-900 font-bold text-sm">
                <Layers className="w-4 h-4 text-[#123C2F]" />
                <span>Category Placement</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Main Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    const chosen = categories.find((c) => (c._id || c.id) === e.target.value);
                    if (chosen) setRoomType(chosen.name);
                  }}
                  className="w-full text-xs p-2.5 bg-cream-50/70 border border-cream-300 rounded-lg font-medium"
                >
                  {categories.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Subcategory
                </label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream-50/70 border border-cream-300 rounded-lg font-medium"
                >
                  <option value="">-- General Room Piece --</option>
                  {selectedCategoryObj?.subcategories?.map((s) => (
                    <option key={s._id || s.slug} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-cream-300 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-cream-200 text-forest-900 font-bold text-sm">
                <DollarSign className="w-4 h-4 text-[#123C2F]" />
                <span>Pricing (LKR)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Regular Price (LKR)
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream-50/70 border border-cream-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Compare-at Price (LKR)
                </label>
                <input
                  type="number"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream-50/70 border border-cream-300 rounded-lg"
                />
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-xl border border-cream-300 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-cream-200 text-forest-900 font-bold text-sm">
                <Package className="w-4 h-4 text-[#123C2F]" />
                <span>Inventory</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream-50/70 border border-cream-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Low-Stock Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream-50/70 border border-cream-300 rounded-lg"
                />
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl border border-cream-300 p-5 shadow-sm space-y-4">
              <div className="pb-2 border-b border-cream-200 text-forest-900 font-bold text-sm">
                <span>Publishing & Status</span>
              </div>

              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full text-xs p-2.5 bg-cream-50/70 border border-cream-300 rounded-lg font-bold"
              >
                <option value="Active">Active (Visible)</option>
                <option value="Draft">Draft (Internal)</option>
                <option value="Inactive">Inactive (Hidden)</option>
              </select>

              <div className="space-y-2 pt-2 border-t border-cream-100 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-forest-800">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="w-4 h-4 text-forest-700 rounded border-cream-300"
                  />
                  <span>New Arrival 2026</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-forest-800">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-forest-700 rounded border-cream-300"
                  />
                  <span>Featured Masterpiece</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
