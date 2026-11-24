'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { MockProduct } from '@/lib/data/mockData';
import { formatLKR } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';

interface ProductDetailClientProps {
  product: MockProduct;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCartStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const currentPrice = product.price + (selectedVariant?.priceAdjustment || 0);
  const availableStock = selectedVariant?.stockQuantity ?? 10;
  const inStock = availableStock > 0;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
            public_id: 'default',
            alt: product.title,
            isDefault: true,
          },
        ];

  const currentImage = images[selectedImageIndex] || images[0];

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem({
      productId: product.id || product._id,
      title: product.title,
      price: currentPrice,
      image: currentImage.url,
      variantSku: selectedVariant?.sku || '',
      variantTitle: selectedVariant?.title || undefined,
      maxStock: availableStock,
      quantity,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
      {/* Left: Large Product Image & Simple Thumbnails */}
      <div className="lg:col-span-7 space-y-3">
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#E9EDE7]/40 border border-[#D9D9D4]">
          <Image
            src={currentImage.url}
            alt={currentImage.alt || product.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
        </div>

        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-20 h-20 rounded-md overflow-hidden border shrink-0 transition-all ${
                  selectedImageIndex === idx
                    ? 'border-[#123C2F] ring-1 ring-[#123C2F]'
                    : 'border-[#D9D9D4] opacity-75 hover:opacity-100'
                }`}
              >
                <Image src={img.url} alt={img.alt || ''} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Clean Product Information & Add to Bag */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-[#666666]">
            {product.roomType}
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#123C2F] leading-snug">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-2xl font-semibold text-[#123C2F]">
              {formatLKR(currentPrice)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
              <span className="text-sm text-[#666666] line-through">
                {formatLKR(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Availability */}
          <div className="pt-1">
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E9EDE7] text-[#123C2F] text-xs font-medium">
                <Check className="w-3.5 h-3.5" />
                In Stock ({availableStock} available)
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                Currently Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Short Description */}
        <p className="text-sm text-[#333333]/85 leading-relaxed">
          {product.shortSummary || product.description}
        </p>

        {/* Optional Variants Selector */}
        {product.variants && product.variants.length > 1 && (
          <div className="space-y-2.5 pt-2 border-t border-[#D9D9D4]">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#123C2F] block">
              Option: <span className="font-normal text-[#333333]">{selectedVariant?.title}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.sku === v.sku;
                return (
                  <button
                    key={v.sku}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3.5 py-2 rounded-md text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'border-[#123C2F] bg-[#123C2F] text-white'
                        : 'border-[#D9D9D4] bg-white text-[#333333] hover:border-[#123C2F]'
                    }`}
                  >
                    {v.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity & Clear Add to Bag Button */}
        <div className="space-y-4 pt-3 border-t border-[#D9D9D4]">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-[#333333]">Quantity</span>
            <div className="inline-flex items-center border border-[#D9D9D4] rounded-md bg-white">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2.5 text-[#123C2F] hover:bg-[#E9EDE7] transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-medium text-[#333333]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                className="p-2.5 text-[#123C2F] hover:bg-[#E9EDE7] transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className="w-full py-3.5 px-6 rounded-md bg-[#123C2F] hover:bg-[#0D2E24] disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {addedFeedback ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>

        {/* Clean Essential Specs */}
        <div className="pt-4 border-t border-[#D9D9D4] space-y-3 text-xs sm:text-sm text-[#333333]/85">
          {product.description && product.shortSummary && product.description !== product.shortSummary && (
            <p className="leading-relaxed">{product.description}</p>
          )}

          {product.materials && product.materials.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="font-medium text-[#123C2F] shrink-0">Materials:</span>
              <span>{product.materials.join(', ')}</span>
            </div>
          )}

          {product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height) && (
            <div className="flex items-start gap-2">
              <span className="font-medium text-[#123C2F] shrink-0">Dimensions:</span>
              <span>
                {product.dimensions.length || '—'} × {product.dimensions.width || '—'} ×{' '}
                {product.dimensions.height || '—'} {product.dimensions.unit || 'cm'}
              </span>
            </div>
          )}

          <div className="bg-[#E9EDE7]/60 border border-[#D9D9D4] rounded-md p-3.5 text-xs text-[#333333] space-y-1">
            <p className="font-medium text-[#123C2F]">Islandwide Sri Lanka Delivery</p>
            <p>
              Delivered in 1–2 business days in Colombo and 2–4 business days outstation. Free delivery on orders over LKR 25,000.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
