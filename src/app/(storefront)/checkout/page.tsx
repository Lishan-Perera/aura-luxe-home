'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Check,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CreditCard,
  MapPin,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatLKR } from '@/lib/utils';
import { SRI_LANKA_DISTRICTS, getDeliveryFee } from '@/lib/constants/districts';

interface SavedAddress {
  _id: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  isDefaultShipping?: boolean;
}

interface ConfirmedOrder {
  orderNumber: string;
  totalAmount: number;
  deliveryEta: string;
  district: string;
  addressSummary: string;
  paymentMethod: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [user, setUser] = useState<{ fullName: string; email: string; phone?: string } | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  // Step 1: Delivery Information (Minimal essential fields)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('Colombo');
  const [saveAddress, setSaveAddress] = useState(true);

  // Step 2: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'cod'>('cod');

  // Step 3: Confirmation
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);

    const loadAuthAndAddresses = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!data?.user) {
          router.replace('/auth/login?redirect=/checkout');
          return;
        }

        setUser(data.user);
        setFullName(data.user.fullName || '');
        setEmail(data.user.email || '');
        if (data.user.phone) setPhone(data.user.phone);

        try {
          const addrRes = await fetch('/api/user/addresses');
          const addrData = await addrRes.json();
          if (addrData?.addresses && addrData.addresses.length > 0) {
            setSavedAddresses(addrData.addresses);
            const def =
              addrData.addresses.find((a: SavedAddress) => a.isDefaultShipping) ||
              addrData.addresses[0];
            setSelectedAddressId(def._id);
            setFullName(def.recipientName || data.user.fullName || '');
            setPhone(def.phone || data.user.phone || '');
            setAddressLine1(def.addressLine1 || '');
            setCity(def.city || '');
            setDistrict(def.district || 'Colombo');
          }
        } catch {
          // Optional saved addresses fetch failure is non-fatal
        }
      } catch {
        router.replace('/auth/login?redirect=/checkout');
      } finally {
        setAuthChecking(false);
      }
    };

    loadAuthAndAddresses();
  }, [router]);

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr._id);
    setFullName(addr.recipientName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setCity(addr.city);
    setDistrict(addr.district);
    setError('');
  };

  if (!mounted || authChecking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#123C2F] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[#666666]">Loading checkout...</p>
      </div>
    );
  }

  if (items.length === 0 && step !== 3) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#E9EDE7] mx-auto flex items-center justify-center text-[#123C2F]">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-semibold text-[#123C2F]">Your Shopping Bag is Empty</h1>
        <p className="text-sm text-[#666666]">Add items to your bag before checking out.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#123C2F] hover:bg-[#0D2E24] text-white text-sm font-medium rounded-md transition-colors"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const { fee: shippingFee, eta } = getDeliveryFee(district, subtotal);
  const totalAmount = subtotal + shippingFee;

  const handleContinueToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 9) {
      setError('Please enter a valid contact phone number (e.g. 077 123 4567).');
      return;
    }
    if (!addressLine1.trim()) {
      setError('Please enter your delivery street address.');
      return;
    }
    if (!city.trim()) {
      setError('Please enter your city or town.');
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo: {
            fullName: fullName.trim(),
            email: (email || user?.email || '').trim(),
            phone: phone.trim(),
          },
          shippingAddress: {
            recipientName: fullName.trim(),
            phone: phone.trim(),
            addressLine1: addressLine1.trim(),
            city: city.trim(),
            district,
          },
          items,
          paymentMethod,
          saveAddress: selectedAddressId === 'new' ? saveAddress : false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not place your order. Please try again.');
      }

      setConfirmedOrder({
        orderNumber: data.orderNumber,
        totalAmount: data.totalAmount ?? totalAmount,
        deliveryEta: data.deliveryEta || eta,
        district,
        addressSummary: `${addressLine1.trim()}, ${city.trim()}, ${district}`,
        paymentMethod: 'Cash on Delivery',
      });

      clearCart();
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Delivery Information' },
    { num: 2, label: 'Review & Payment' },
    { num: 3, label: 'Order Confirmation' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#123C2F]">Checkout</h1>
        <p className="text-xs sm:text-sm text-[#666666]">
          Simple three-step order placement with islandwide delivery across Sri Lanka.
        </p>
      </div>

      {/* 3-Step Visual Stepper */}
      <div className="bg-white border border-[#D9D9D4] rounded-lg p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {steps.map((s) => {
            const isCompleted = step > s.num;
            const isActive = step === s.num;
            return (
              <div key={s.num} className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                    isCompleted || isActive
                      ? 'bg-[#123C2F] text-white'
                      : 'bg-[#E9EDE7] text-[#666666]'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    isCompleted || isActive ? 'text-[#123C2F]' : 'text-[#666666]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ============================================================
          STEP 1: DELIVERY INFORMATION
      ============================================================ */}
      {step === 1 && (
        <form onSubmit={handleContinueToReview} className="bg-white border border-[#D9D9D4] rounded-lg p-5 sm:p-8 space-y-6">
          <div className="border-b border-[#D9D9D4] pb-3">
            <h2 className="text-lg font-semibold text-[#123C2F]">Step 1: Delivery Information</h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Enter where you would like your order delivered.
            </p>
          </div>

          {/* Saved Addresses Quick Selector */}
          {savedAddresses.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-medium text-[#333333]">Saved Addresses</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((addr) => {
                  const active = selectedAddressId === addr._id;
                  return (
                    <button
                      key={addr._id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`text-left p-3.5 rounded-md border transition-colors text-xs space-y-1 ${
                        active
                          ? 'border-[#123C2F] bg-[#E9EDE7]/60'
                          : 'border-[#D9D9D4] bg-white hover:bg-[#FBF8F3]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#123C2F]">{addr.recipientName}</span>
                        {active && <Check className="w-3.5 h-3.5 text-[#123C2F]" />}
                      </div>
                      <p className="text-[#333333]">{addr.addressLine1}, {addr.city}</p>
                      <p className="text-[#666666]">{addr.district} • {addr.phone}</p>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAddressId('new');
                    setAddressLine1('');
                    setCity('');
                  }}
                  className={`text-left p-3.5 rounded-md border border-dashed text-xs font-medium transition-colors flex items-center gap-2 ${
                    selectedAddressId === 'new'
                      ? 'border-[#123C2F] bg-[#E9EDE7]/50 text-[#123C2F]'
                      : 'border-[#D9D9D4] text-[#666666] hover:border-[#123C2F]'
                  }`}
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>Use a new delivery address</span>
                </button>
              </div>
            </div>
          )}

          {/* Clean Essential Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#333333] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ruwan Jayawardena"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9D9D4] rounded-md text-[#333333] focus:outline-none focus:border-[#123C2F]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#333333] mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 077 123 4567"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9D9D4] rounded-md text-[#333333] focus:outline-none focus:border-[#123C2F]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#333333] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9D9D4] rounded-md text-[#333333] focus:outline-none focus:border-[#123C2F]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#333333] mb-1.5">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="House number, street name, apartment"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9D9D4] rounded-md text-[#333333] focus:outline-none focus:border-[#123C2F]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#333333] mb-1.5">
                City / Town *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Colombo 07"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9D9D4] rounded-md text-[#333333] focus:outline-none focus:border-[#123C2F]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#333333] mb-1.5">
                District *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D9D9D4] rounded-md text-[#333333] focus:outline-none focus:border-[#123C2F]"
              >
                {SRI_LANKA_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.province})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedAddressId === 'new' && (
            <label className="inline-flex items-center gap-2 text-xs text-[#333333] cursor-pointer">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="rounded border-[#D9D9D4] text-[#123C2F] focus:ring-[#123C2F]"
              />
              <span>Save this address to my account for future orders</span>
            </label>
          )}

          <div className="pt-4 border-t border-[#D9D9D4] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <Link
              href="/cart"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#123C2F] hover:bg-[#E9EDE7] rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Bag</span>
            </Link>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#123C2F] hover:bg-[#0D2E24] text-white text-sm font-medium rounded-md transition-colors"
            >
              <span>Continue to Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* ============================================================
          STEP 2: ORDER REVIEW & PAYMENT METHOD
      ============================================================ */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Delivery Summary */}
          <div className="bg-white border border-[#D9D9D4] rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                Delivering To
              </p>
              <p className="font-semibold text-[#123C2F]">{fullName}</p>
              <p className="text-[#333333]">
                {addressLine1}, {city}, {district}
              </p>
              <p className="text-xs text-[#666666]">
                {phone} {email ? `• ${email}` : ''} • Estimated delivery: {eta}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="self-start text-xs font-medium text-[#123C2F] underline hover:opacity-80"
            >
              Edit Address
            </button>
          </div>

          {/* Items & Pricing Review */}
          <div className="bg-white border border-[#D9D9D4] rounded-lg p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#123C2F] border-b border-[#D9D9D4] pb-3">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            <div className="divide-y divide-[#D9D9D4]/70">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantSku}`} className="py-3 flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-md overflow-hidden bg-[#E9EDE7]/40 border border-[#D9D9D4] shrink-0">
                    <Image src={item.image || '/assets/logo.png'} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#333333] truncate">{item.title}</p>
                    <p className="text-xs text-[#666666]">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#123C2F] shrink-0">
                    {formatLKR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#D9D9D4] space-y-2 text-sm text-[#333333]">
              <div className="flex justify-between">
                <span className="text-[#666666]">Subtotal</span>
                <span>{formatLKR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Delivery ({district})</span>
                <span>{shippingFee === 0 ? 'Free' : formatLKR(shippingFee)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#D9D9D4] text-base font-semibold text-[#123C2F]">
                <span>Final Total</span>
                <span className="text-lg">{formatLKR(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-[#D9D9D4] rounded-lg p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#123C2F] border-b border-[#D9D9D4] pb-3">
              Payment Method
            </h2>

            <div className="space-y-3">
              {/* Cash on Delivery (Active) */}
              <label className="p-4 rounded-md border border-[#123C2F] bg-[#E9EDE7]/40 flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-[#123C2F] focus:ring-[#123C2F]"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Banknote className="w-4 h-4 text-[#123C2F]" />
                    <span className="text-sm font-semibold text-[#123C2F]">Cash on Delivery</span>
                    <span className="text-[11px] bg-[#123C2F] text-white px-2 py-0.5 rounded">
                      Available
                    </span>
                  </div>
                  <p className="text-xs text-[#333333]/80">
                    Pay in cash upon delivery after inspecting your items at your doorstep.
                  </p>
                </div>
              </label>

              {/* Online Card Payment (Unavailable) */}
              <div className="p-4 rounded-md border border-[#D9D9D4] bg-[#FBF8F3] opacity-70 flex items-start gap-3 cursor-not-allowed">
                <input
                  type="radio"
                  name="paymentMethod"
                  disabled
                  checked={false}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CreditCard className="w-4 h-4 text-[#666666]" />
                    <span className="text-sm font-medium text-[#333333]">Online Card Payment</span>
                    <span className="text-[11px] bg-[#E9EDE7] text-[#333333] px-2 py-0.5 rounded">
                      Currently Unavailable
                    </span>
                  </div>
                  <p className="text-xs text-[#666666]">
                    Online card payment gateway is not enabled yet. Please use Cash on Delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#123C2F] bg-white border border-[#D9D9D4] hover:bg-[#E9EDE7] rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Delivery</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handlePlaceOrder}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#123C2F] hover:bg-[#0D2E24] disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
            >
              <span>{loading ? 'Placing Order...' : `Place Order (${formatLKR(totalAmount)})`}</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          STEP 3: ORDER CONFIRMATION
      ============================================================ */}
      {step === 3 && confirmedOrder && (
        <div className="bg-white border border-[#D9D9D4] rounded-lg p-6 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#E9EDE7] text-[#123C2F] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#123C2F]">
              Order Confirmed
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#123C2F]">
              Thank You for Your Order
            </h2>
            <p className="text-sm text-[#666666] max-w-md mx-auto">
              Your order has been received and is now being prepared for delivery.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-[#FBF8F3] border border-[#D9D9D4] rounded-md p-5 text-left text-sm space-y-2.5">
            <div className="flex justify-between gap-2">
              <span className="text-[#666666]">Order Number</span>
              <span className="font-semibold text-[#123C2F]">{confirmedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#666666]">Payment Method</span>
              <span className="font-medium text-[#333333]">{confirmedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#666666]">Delivery Address</span>
              <span className="font-medium text-[#333333] text-right">{confirmedOrder.addressSummary}</span>
            </div>
            <div className="flex justify-between gap-2 pt-2 border-t border-[#D9D9D4]">
              <span className="font-semibold text-[#123C2F]">Total Amount</span>
              <span className="font-semibold text-[#123C2F]">{formatLKR(confirmedOrder.totalAmount)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/account"
              className="w-full sm:w-auto px-6 py-3 bg-[#123C2F] hover:bg-[#0D2E24] text-white text-sm font-medium rounded-md transition-colors"
            >
              View My Orders
            </Link>
            <Link
              href="/shop"
              className="w-full sm:w-auto px-6 py-3 bg-white border border-[#D9D9D4] hover:bg-[#E9EDE7] text-[#123C2F] text-sm font-medium rounded-md transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
