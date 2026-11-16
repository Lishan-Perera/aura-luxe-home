'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, Heart, ShoppingBag, Truck, ShieldCheck, Check, Clock, Sparkles } from 'lucide-react';
import { MockProduct } from '@/lib/data/mockData';
import { formatLKR } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import DistrictDeliveryEstimator from './DistrictDeliveryEstimator';

interface ProductDetailClientProps {
  product: MockProduct;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'dimensions' | 'materials' | 'care' | 'shipping'>('details');

  const currentPrice = product.price + (selectedVariant?.priceAdjustment || 0);
  const inWishlist = isInWishlist(product.id || product._id);

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80', public_id: 'default', alt: product.title, isDefault: true }];

  const currentImage = images[selectedImageIndex] || images[0];

  const handleAddToCart = () => {
    addItem({
      productId: product.id || product._id,
      title: product.title,
      price: currentPrice,
      image: currentImage.url,
      variantSku: selectedVariant?.sku || '',
      variantTitle: selectedVariant?.title || undefined,
      maxStock: selectedVariant?.stockQuantity || 10,
      quantity,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* 1. Left Gallery (Col 1 to 7) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Main High-Res Image with Zoom container */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-cream-100 border border-cream-300 shadow-sm">
          <Image
            src={currentImage.url}
            alt={currentImage.alt || product.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {product.isNewArrival && (
              <span className="bg-forest-700 text-cream-50 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded shadow-sm">
                New Arrival
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-gold-500 text-forest-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded shadow-sm">
                Artisan Pick
              </span>
            )}
          </div>

          <button
            onClick={() =>
              toggleWishlist({
                productId: product.id || product._id,
                title: product.title,
                price: currentPrice,
                image: currentImage.url,
                slug: product.slug,
              })
            }
            className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
              inWishlist
                ? 'bg-gold-500 text-white'
                : 'bg-white/90 text-forest-800 hover:bg-white hover:text-gold-600'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Thumbnails Row */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                  selectedImageIndex === idx
                    ? 'border-gold-500 ring-2 ring-gold-200'
                    : 'border-cream-300 hover:border-gold-300 opacity-75 hover:opacity-100'
                }`}
              >
                <Image src={img.url} alt={img.alt || ''} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Right Product Info & Actions (Col 8 to 12) */}
      <div className="lg:col-span-5 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold-600 font-semibold mb-1">
            <span>{product.roomType}</span>
            <span>•</span>
            <span>{product.categoryName}</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-forest-900 leading-tight">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mt-2.5">
            <div className="flex text-gold-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.ratingSummary?.average || 5)
                      ? 'fill-current'
                      : 'text-cream-400'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-forest-800">
              {product.ratingSummary?.average?.toFixed(1) || '5.0'} ({product.ratingSummary?.count || 12} reviews)
            </span>
            <span className="text-xs text-forest-400">|</span>
            <span className="text-xs text-forest-700 font-medium">100% Authentic Handcraft</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="p-4 bg-cream-50 rounded-lg border border-cream-200 flex items-baseline gap-3">
          <span className="font-serif text-2xl sm:text-3xl font-bold text-forest-900">
            {formatLKR(currentPrice)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > currentPrice && (
            <span className="text-sm text-forest-400 line-through">
              {formatLKR(product.compareAtPrice)}
            </span>
          )}
          <span className="ml-auto text-xs font-medium text-forest-600 bg-white px-2.5 py-1 rounded border border-cream-300">
            Inclusive of all taxes
          </span>
        </div>

        {/* Short Summary */}
        <p className="text-xs sm:text-sm text-forest-700 leading-relaxed">
          {product.shortSummary || product.description}
        </p>

        {/* Variants Selector */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-cream-200">
            <label className="text-xs font-serif font-semibold text-forest-800 uppercase tracking-wider block">
              Finish / Option: <span className="font-sans font-normal text-forest-600">{selectedVariant?.title}</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.sku === v.sku;
                return (
                  <button
                    key={v.sku}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3.5 py-2 rounded-md text-xs font-medium border transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-forest-700 bg-forest-800 text-cream-50 shadow-sm'
                        : 'border-cream-300 bg-white text-forest-800 hover:border-gold-400'
                    }`}
                  >
                    {v.colorHex && (
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: v.colorHex }}
                      />
                    )}
                    <span>{v.title}</span>
                    {v.priceAdjustment ? (
                      <span className="text-[10px] opacity-80">(+{formatLKR(v.priceAdjustment)})</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity & CTA Buttons */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-cream-300 rounded-md bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-forest-700 hover:bg-cream-100 transition-colors text-sm font-bold"
              >
                -
              </button>
              <span className="w-10 text-center text-xs font-bold text-forest-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-forest-700 hover:bg-cream-100 transition-colors text-sm font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 px-6 rounded-md bg-forest-700 hover:bg-forest-800 text-cream-50 font-serif font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-gold-300" />
              Add to Shopping Bag
            </button>
          </div>

          <button
            onClick={handleBuyNow}
            className="w-full py-3 px-6 rounded-md bg-gold-400 hover:bg-gold-500 text-forest-900 font-serif font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
          >
            Instant Checkout (Buy Now)
          </button>
        </div>

        {/* SRI LANKA DISTRICT DELIVERY ESTIMATOR (Daraz Functional Inspiration) */}
        <DistrictDeliveryEstimator productPrice={currentPrice * quantity} />

        {/* Material highlights */}
        {product.materials && (
          <div className="pt-2 text-xs text-forest-600 flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-forest-800">Materials:</span>
            {product.materials.map((m, i) => (
              <span key={i} className="bg-cream-200/80 px-2.5 py-0.5 rounded text-forest-700 font-medium">
                {m}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Full Width Tabbed Specifications */}
      <div className="lg:col-span-12 pt-8 border-t border-cream-300 space-y-6">
        <div className="flex border-b border-cream-300 gap-8 overflow-x-auto">
          {[
            { id: 'details', label: 'Artisan Details' },
            { id: 'dimensions', label: 'Dimensions & Sizing' },
            { id: 'materials', label: 'Materials & Origin' },
            { id: 'care', label: 'Care Instructions' },
            { id: 'shipping', label: 'Sri Lanka Delivery & Trial' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs sm:text-sm font-serif font-bold uppercase tracking-wider transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-forest-900 border-b-2 border-gold-500'
                  : 'text-forest-500 hover:text-forest-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl border border-cream-300 text-xs sm:text-sm text-forest-700 leading-relaxed">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-forest-900">The Story Behind the Piece</h3>
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'dimensions' && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-forest-900">Exact Measurements</h3>
              {product.dimensions ? (
                <ul className="list-disc pl-5 space-y-1">
                  <li>Length: {product.dimensions.length || '—'} {product.dimensions.unit || 'cm'}</li>
                  <li>Width: {product.dimensions.width || '—'} {product.dimensions.unit || 'cm'}</li>
                  <li>Height: {product.dimensions.height || '—'} {product.dimensions.unit || 'cm'}</li>
                </ul>
              ) : (
                <p>Standard architectural dimensions. Custom sizes available on inquiry.</p>
              )}
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-forest-900">Artisan Sourcing</h3>
              <p>
                Crafted using Sri Lankan plantation teak, genuine hand-turned brass, and regional clay. We practice sustainable woodworking without synthetic finishes.
              </p>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-forest-900">Maintenance & Preservation</h3>
              <p>{product.careInstructions || 'Dust regularly with a dry microfibre cloth. Avoid direct monsoonal moisture and abrasive cleaners.'}</p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-forest-900">Islandwide Shipping & 7-Day Guarantee</h3>
              <p>
                We deliver to all 25 districts of Sri Lanka. Colombo deliveries arrive within 1–2 business days. Outstation regions are delivered within 2–4 business days via verified logistics couriers. Inspect your pieces in person upon Cash on Delivery.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

