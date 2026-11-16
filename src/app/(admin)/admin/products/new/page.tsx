'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  UploadCloud,
  X,
  ArrowLeft,
  Check,
  Sparkles,
  Plus,
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
    description?: string;
    isActive?: boolean;
  }>;
}

interface ImageUploadItem {
  url: string;
  public_id: string;
  alt?: string;
  isDefault: boolean;
  size?: number;
}

interface VariantItem {
  sku: string;
  title: string;
  colorName?: string;
  colorHex?: string;
  sizeLabel?: string;
  priceAdjustment: number;
  stockQuantity: number;
  isActive: boolean;
}

export default function NewProductPage() {
  const router = useRouter();

  // Basic Information
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('Aura Luxe');
  const [shortSummary, setShortSummary] = useState('');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('Solid Ceylon Teak, Brushed Brass');
  const [careInstructions, setCareInstructions] = useState('Wipe clean with a soft dry cloth. Avoid abrasive cleaners.');
  const [length, setLength] = useState('85');
  const [width, setWidth] = useState('80');
  const [height, setHeight] = useState('78');
  const [unit, setUnit] = useState('cm');

  // Category & Subcategory
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  const [roomType, setRoomType] = useState('Living Room');
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Pricing
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');

  // Images
  const [images, setImages] = useState<ImageUploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Variants
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<VariantItem[]>([]);

  // Inventory
  const [stockQuantity, setStockQuantity] = useState('15');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [trackInventory, setTrackInventory] = useState(true);

  // Additional Settings
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Inactive'>('Active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);

  // Status & Submission
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch Categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          const firstCat = data.categories[0];
          setSelectedCategoryId(firstCat._id || firstCat.id || '');
          setRoomType(firstCat.name);
          if (firstCat.subcategories && firstCat.subcategories.length > 0) {
            setSelectedSubCategory(firstCat.subcategories[0].name);
            setSelectedSubCategoryId(firstCat.subcategories[0]._id || '');
          }
        }
      } catch (err: any) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // Auto-generate slug and SKU when title changes
  useEffect(() => {
    if (!isSlugManual && title) {
      setSlug(slugify(title));
    }
    if (!sku && title) {
      const code = title
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4);
      setSku(`ALH-${code || 'LXR'}-${Date.now().toString().slice(-4)}`);
    }
  }, [title, isSlugManual, sku]);

  // Handle Category change
  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const chosen = categories.find((c) => (c._id || c.id) === catId);
    if (chosen) {
      setRoomType(chosen.name);
      if (chosen.subcategories && chosen.subcategories.length > 0) {
        setSelectedSubCategory(chosen.subcategories[0].name);
        setSelectedSubCategoryId(chosen.subcategories[0]._id || '');
      } else {
        setSelectedSubCategory('');
        setSelectedSubCategoryId('');
      }
    }
  };

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadError('');
    setUploading(true);

    const files = Array.from(e.target.files);

    for (const file of files) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds the 10MB limit.`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        if (data.image) {
          setImages((prev) => [
            ...prev,
            {
              url: data.image.url,
              public_id: data.image.public_id,
              alt: title || file.name,
              isDefault: prev.length === 0, // First image is default primary
              size: file.size,
            },
          ]);
        }
      } catch (err: any) {
        setUploadError(`Upload failed for ${file.name}: ${err.message}`);
      }
    }

    setUploading(false);
    // Reset file input
    e.target.value = '';
  };

  // Remove an image
  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      // Ensure at least one image remains primary
      if (updated.length > 0 && !updated.some((img) => img.isDefault)) {
        updated[0].isDefault = true;
      }
      return updated;
    });
  };

  // Set an image as primary
  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isDefault: idx === index,
      }))
    );
  };

  // Add a variant
  const addVariant = () => {
    const nextIdx = variants.length + 1;
    setVariants((prev) => [
      ...prev,
      {
        sku: `${sku || 'ALH'}-V${nextIdx}`,
        title: `Variant ${nextIdx}`,
        colorName: '',
        colorHex: '#C5A869',
        sizeLabel: 'Standard',
        priceAdjustment: 0,
        stockQuantity: 5,
        isActive: true,
      },
    ]);
  };

  // Update variant field
  const updateVariant = (index: number, field: keyof VariantItem, value: any) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Remove variant
  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Calculate discount percentage
  const numPrice = Number(price);
  const numCompare = Number(compareAtPrice);
  const discountPercent =
    numCompare > numPrice && numPrice > 0
      ? Math.round(((numCompare - numPrice) / numCompare) * 100)
      : 0;

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Frontend Validations
    if (!title.trim()) {
      setErrorMessage('Please enter a product title.');
      return;
    }

    if (!price || Number(price) <= 0) {
      setErrorMessage('Please enter a valid regular price greater than 0 LKR.');
      return;
    }

    if (compareAtPrice && Number(compareAtPrice) <= Number(price)) {
      setErrorMessage('Compare-at price must be greater than the regular price.');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Please upload at least one product image.');
      return;
    }

    if (!selectedCategoryId) {
      setErrorMessage('Please select a main category for this piece.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        sku: sku.trim() || `ALH-${Date.now().toString().slice(-6)}`,
        brand: brand.trim(),
        categoryId: selectedCategoryId,
        subCategory: selectedSubCategory,
        subCategoryId: selectedSubCategoryId || undefined,
        roomType,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        shortSummary: shortSummary.trim(),
        description: description.trim() || shortSummary.trim() || title.trim(),
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
        stockQuantity: Number(stockQuantity || 10),
        lowStockThreshold: Number(lowStockThreshold || 5),
        status,
        isFeatured,
        isNewArrival,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product in database.');
      }

      setSuccessMessage('✨ Product successfully created and stored in MongoDB Atlas!');
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving the product.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => (c._id || c.id) === selectedCategoryId);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-cream-300 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg bg-white border border-cream-300 hover:bg-cream-100 text-forest-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-forest-900 tracking-tight">
              Add New Handcrafted Piece
            </h1>
            <p className="text-xs text-forest-600 mt-0.5">
              Create and publish Ceylon teak furniture, artisan lighting, and decor pieces to MongoDB Atlas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
                <span>Saving to Atlas...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-gold-300" />
                <span>Save Product</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs leading-relaxed animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button onClick={() => setErrorMessage('')} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex-1">{successMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLUMNS: Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Basic Information Card */}
            <div className="bg-white rounded-xl border border-cream-300 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-cream-200 text-forest-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-gold-500" />
                <span>Basic Information</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ceylon Teak Sculptural Armchair"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-3 bg-cream-50/50 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-forest-800 uppercase tracking-wider">
                      Product Slug
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSlugManual((p) => !p)}
                      className="text-[11px] text-gold-700 hover:underline"
                    >
                      {isSlugManual ? 'Auto-generate' : 'Edit manually'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={slug}
                    readOnly={!isSlugManual}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full text-xs p-3 bg-cream-50/50 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 font-mono text-forest-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                    Base SKU / Identifier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ALH-TEAK-001"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="w-full text-xs p-3 bg-cream-50/50 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 font-mono text-forest-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Short Editorial Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted solid teak lounge armchair in textured natural boucle"
                  value={shortSummary}
                  onChange={(e) => setShortSummary(e.target.value)}
                  className="w-full text-xs p-3 bg-cream-50/50 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Full Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the architectural design, Ceylon artisan sourcing, finishing, and spatial presence..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-3 bg-cream-50/50 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                    Brand / Provenance
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full text-xs p-3 bg-cream-50/50 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                    Artisan Materials (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Solid Ceylon Teak, Brushed Brass, Natural Boucle"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    className="w-full text-xs p-3 bg-cream-50/50 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Material Care Instructions
                </label>
                <input
                  type="text"
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  className="w-full text-xs p-3 bg-cream-50/50 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600"
                />
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Dimensions (Length × Width × Height)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="number"
                    placeholder="Length"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="text-xs p-2.5 bg-cream-50/50 border border-cream-300 rounded-lg text-center"
                  />
                  <input
                    type="number"
                    placeholder="Width"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="text-xs p-2.5 bg-cream-50/50 border border-cream-300 rounded-lg text-center"
                  />
                  <input
                    type="number"
                    placeholder="Height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="text-xs p-2.5 bg-cream-50/50 border border-cream-300 rounded-lg text-center"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="text-xs p-2.5 bg-white border border-cream-300 rounded-lg text-center font-medium"
                  >
                    <option value="cm">cm</option>
                    <option value="inches">inches</option>
                    <option value="mm">mm</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Product Images Card */}
            <div className="bg-white rounded-xl border border-cream-300 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                <div className="flex items-center gap-2 text-forest-900 font-bold text-sm">
                  <ImageIcon className="w-4 h-4 text-gold-500" />
                  <span>Product Photography ({images.length} uploaded)</span>
                </div>
                <span className="text-[11px] text-forest-500">First image is primary default</span>
              </div>

              {/* Upload Dropzone */}
              <label className="block border-2 border-dashed border-cream-300 hover:border-gold-400 bg-cream-50/60 hover:bg-cream-100/50 rounded-xl p-6 text-center cursor-pointer transition-all">
                <UploadCloud className="w-8 h-8 text-gold-600 mx-auto mb-2" />
                <span className="text-xs font-bold text-forest-900 block">
                  Click to browse and upload product images
                </span>
                <span className="text-[11px] text-forest-500 mt-1 block">
                  Supports JPG, PNG, WEBP up to 10MB each. Direct real storage.
                </span>
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
                <div className="p-3 bg-cream-100 rounded-lg flex items-center justify-center gap-2 text-xs text-forest-800 font-medium">
                  <div className="w-3.5 h-3.5 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" />
                  <span>Processing and uploading image to storage...</span>
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs font-medium border border-red-200">
                  {uploadError}
                </div>
              )}

              {/* Uploaded Images Gallery */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div
                      key={img.public_id || idx}
                      className={`relative group rounded-lg overflow-hidden border ${
                        img.isDefault ? 'border-gold-500 ring-2 ring-gold-400/30' : 'border-cream-300'
                      } bg-white shadow-xs p-1`}
                    >
                      <div className="relative h-28 w-full rounded bg-cream-100 overflow-hidden">
                        <Image src={img.url} alt={img.alt || 'Product preview'} fill className="object-cover" />
                      </div>

                      <div className="flex items-center justify-between p-1.5 mt-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          className={`flex items-center gap-1 font-semibold ${
                            img.isDefault ? 'text-gold-700' : 'text-forest-500 hover:text-gold-600'
                          }`}
                          title={img.isDefault ? 'Primary Image' : 'Click to make primary'}
                        >
                          <Star className={`w-3.5 h-3.5 ${img.isDefault ? 'fill-gold-500 text-gold-500' : ''}`} />
                          <span>{img.isDefault ? 'Primary' : 'Set Main'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Variants Card */}
            <div className="bg-white rounded-xl border border-cream-300 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                <div className="flex items-center gap-2 text-forest-900 font-bold text-sm">
                  <Sliders className="w-4 h-4 text-gold-500" />
                  <span>Product Options & Variants</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-forest-700 font-medium cursor-pointer">
                    Enable Variants (Sizes / Colors)
                  </label>
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => {
                      setHasVariants(e.target.checked);
                      if (e.target.checked && variants.length === 0) {
                        addVariant();
                      }
                    }}
                    className="w-4 h-4 text-forest-700 rounded border-cream-300 focus:ring-forest-600"
                  />
                </div>
              </div>

              {hasVariants ? (
                <div className="space-y-3">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-cream-50/60 rounded-lg border border-cream-200 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center text-xs"
                    >
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] uppercase font-semibold text-forest-600 mb-0.5">Title / Label</label>
                        <input
                          type="text"
                          value={v.title}
                          onChange={(e) => updateVariant(idx, 'title', e.target.value)}
                          placeholder="e.g. Natural Teak / Large"
                          className="w-full p-2 bg-white border border-cream-300 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-forest-600 mb-0.5">Variant SKU</label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => updateVariant(idx, 'sku', e.target.value.toUpperCase())}
                          className="w-full p-2 bg-white border border-cream-300 rounded font-mono text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-forest-600 mb-0.5">Price +/- (LKR)</label>
                        <input
                          type="number"
                          value={v.priceAdjustment}
                          onChange={(e) => updateVariant(idx, 'priceAdjustment', Number(e.target.value))}
                          className="w-full p-2 bg-white border border-cream-300 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-forest-600 mb-0.5">Stock</label>
                        <input
                          type="number"
                          value={v.stockQuantity}
                          onChange={(e) => updateVariant(idx, 'stockQuantity', Number(e.target.value))}
                          className="w-full p-2 bg-white border border-cream-300 rounded text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Remove variant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addVariant}
                    className="w-full py-2 bg-white border border-dashed border-forest-600 text-forest-700 hover:bg-cream-100 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Variant</span>
                  </button>
                </div>
              ) : (
                <p className="text-xs text-forest-500 italic">
                  Single standard piece without variant size/color splits. Base price and inventory will be used.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT 1 COLUMN: Sidebar Settings */}
          <div className="space-y-6">

            {/* 1. Category & Subcategory Card */}
            <div className="bg-white rounded-xl border border-cream-300 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-cream-200 text-forest-900 font-bold text-sm">
                <Layers className="w-4 h-4 text-gold-500" />
                <span>Category Placement</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Main Category <span className="text-red-500">*</span>
                </label>
                {loadingCategories ? (
                  <div className="p-2.5 bg-cream-50 text-xs text-forest-500 animate-pulse rounded">Loading categories...</div>
                ) : (
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full text-xs p-2.5 bg-cream-50/70 border border-cream-300 rounded-lg font-medium text-forest-900 focus:outline-none focus:border-forest-600"
                  >
                    {categories.map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Subcategory
                </label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => {
                    setSelectedSubCategory(e.target.value);
                    const subObj = selectedCategoryObj?.subcategories?.find((s) => s.name === e.target.value);
                    setSelectedSubCategoryId(subObj?._id || '');
                  }}
                  className="w-full text-xs p-2.5 bg-cream-50/70 border border-cream-300 rounded-lg font-medium text-forest-900 focus:outline-none focus:border-forest-600"
                >
                  <option value="">-- General Room Piece --</option>
                  {selectedCategoryObj?.subcategories?.map((s) => (
                    <option key={s._id || s.slug} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Architectural Sanctuary Room
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream-50/70 border border-cream-300 rounded-lg font-medium text-forest-900"
                >
                  <option value="Living Room">Living Room</option>
                  <option value="Bedroom">Bedroom</option>
                  <option value="Dining & Kitchen">Dining & Kitchen</option>
                  <option value="Luxury Lighting">Luxury Lighting</option>
                  <option value="Artisanal Decor">Artisanal Decor</option>
                  <option value="Rugs & Textiles">Rugs & Textiles</option>
                  <option value="Outdoor & Patio">Outdoor & Patio</option>
                </select>
              </div>
            </div>

            {/* 2. Pricing Card */}
            <div className="bg-white rounded-xl border border-cream-300 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-cream-200 text-forest-900 font-bold text-sm">
                <DollarSign className="w-4 h-4 text-gold-500" />
                <span>Pricing (LKR)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Regular Price (LKR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-500">Rs.</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="185000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-xs pl-10 pr-3 py-2.5 bg-cream-50/70 border border-cream-300 rounded-lg font-bold text-forest-900 focus:outline-none focus:border-forest-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-forest-800 uppercase tracking-wider">
                    Compare-at Price (LKR)
                  </label>
                  {discountPercent > 0 && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      SAVE {discountPercent}%
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-500">Rs.</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="215000"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    className="w-full text-xs pl-10 pr-3 py-2.5 bg-cream-50/70 border border-cream-300 rounded-lg text-forest-700 focus:outline-none focus:border-forest-600"
                  />
                </div>
                <span className="text-[11px] text-forest-500 mt-1 block">
                  Original price before promotional discount.
                </span>
              </div>
            </div>

            {/* 3. Inventory Card */}
            <div className="bg-white rounded-xl border border-cream-300 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-cream-200 text-forest-900 font-bold text-sm">
                <Package className="w-4 h-4 text-gold-500" />
                <span>Inventory & Stock</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Initial Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream-50/70 border border-cream-300 rounded-lg font-bold text-forest-900"
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
                <span className="text-[11px] text-forest-500 mt-1 block">
                  Alerts admin when stock reaches this amount.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="trackInventory"
                  checked={trackInventory}
                  onChange={(e) => setTrackInventory(e.target.checked)}
                  className="w-4 h-4 text-forest-700 rounded border-cream-300 focus:ring-forest-600"
                />
                <label htmlFor="trackInventory" className="text-xs text-forest-800 font-medium cursor-pointer">
                  Track inventory on purchases
                </label>
              </div>
            </div>

            {/* 4. Publishing & Status Card */}
            <div className="bg-white rounded-xl border border-cream-300 p-5 shadow-sm space-y-4">
              <div className="pb-2 border-b border-cream-200 text-forest-900 font-bold text-sm">
                <span>Publishing & Status</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 uppercase tracking-wider mb-1">
                  Catalog Status
                </label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream-50/70 border border-cream-300 rounded-lg font-bold text-forest-900"
                >
                  <option value="Active">Active (Visible in Storefront)</option>
                  <option value="Draft">Draft (Internal Only)</option>
                  <option value="Inactive">Inactive (Hidden)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-cream-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-forest-800">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="w-4 h-4 text-forest-700 rounded border-cream-300"
                  />
                  <span>Mark as New Arrival (2026 Collection)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-forest-800">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-forest-700 rounded border-cream-300"
                  />
                  <span>Feature on Homepage Masterpieces</span>
                </label>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
