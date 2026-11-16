'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, ShoppingBag, ArrowLeft, Tag, Lock, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatLKR } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD_LKR } from '@/lib/constants/districts';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getItemCount } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    discountPercent?: number;
    description: string;
  } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check authentication status
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(Boolean(data?.user));
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  const finalSubtotal = Math.max(0, subtotal - discountAmount);
  const remainingForFreeDelivery = Math.max(0, FREE_SHIPPING_THRESHOLD_LKR - finalSubtotal);
  const progressPercent = Math.min(100, Math.round((finalSubtotal / FREE_SHIPPING_THRESHOLD_LKR) * 100));

  const applyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    try {
      const res = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Invalid promotion code');
      }

      setAppliedPromo({
        code: data.code,
        discountAmount: data.discountAmount,
        discountPercent: data.discountPercent,
        description: data.description,
      });
    } catch (err: any) {
      setPromoError(err.message || 'Invalid promotion voucher');
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (isAuthenticated) {
      router.push('/checkout');
    } else {
      router.push('/auth/login?redirect=/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-cream-200 mx-auto flex items-center justify-center text-forest-500 shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-forest-900">Your Shopping Bag is Empty</h1>
        <p className="text-sm text-forest-600 max-w-md mx-auto leading-relaxed">
          Explore our handcrafted Ceylon teak collections, sculpted ceramics, and warm brass fixtures.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-forest-700 hover:bg-forest-800 text-cream-50 font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-md"
        >
          Explore Collections
          <ArrowRight className="w-4 h-4 text-gold-300" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cream-300 pb-4 gap-2">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900">
            Shopping Bag ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-forest-600 mt-1">Review your bespoke architectural furnishings before checkout.</p>
        </div>
        <button
          onClick={clearCart}
          className="self-start sm:self-auto text-xs text-forest-500 hover:text-red-600 transition-colors underline"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Items List (Col 1 to 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Islandwide White-Glove Shipping Progress */}
          <div className="bg-cream-200/80 p-4 rounded-xl border border-cream-300 text-xs shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-serif font-bold text-forest-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-gold-500" />
                Islandwide White-Glove Courier Delivery
              </span>
              {remainingForFreeDelivery === 0 ? (
                <span className="text-forest-800 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  FREE White-Glove Delivery Unlocked!
                </span>
              ) : (
                <span className="text-forest-700">
                  Add <strong className="text-forest-900">{formatLKR(remainingForFreeDelivery, true)}</strong> more for Free Delivery
                </span>
              )}
            </div>
            <div className="w-full h-2 bg-cream-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-400 to-forest-600 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items Card */}
          <div className="bg-white rounded-xl border border-cream-300 divide-y divide-cream-200 shadow-sm overflow-hidden">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantSku}`} className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-cream-100 shrink-0 border border-cream-200 shadow-inner">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>

                <div className="flex-1 space-y-1">
                  <h3 className="font-serif text-base font-bold text-forest-900">{item.title}</h3>
                  {item.variantTitle && (
                    <p className="text-xs text-forest-600">{item.variantTitle}</p>
                  )}
                  <p className="text-sm font-semibold text-gold-600">{formatLKR(item.price)}</p>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center border border-cream-300 rounded-lg bg-white shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantSku)}
                      className="px-3 py-1 text-forest-700 hover:bg-cream-100 font-bold text-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-forest-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantSku)}
                      className="px-3 py-1 text-forest-700 hover:bg-cream-100 font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-serif text-sm font-bold text-forest-900 w-28 text-right">
                    {formatLKR(item.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(item.productId, item.variantSku)}
                    className="p-1.5 text-forest-400 hover:text-red-500 transition-colors"
                    title="Remove piece"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-semibold text-forest-700 hover:text-gold-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Browsing More Collections
          </Link>
        </div>

        {/* Order Summary (Col 9 to 12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-cream-300 shadow-sm space-y-5">
            <h3 className="font-serif text-lg font-bold text-forest-900 border-b border-cream-200 pb-3">
              Order Summary
            </h3>

            {/* Voucher Promotion Input */}
            <form onSubmit={applyPromo} className="space-y-2">
              <label className="text-xs font-semibold text-forest-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gold-500" />
                <span>Privilege Promotion Voucher</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. AURA10"
                  className="flex-1 text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 uppercase font-mono"
                />
                <button
                  type="submit"
                  disabled={promoLoading}
                  className="px-4 py-2.5 bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-cream-50 text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  {promoLoading ? '...' : 'Apply'}
                </button>
              </div>

              {appliedPromo && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] flex items-center justify-between">
                  <span>✨ {appliedPromo.description}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPromo(null);
                      setPromoCode('');
                    }}
                    className="text-red-500 hover:underline font-semibold ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-[11px] font-medium text-red-600">
                  {promoError}
                </p>
              )}
            </form>

            <div className="space-y-2.5 text-xs text-forest-700 pt-3 border-t border-cream-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-forest-900">{formatLKR(subtotal)}</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Voucher Discount</span>
                  <span>-{formatLKR(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Islandwide Delivery</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="pt-3 border-t border-cream-300 flex justify-between items-baseline">
              <span className="font-serif font-bold text-sm text-forest-900">Estimated Total</span>
              <span className="font-serif text-2xl font-bold text-forest-900">
                {formatLKR(finalSubtotal)}
              </span>
            </div>

            {/* Auth Guarded Checkout Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-4 px-6 rounded-lg bg-forest-700 hover:bg-forest-800 text-cream-50 font-serif font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-gold-300" />
              <span>
                {isAuthenticated === false ? 'Sign In & Proceed to Checkout' : 'Proceed to Sri Lanka Checkout'}
              </span>
              <ArrowRight className="w-4 h-4 text-gold-300" />
            </button>

            {isAuthenticated === false && (
              <p className="text-[11px] text-center text-forest-600">
                Sign in is required before order placement. Your bag items will be saved.
              </p>
            )}

            <div className="flex items-center gap-2 text-[11px] text-forest-600/80 pt-2 border-t border-cream-200">
              <ShieldCheck className="w-4 h-4 text-gold-500 shrink-0" />
              <span>Cash on Delivery supported across all 25 Sri Lankan districts.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
