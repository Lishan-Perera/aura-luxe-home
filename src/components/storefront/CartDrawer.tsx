'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatLKR } from '@/lib/utils';

export default function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal, getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(Boolean(data?.user));
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, [isOpen]);

  if (!mounted) return null;

  const subtotal = getSubtotal();

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
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={closeCart}
          className="fixed inset-0 z-50 bg-forest-900/60 backdrop-blur-sm transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-cream-50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col border-l border-gold-200/50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-300 px-6 py-5 bg-white">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-forest-700" />
            <h2 className="font-serif text-lg font-bold text-forest-900 tracking-wide">
              Your Shopping Bag ({getItemCount()})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="rounded-full p-2 text-forest-600 hover:bg-cream-200 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-cream-300">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mb-4 text-forest-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-medium text-forest-800 mb-1">Your bag is empty</h3>
              <p className="text-xs text-forest-600/80 mb-6 max-w-xs">
                Explore our curated Ceylon teak furniture, artisan lighting, and bespoke decor.
              </p>
              <button
                onClick={closeCart}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest-700 text-cream-50 hover:bg-forest-800 font-medium text-xs transition-all shadow-sm"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4 text-gold-300" />
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.productId}-${item.variantSku}`} className="py-4 flex gap-4">
                {/* Thumbnail */}
                <div className="relative w-20 h-20 rounded-md overflow-hidden bg-cream-200 shrink-0 border border-cream-300 shadow-inner">
                  <Image
                    src={item.image || '/assets/logo.png'}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-medium text-forest-900 line-clamp-1 font-serif">
                        {item.title}
                      </h4>
                      <button
                        onClick={() => removeItem(item.productId, item.variantSku)}
                        className="text-forest-400 hover:text-red-500 transition-colors p-0.5"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.variantTitle && (
                      <p className="text-xs text-forest-600/80 mt-0.5">{item.variantTitle}</p>
                    )}
                    <p className="text-sm font-semibold text-gold-600 mt-1">
                      {formatLKR(item.price)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-cream-300 rounded-md bg-white">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantSku)}
                        className="p-1 text-forest-600 hover:bg-cream-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-forest-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantSku)}
                        className="p-1 text-forest-600 hover:bg-cream-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-xs text-forest-600/70 font-medium">
                      Total: {formatLKR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-cream-300 p-6 bg-white space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-forest-700">Subtotal</span>
              <span className="font-serif text-lg font-bold text-forest-900">
                {formatLKR(subtotal)}
              </span>
            </div>

            <p className="text-xs text-forest-600/80 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold-500 shrink-0" />
              Sri Lanka Islandwide White-Glove Courier & COD.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full py-3 text-center border border-forest-600 text-forest-800 hover:bg-cream-100 font-medium text-xs tracking-wider uppercase rounded-md transition-all"
              >
                View Bag
              </Link>
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 text-center bg-forest-700 hover:bg-forest-800 text-cream-50 font-medium text-xs tracking-wider uppercase rounded-md shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-gold-300" />
                <span>{isAuthenticated === false ? 'Sign In & Pay' : 'Checkout'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
