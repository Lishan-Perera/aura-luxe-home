'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { formatLKR } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { MockProduct } from '@/lib/data/mockData';

interface ProductCardProps {
  product: MockProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const primaryImage =
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';

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

  return (
    <div className="group flex flex-col bg-white border border-[#D9D9D4] rounded-lg overflow-hidden transition-colors hover:border-[#123C2F]/50">
      {/* Clean Product Image */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-[#E9EDE7]/40 block"
      >
        <Image
          src={primaryImage}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-103"
        />
      </Link>

      {/* Minimal Product Info */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <p className="text-[11px] text-[#666666] mb-1">{product.roomType}</p>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-sm font-medium text-[#333333] group-hover:text-[#123C2F] transition-colors line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="pt-2 border-t border-[#D9D9D4]/60 flex items-center justify-between gap-2">
          <div>
            <span className="text-sm font-semibold text-[#123C2F] block">
              {formatLKR(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-[#666666] line-through">
                {formatLKR(product.compareAtPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#E9EDE7] hover:bg-[#123C2F] text-[#123C2F] hover:text-white text-xs font-medium transition-colors shrink-0"
            aria-label={`Add ${product.title} to bag`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
