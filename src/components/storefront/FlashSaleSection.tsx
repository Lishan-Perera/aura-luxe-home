'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { MockProduct } from '@/lib/data/mockData';
import { formatLKR } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { FlashSaleCampaign } from '@/lib/data/products';

interface FlashSaleSectionProps {
  products: MockProduct[];
  campaign?: FlashSaleCampaign;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(targetIso?: string | null): TimeRemaining | null {
  if (!targetIso) return null;
  const targetTime = new Date(targetIso).getTime();
  if (isNaN(targetTime)) return null;

  const now = Date.now();
  const diff = targetTime - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isExpired: false };
}

export default function FlashSaleSection({ products, campaign }: FlashSaleSectionProps) {
  const { addItem } = useCartStore();
  const [timeLeft, setTimeLeft] = useState<TimeRemaining | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Live countdown timer: ONLY active when real end date is configured and future
  useEffect(() => {
    if (!campaign?.endDate) {
      setTimeLeft(null);
      return;
    }

    const initial = calculateTimeRemaining(campaign.endDate);
    setTimeLeft(initial);

    if (!initial || initial.isExpired) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(campaign.endDate);
      setTimeLeft(remaining);
      if (remaining?.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [campaign?.endDate]);

  // Filter products for genuine discount integrity
  const saleProducts = (products || []).filter((p) => {
    // If specific flashSale dates exist, verify they haven't expired
    if (p.flashSale && p.flashSale.isActive) {
      if (p.flashSale.endDate) {
        const end = new Date(p.flashSale.endDate).getTime();
        if (end <= Date.now()) return false;
      }
      return true;
    }
    // Otherwise verify original compareAtPrice is strictly higher than sale price
    return p.compareAtPrice && p.compareAtPrice > p.price;
  });

  if (saleProducts.length === 0) {
    return null;
  }

  const handleAddToCart = (product: MockProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const primaryImage =
      product.images?.[0]?.url ||
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';

    addItem({
      productId: product.id || product._id,
      title: product.title,
      price: product.price,
      image: primaryImage,
      variantSku: product.variants?.[0]?.sku || '',
      variantTitle: product.variants?.[0]?.title || undefined,
      maxStock: product.variants?.[0]?.stockQuantity || 10,
    });

    setAddedProductId(product.id || product._id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1800);
  };

  const showCountdown = timeLeft && !timeLeft.isExpired;

  return (
    <section id="flash-sale" className="bg-white border-y border-[#D9D9D4] py-14 sm:py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Flash Sale Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#D9D9D4]/60">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-[#123C2F] text-white">
                {campaign?.badge || 'On Sale Now'}
              </span>
              <span className="text-xs font-semibold text-[#123C2F] tracking-wider uppercase">
                Limited Stock Sri Lanka
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-[#123C2F] tracking-tight">
              FLASH SALE
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Real countdown timer only when configured with a real end date */}
            {showCountdown && (
              <div className="flex items-center gap-2 bg-[#FBF8F3] border border-[#D9D9D4] rounded-md px-3 py-1.5 text-xs text-[#123C2F]">
                <Clock className="w-3.5 h-3.5 text-[#123C2F] animate-pulse" />
                <span className="font-medium text-[#666666]">Ends in:</span>
                <div className="flex items-center gap-1 font-mono font-semibold text-[#123C2F]">
                  {timeLeft.days > 0 && (
                    <>
                      <span className="px-1 py-0.5 bg-white rounded border border-[#D9D9D4]">
                        {String(timeLeft.days).padStart(2, '0')}d
                      </span>
                      <span>:</span>
                    </>
                  )}
                  <span className="px-1 py-0.5 bg-white rounded border border-[#D9D9D4]">
                    {String(timeLeft.hours).padStart(2, '0')}h
                  </span>
                  <span>:</span>
                  <span className="px-1 py-0.5 bg-white rounded border border-[#D9D9D4]">
                    {String(timeLeft.minutes).padStart(2, '0')}m
                  </span>
                  <span>:</span>
                  <span className="px-1 py-0.5 bg-white rounded border border-[#D9D9D4]">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            )}

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#123C2F] hover:underline"
            >
              <span>Shop All Deals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Product Cards Grid: Desktop 4-5, Tablet 3, Mobile 2 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {saleProducts.slice(0, 5).map((product) => {
            const originalPrice = product.compareAtPrice || product.price;
            const currentPrice = product.price;
            const discountPercent =
              originalPrice > currentPrice
                ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                : 0;

            const primaryImage =
              product.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';

            const isJustAdded = addedProductId === (product.id || product._id);

            return (
              <div
                key={product.id || product._id}
                className="group flex flex-col bg-white border border-[#D9D9D4] rounded-lg overflow-hidden transition-all duration-200 hover:border-[#123C2F]/60 hover:shadow-sm"
              >
                {/* Product Image & Badges */}
                <Link
                  href={`/product/${product.slug}`}
                  className="relative aspect-square w-full overflow-hidden bg-[#E9EDE7]/40 block"
                >
                  <Image
                    src={primaryImage}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-104"
                  />

                  {/* Real calculated discount percentage badge */}
                  {discountPercent > 0 && (
                    <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[11px] font-bold bg-[#123C2F] text-white shadow-xs">
                      -{discountPercent}%
                    </span>
                  )}
                </Link>

                {/* Card Info */}
                <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
                  <div className="space-y-1">
                    <p className="text-[10px] sm:text-[11px] text-[#666666] uppercase tracking-wide truncate">
                      {product.roomType}
                    </p>
                    <Link href={`/product/${product.slug}`} className="block">
                      <h3 className="text-xs sm:text-sm font-medium text-[#333333] group-hover:text-[#123C2F] transition-colors line-clamp-2 leading-snug">
                        {product.title}
                      </h3>
                    </Link>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-[#D9D9D4]/50">
                    {/* Genuine Price Comparison */}
                    <div>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm sm:text-base font-semibold text-[#123C2F]">
                          {formatLKR(currentPrice)}
                        </span>
                        {originalPrice > currentPrice && (
                          <span className="text-xs text-[#666666] line-through">
                            {formatLKR(originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock & Availability Indicator */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#123C2F]/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span className="truncate">Islandwide Delivery Available</span>
                    </div>

                    {/* Add to Bag Button */}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      className={`w-full py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        isJustAdded
                          ? 'bg-[#123C2F] text-white'
                          : 'bg-[#E9EDE7] hover:bg-[#123C2F] text-[#123C2F] hover:text-white'
                      }`}
                      aria-label={`Add ${product.title} to bag`}
                    >
                      {isJustAdded ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Added to Bag</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

