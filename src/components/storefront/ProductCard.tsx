'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { formatLKR } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { MockProduct } from '@/lib/data/mockData';

interface ProductCardProps {
  product: MockProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images?.[1]?.url || primaryImage;

  const inWishlist = isInWishlist(product.id || product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id || product._id,
      title: product.title,
      price: product.price,
      image: primaryImage,
      variantSku: product.variants?.[0]?.sku || '',
      variantTitle: product.variants?.[0]?.title || undefined,
      maxStock: product.variants?.[0]?.stockQuantity || 10,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product.id || product._id,
      title: product.title,
      price: product.price,
      image: primaryImage,
      slug: product.slug,
    });
  };

  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="group relative flex flex-col bg-white rounded-lg overflow-hidden border border-cream-300 hover:border-gold-300/80 transition-all duration-300 hover:shadow-luxury">
      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className="relative aspect-square w-full overflow-hidden bg-cream-100">
        <Image
          src={primaryImage}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Secondary Image Flip on hover if available */}
        {product.images?.length > 1 && (
          <Image
            src={secondaryImage}
            alt={`${product.title} alternate view`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (
            <span className="bg-forest-700 text-cream-50 text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded">
              New Arrival
            </span>
          )}
          {discountPercent && (
            <span className="bg-gold-500 text-forest-900 text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 rounded shadow-sm">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
            inWishlist
              ? 'bg-gold-500 text-white'
              : 'bg-white/90 text-forest-800 hover:bg-white hover:text-gold-600'
          }`}
          aria-label="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Overlay on desktop hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hidden sm:block">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 px-4 bg-forest-800/95 hover:bg-forest-900 text-cream-50 text-xs font-medium uppercase tracking-wider rounded backdrop-blur-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-gold-300" />
            Quick Add to Bag
          </button>
        </div>
      </Link>

      {/* Info Content */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex items-center justify-between text-[11px] text-forest-500 mb-1">
            <span className="uppercase tracking-widest">{product.roomType}</span>
            <div className="flex items-center gap-1 text-gold-500 font-semibold">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.ratingSummary?.average?.toFixed(1) || '5.0'}</span>
            </div>
          </div>

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-sm font-semibold text-forest-900 group-hover:text-forest-700 transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>

          <p className="text-xs text-forest-600/80 mt-1 line-clamp-2">
            {product.shortSummary || product.description}
          </p>
        </div>

        {/* Price and Mobile Add */}
        <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-serif text-base font-bold text-forest-900">
              {formatLKR(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-forest-400 line-through">
                {formatLKR(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Mobile direct add button */}
          <button
            onClick={handleAddToCart}
            className="sm:hidden p-2 rounded-full bg-forest-700 text-cream-50 hover:bg-forest-800 transition-colors"
            aria-label="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4 text-gold-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

