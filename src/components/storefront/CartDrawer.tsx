'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatLKR } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD_LKR } from '@/lib/constants/districts';

export default function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal, getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(Boolean(data?.user)))
      .catch(() => setIsAuthenticated(false));
  }, [isOpen]);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const deliveryFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD_LKR ? 0 : 450;
  const finalTotal = subtotal + deliveryFee;

  const handleCheckoutClick = () => {
    closeCart();
    if (isAuthenticated) {
      router.push('/checkout');
    } else {
      router.push('/auth/login?redirect=/checkout');
    }
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={closeCart}
          className="fixed inset-0 z-50 bg-[#123C2F]/40 transition-opacity"
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white border-l border-[#D9D9D4] transition-transform duration-200 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D9D9D4] px-6 py-4 bg-[#FBF8F3]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#123C2F]" />
            <h2 className="text-base font-semibold text-[#123C2F]">
              Shopping Bag ({getItemCount()})
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-1.5 rounded-md text-[#333333] hover:bg-[#E9EDE7] transition-colors"
            aria-label="Close bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#D9D9D4]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#E9EDE7] flex items-center justify-center text-[#123C2F]">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#123C2F]">Your bag is empty</h3>
                <p className="text-xs text-[#666666] mt-1 max-w-xs">
                  Add home décor pieces to your bag to get started.
                </p>
              </div>
              <Link
                href="/shop"
                onClick={closeCart}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#123C2F] hover:bg-[#0D2E24] text-white text-xs font-medium rounded-md transition-colors"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.productId}-${item.variantSku}`} className="py-4 flex gap-4">
                <div className="relative w-20 h-20 rounded-md overflow-hidden bg-[#E9EDE7]/40 shrink-0 border border-[#D9D9D4]">
                  <Image
                    src={item.image || '/assets/logo.png'}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-[#333333] line-clamp-1">
                        {item.title}
                      </h4>
                      {item.variantTitle && (
                        <p className="text-xs text-[#666666] mt-0.5">{item.variantTitle}</p>
                      )}
                      <p className="text-sm font-semibold text-[#123C2F] mt-1">
                        {formatLKR(item.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.variantSku)}
                      className="p-1 text-[#666666] hover:text-red-600 transition-colors shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center border border-[#D9D9D4] rounded-md bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantSku)}
                        className="p-1.5 text-[#123C2F] hover:bg-[#E9EDE7] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-medium text-[#333333]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantSku)}
                        className="p-1.5 text-[#123C2F] hover:bg-[#E9EDE7] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs font-medium text-[#333333]">
                      {formatLKR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary & Actions */}
        {items.length > 0 && (
          <div className="border-t border-[#D9D9D4] p-6 bg-[#FBF8F3] space-y-4">
            <div className="space-y-2 text-xs sm:text-sm text-[#333333]">
              <div className="flex justify-between">
                <span className="text-[#666666]">Subtotal</span>
                <span className="font-medium">{formatLKR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Delivery Fee</span>
                <span className="font-medium">
                  {deliveryFee === 0 ? 'Free' : `From ${formatLKR(deliveryFee)}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#D9D9D4] text-base font-semibold text-[#123C2F]">
                <span>Total</span>
                <span>{formatLKR(finalTotal)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full py-3 px-4 bg-[#123C2F] hover:bg-[#0D2E24] text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/cart"
                onClick={closeCart}
                className="block w-full py-2.5 text-center border border-[#D9D9D4] bg-white hover:bg-[#E9EDE7] text-[#123C2F] text-xs font-medium rounded-md transition-colors"
              >
                View Full Shopping Bag
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
