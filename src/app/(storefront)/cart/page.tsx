'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatLKR } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD_LKR } from '@/lib/constants/districts';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(Boolean(data?.user)))
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const deliveryFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD_LKR ? 0 : 450;
  const finalTotal = subtotal + deliveryFee;

  const handleProceedToCheckout = () => {
    if (isAuthenticated) {
      router.push('/checkout');
    } else {
      router.push('/auth/login?redirect=/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#E9EDE7] mx-auto flex items-center justify-center text-[#123C2F]">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#123C2F]">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-[#666666] max-w-md mx-auto">
          Browse our collection to find timeless home décor pieces for your space.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-7 py-3 bg-[#123C2F] hover:bg-[#0D2E24] text-white text-sm font-medium rounded-md transition-colors"
        >
          <span>Shop Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#D9D9D4] pb-4 gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#123C2F]">
            Shopping Bag ({getItemCount()})
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Review your items before proceeding to checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="self-start sm:self-auto text-xs text-[#666666] hover:text-red-600 transition-colors underline"
        >
          Clear Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Product List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-lg border border-[#D9D9D4] divide-y divide-[#D9D9D4] overflow-hidden">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantSku}`}
                className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center"
              >
                <div className="relative w-24 h-24 rounded-md overflow-hidden bg-[#E9EDE7]/40 shrink-0 border border-[#D9D9D4]">
                  <Image src={item.image || '/assets/logo.png'} alt={item.title} fill className="object-cover" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-sm sm:text-base font-medium text-[#333333]">{item.title}</h3>
                  {item.variantTitle && (
                    <p className="text-xs text-[#666666]">{item.variantTitle}</p>
                  )}
                  <p className="text-sm font-semibold text-[#123C2F]">{formatLKR(item.price)}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                  <div className="inline-flex items-center border border-[#D9D9D4] rounded-md bg-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantSku)}
                      className="p-2 text-[#123C2F] hover:bg-[#E9EDE7] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center text-xs font-medium text-[#333333]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantSku)}
                      className="p-2 text-[#123C2F] hover:bg-[#E9EDE7] transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-semibold text-[#123C2F] min-w-[96px] text-right">
                    {formatLKR(item.price * item.quantity)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.variantSku)}
                    className="p-1.5 text-[#666666] hover:text-red-600 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#123C2F] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-lg border border-[#D9D9D4] space-y-5">
            <h2 className="text-base font-semibold text-[#123C2F] border-b border-[#D9D9D4] pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm text-[#333333]">
              <div className="flex justify-between">
                <span className="text-[#666666]">Subtotal</span>
                <span className="font-medium">{formatLKR(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#666666]">Delivery Fee</span>
                <span className="font-medium">
                  {deliveryFee === 0 ? 'Free' : formatLKR(deliveryFee)}
                </span>
              </div>

              <div className="pt-3 border-t border-[#D9D9D4] flex justify-between items-baseline text-base font-semibold text-[#123C2F]">
                <span>Total</span>
                <span className="text-xl">{formatLKR(finalTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 px-6 rounded-md bg-[#123C2F] hover:bg-[#0D2E24] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {isAuthenticated === false && (
              <p className="text-xs text-center text-[#666666]">
                You will be asked to sign in or register before completing your order.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
