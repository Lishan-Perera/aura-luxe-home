'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  Banknote,
  CreditCard,
  Building,
  UploadCloud,
  Lock,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Edit2,
  Plus,
  Tag,
  AlertCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { SRI_LANKA_DISTRICTS, getDeliveryFee, FREE_SHIPPING_THRESHOLD_LKR } from '@/lib/constants/districts';
import { formatLKR } from '@/lib/utils';

interface SavedAddress {
  id: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  isDefaultShipping?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // User & Auth State
  const [user, setUser] = useState<{ userId: string; email: string; fullName: string; phone?: string } | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Address State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('custom');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);

  // Form Fields
  const [recipientName, setRecipientName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('Colombo');
  const [postalCode, setPostalCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'bank_transfer'>('cod');

  // Card Payment Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'amex' | 'unknown'>('unknown');

  // Bank Transfer Details & Settings
  const [bankSettings, setBankSettings] = useState<{
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
    isVerified: boolean;
  }>({
    bankName: 'Commercial Bank of Ceylon',
    accountName: 'Aura Luxe Home (Pvt) Ltd',
    accountNumber: '1000 8492 0184',
    branch: 'Colombo Ward Place Prestige Branch',
    isVerified: true,
  });
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    discountPercent?: number;
    description: string;
  } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  // 1. Initial Auth and Profile Fetch
  useEffect(() => {
    setMounted(true);

    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        if (!data?.user) {
          router.replace('/auth/login?redirect=/checkout');
          return;
        }

        setUser(data.user);
        setRecipientName(data.user.fullName || '');
        setContactEmail(data.user.email || '');
        setContactPhone(data.user.phone || '');

        if (data.addresses && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
          const defaultAddr = data.addresses.find((a: SavedAddress) => a.isDefaultShipping) || data.addresses[0];
          applyAddress(defaultAddr);
        } else {
          setIsEditingAddress(true);
        }

        setAuthChecking(false);
      })
      .catch(() => {
        router.replace('/auth/login?redirect=/checkout');
      });

    // Fetch store bank & logistics settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.bank) {
          setBankSettings(data.bank);
        }
      })
      .catch((err) => console.warn('Could not load settings:', err));
  }, [router]);

  const applyAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setRecipientName(addr.recipientName);
    setContactPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setDistrict(addr.district);
    setPostalCode(addr.postalCode || '');
    setIsEditingAddress(false);
  };

  const handleAddNewAddressClick = () => {
    setSelectedAddressId('new');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setDistrict('Colombo');
    setPostalCode('');
    setIsEditingAddress(true);
  };

  // Card Number Formatting & Brand Detection
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '').slice(0, 16);
    let brand: 'visa' | 'mastercard' | 'amex' | 'unknown' = 'unknown';

    if (raw.startsWith('4')) {
      brand = 'visa';
    } else if (/^(5[1-5]|2[2-7])/.test(raw)) {
      brand = 'mastercard';
    } else if (/^(34|37)/.test(raw)) {
      brand = 'amex';
    }
    setCardBrand(brand);

    // Format with spaces
    const parts = raw.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  // Expiry formatting MM/YY
  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Slip upload
  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
    }
  };

  // Promo Code Validation
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (!promoInput.trim()) return;

    setPromoLoading(true);
    try {
      const res = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, subtotal: getSubtotal() }),
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

  // Calculations
  const rawSubtotal = mounted ? getSubtotal() : 0;
  const promoDiscount = appliedPromo ? appliedPromo.discountAmount : 0;
  const subtotal = Math.max(0, rawSubtotal - promoDiscount);
  const { fee: shippingFee, isFree, eta } = getDeliveryFee(district, subtotal);
  const totalAmount = subtotal + shippingFee;

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!recipientName || !contactPhone || !addressLine1 || !city || !district) {
      setError('Please provide a complete Sri Lankan delivery address and recipient contact.');
      setIsEditingAddress(true);
      return;
    }

    if (items.length === 0) {
      setError('Your shopping bag is empty.');
      return;
    }

    if (paymentMethod === 'card') {
      const rawCard = cardNumber.replace(/\s/g, '');
      if (rawCard.length < 15) {
        setError('Please enter a valid 16-digit credit/debit card number.');
        return;
      }
      if (!cardHolder.trim()) {
        setError('Please enter the name on the card.');
        return;
      }
      if (cardExpiry.length < 5) {
        setError('Please enter a valid card expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setError('Please enter your 3 or 4-digit card security code (CVV).');
        return;
      }
    }

    if (paymentMethod === 'bank_transfer' && !bankSettings.isVerified) {
      setError('Direct Bank Transfer is currently undergoing admin verification. Please choose COD or Card payment.');
      return;
    }

    setLoading(true);

    try {
      let bankDepositSlip = undefined;
      if (paymentMethod === 'bank_transfer' && slipFile) {
        bankDepositSlip = {
          url: slipPreview || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
          public_id: `slip-${Date.now()}`,
          uploadedAt: new Date(),
        };
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo: {
            fullName: recipientName,
            email: contactEmail || user?.email || 'customer@auraluxe.lk',
            phone: contactPhone,
          },
          shippingAddress: {
            recipientName,
            phone: contactPhone,
            addressLine1,
            addressLine2,
            city,
            district,
            postalCode,
          },
          items,
          paymentMethod,
          bankDepositSlip,
          orderNotes,
          promoCode: appliedPromo?.code,
          saveAddress: saveAddressToProfile,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      clearCart();
      router.push(
        `/checkout/success?orderNumber=${data.orderNumber}&district=${encodeURIComponent(district)}&total=${totalAmount}&method=${paymentMethod}&status=${data.paymentStatus || 'pending'}`
      );
    } catch (err: any) {
      setError(err.message || 'Something went wrong while placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authChecking || !mounted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" />
        <p className="font-serif text-sm font-semibold text-forest-800 tracking-wider">
          Connecting to Aura Luxe Secure Client Sanctuary...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif text-2xl font-bold text-forest-900">Your shopping bag is empty</h1>
        <p className="text-xs text-forest-600">Please select pieces from our collections before checking out.</p>
        <Link href="/shop" className="inline-block mt-4 px-6 py-2.5 rounded-full bg-forest-700 text-cream-50 text-xs font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Checkout Title */}
      <div className="border-b border-cream-300 pb-4">
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs text-forest-600 hover:text-gold-600 mb-2 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Shopping Bag
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 tracking-tight">
              Sri Lanka Islandwide Luxury Checkout
            </h1>
            <p className="text-xs text-forest-600 mt-1">
              Signed in as <strong className="text-forest-900">{user?.fullName || user?.email}</strong>. White-glove concierge dispatch.
            </p>
          </div>
          <span className="self-start sm:self-auto bg-forest-100 text-forest-800 border border-forest-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-forest-700" />
            Verified Customer Session
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Main Two-Column Layout (Daraz Structure, Luxury Style) */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* =================================================================== */}
        {/* LEFT COLUMN: Shipping & Billing, Delivery Method, Order Items Preview */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION A: Shipping & Billing */}
          <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-600" />
                <h2 className="font-serif text-base font-bold text-forest-900">
                  1. Shipping & Delivery Address
                </h2>
              </div>
              {!isEditingAddress && (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Address
                </button>
              )}
            </div>

            {/* Saved Address Selector (if addresses exist and not adding/editing manually) */}
            {savedAddresses.length > 0 && !isEditingAddress && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-cream-50/70 border border-cream-300 space-y-1.5 text-xs text-forest-800">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-forest-900">{recipientName}</span>
                    <span className="bg-forest-100 text-forest-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      Deliver Here
                    </span>
                  </div>
                  <p className="text-forest-700">{contactPhone} • {contactEmail}</p>
                  <p className="text-forest-700">{addressLine1}{addressLine2 ? `, ${addressLine2}` : ''}</p>
                  <p className="text-forest-700">{city}, <strong className="text-forest-900">{district} District</strong> {postalCode && `• ${postalCode}`}</p>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  {savedAddresses.length > 1 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-forest-600">Select address:</span>
                      <select
                        value={selectedAddressId}
                        onChange={(e) => {
                          const addr = savedAddresses.find((a) => a.id === e.target.value);
                          if (addr) applyAddress(addr);
                        }}
                        className="text-xs bg-white border border-cream-300 rounded px-2.5 py-1.5 text-forest-900 font-medium"
                      >
                        {savedAddresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.recipientName} ({addr.city}, {addr.district})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddNewAddressClick}
                    className="text-xs text-forest-700 hover:text-gold-600 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold-500" />
                    + Add New Address
                  </button>
                </div>
              </div>
            )}

            {/* Address Edit / Entry Form */}
            {isEditingAddress && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-forest-800 block mb-1">
                      Recipient Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Ruwan Jayawardena"
                      className="w-full text-xs px-3.5 py-2.5 bg-cream-50/70 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 text-forest-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-forest-800 block mb-1">
                      Mobile Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="077 123 4567 or +94 77 123 4567"
                      className="w-full text-xs px-3.5 py-2.5 bg-cream-50/70 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 text-forest-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-forest-800 block mb-1">
                      Street Address & Building / House No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="e.g. No. 14, Ward Place"
                      className="w-full text-xs px-3.5 py-2.5 bg-cream-50/70 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 text-forest-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-forest-800 block mb-1">
                      Apartment, Floor, Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="e.g. Level 4, Residence Towers"
                      className="w-full text-xs px-3.5 py-2.5 bg-cream-50/70 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 text-forest-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-forest-800 block mb-1">
                      City / Town <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Colombo 07"
                      className="w-full text-xs px-3.5 py-2.5 bg-cream-50/70 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 text-forest-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-forest-800 block mb-1">
                      District (All 25 Sri Lankan Districts) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 bg-white border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 text-forest-900 font-medium"
                    >
                      {SRI_LANKA_DISTRICTS.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name} ({d.province} Province)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-forest-800 block mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 00700"
                      className="w-full text-xs px-3.5 py-2.5 bg-cream-50/70 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 text-forest-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-forest-800 block mb-1">
                      Order Updates Email
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full text-xs px-3.5 py-2.5 bg-cream-50/70 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 text-forest-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs text-forest-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddressToProfile}
                      onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                      className="rounded text-forest-700 focus:ring-forest-600"
                    />
                    <span>Save this address to my client sanctuary profile</span>
                  </label>

                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="text-xs text-forest-600 hover:text-forest-900 underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION B: Delivery Method (Dynamic from Settings / Districts) */}
          <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gold-600" />
                <h2 className="font-serif text-base font-bold text-forest-900">
                  2. Delivery Method & Fulfillment
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-forest-800 bg-cream-200 px-2.5 py-0.5 rounded-full">
                Prompt Xpress / Domex
              </span>
            </div>

            <div className="p-4 rounded-xl border border-forest-600/30 bg-cream-50/70 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-forest-900">
                    White-Glove Islandwide Delivery ({district})
                  </span>
                  {isFree ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      FREE
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-forest-900">{formatLKR(shippingFee)}</span>
                  )}
                </div>
                <p className="text-xs text-forest-600">
                  Guaranteed delivery timeline: <strong>{eta}</strong>. Includes doorstep inspection and placement.
                </p>
              </div>

              <CheckCircle2 className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
            </div>
          </div>

          {/* SECTION C: Order Items Preview */}
          <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h2 className="font-serif text-base font-bold text-forest-900">
                3. Order Items ({items.length})
              </h2>
              <Link href="/cart" className="text-xs text-gold-600 hover:text-gold-700 font-semibold underline">
                Modify Bag
              </Link>
            </div>

            <div className="divide-y divide-cream-200">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantSku}`} className="py-3 flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-lg bg-cream-100 overflow-hidden shrink-0 border border-cream-200 shadow-inner">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 text-xs">
                    <h4 className="font-serif font-bold text-forest-900">{item.title}</h4>
                    {item.variantTitle && <p className="text-forest-500">{item.variantTitle}</p>}
                    <p className="text-forest-600 mt-0.5">
                      {formatLKR(item.price)} × Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-serif font-bold text-xs text-forest-900">
                    {formatLKR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION D: Special Delivery Instructions */}
          <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm space-y-2">
            <label className="text-xs font-semibold text-forest-800 block">
              Special Delivery Notes / Gate Access (Optional)
            </label>
            <textarea
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Please call 15 minutes before arrival; leave at reception or security gate."
              className="w-full text-xs px-3.5 py-2.5 bg-cream-50/70 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 text-forest-900"
            />
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Payment Method, Card Payment Form, Promotion, Summary */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-md space-y-6 sticky top-28">
            {/* PAYMENT METHOD SELECTION */}
            <div className="space-y-4">
              <h2 className="font-serif text-lg font-bold text-forest-900 border-b border-cream-200 pb-2">
                Select Payment Method
              </h2>

              <div className="space-y-3">
                {/* 1. Cash on Delivery (COD) */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-forest-700 bg-cream-50 ring-1 ring-forest-700 shadow-sm'
                      : 'border-cream-300 bg-white hover:border-gold-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-forest-700 focus:ring-forest-600"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-forest-700" />
                      <span className="font-serif font-bold text-xs text-forest-900">
                        Cash on Delivery (COD)
                      </span>
                      <span className="bg-forest-100 text-forest-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        All 25 Districts
                      </span>
                    </div>
                    <p className="text-[11px] text-forest-600 leading-relaxed">
                      Pay cash or card to our white-glove courier team upon inspecting your pieces at your doorstep.
                    </p>
                  </div>
                </label>

                {/* 2. Credit / Debit Card (PCI-DSS Compliant) */}
                <label
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-forest-700 bg-cream-50 ring-1 ring-forest-700 shadow-sm'
                      : 'border-cream-300 bg-white hover:border-gold-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mt-1 text-forest-700 focus:ring-forest-600"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-forest-700" />
                        <span className="font-serif font-bold text-xs text-forest-900">
                          Credit / Debit Card
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          VISA
                        </span>
                        <span className="text-[10px] font-bold text-red-800 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                          MC
                        </span>
                        <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                          AMEX
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-forest-600 leading-relaxed">
                      256-bit encrypted checkout. Local & international cards accepted.
                    </p>
                  </div>
                </label>

                {/* Card Payment Form Section (Appears when Card is active) */}
                {paymentMethod === 'card' && (
                  <div className="bg-cream-100/80 p-4 rounded-xl border border-gold-300/60 space-y-3.5 animate-fadeIn">
                    {/* Visual Card Preview */}
                    <div className="bg-gradient-to-tr from-forest-900 via-forest-800 to-forest-950 text-cream-100 p-4 rounded-xl shadow-lg border border-gold-400/30 space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-serif text-[10px] uppercase tracking-[0.2em] text-gold-400">
                          Aura Luxe Sanctuary Card
                        </span>
                        <span className="text-[11px] font-bold text-gold-300 uppercase tracking-widest">
                          {cardBrand !== 'unknown' ? cardBrand.toUpperCase() : 'VISA / MC'}
                        </span>
                      </div>
                      <p className="font-mono text-sm tracking-[0.25em] text-cream-50 pt-1">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex justify-between text-[10px] text-cream-300/80 pt-1">
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-gold-400">Cardholder</span>
                          <span className="font-medium uppercase">{cardHolder || 'CLIENT NAME'}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-gold-400">Expires</span>
                          <span className="font-medium">{cardExpiry || 'MM/YY'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-semibold text-forest-800 block mb-1">
                          Card Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          placeholder="4123 4567 8901 2345"
                          className="w-full text-xs px-3.5 py-2.5 bg-white border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 font-mono text-forest-900"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-forest-800 block mb-1">
                          Cardholder Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          placeholder="AS APPEARS ON CARD"
                          className="w-full text-xs px-3.5 py-2.5 bg-white border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 uppercase text-forest-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-forest-800 block mb-1">
                            Expiry (MM/YY) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full text-xs px-3.5 py-2.5 bg-white border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 font-mono text-forest-900"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-forest-800 flex items-center justify-between mb-1">
                            <span>CVV / CVC</span>
                            <span className="text-[10px] text-forest-500 font-normal">3-4 digits</span>
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="•••"
                            className="w-full text-xs px-3.5 py-2.5 bg-white border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 font-mono text-forest-900"
                          />
                        </div>
                      </div>

                      {/* PCI-DSS Security Compliance Notice */}
                      <div className="pt-1 flex items-start gap-2 text-[10px] text-forest-700/80 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-cream-200">
                        <Lock className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                        <span>
                          PCI-DSS Level 1 Encrypted: Aura Luxe never stores full card numbers or CVVs on our servers. Transactions settle in LKR.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Direct Corporate Bank Transfer */}
                <label
                  onClick={() => {
                    if (bankSettings.isVerified) setPaymentMethod('bank_transfer');
                  }}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                    !bankSettings.isVerified
                      ? 'border-cream-200 bg-cream-50/50 opacity-60 cursor-not-allowed'
                      : paymentMethod === 'bank_transfer'
                      ? 'border-forest-700 bg-cream-50 ring-1 ring-forest-700 shadow-sm cursor-pointer'
                      : 'border-cream-300 bg-white hover:border-gold-300 cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    disabled={!bankSettings.isVerified}
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => {
                      if (bankSettings.isVerified) setPaymentMethod('bank_transfer');
                    }}
                    className="mt-1 text-forest-700 focus:ring-forest-600"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-forest-700" />
                      <span className="font-serif font-bold text-xs text-forest-900">
                        Direct Corporate Bank Transfer
                      </span>
                      {!bankSettings.isVerified && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
                          Under Verification
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-forest-600 leading-relaxed">
                      {bankSettings.isVerified
                        ? 'Transfer funds to our verified corporate account and attach your receipt slip.'
                        : 'Bank transfer is temporarily disabled pending scheduled finance verification. Please choose COD or Card.'}
                    </p>
                  </div>
                </label>

                {/* Bank Instructions (If active & verified) */}
                {paymentMethod === 'bank_transfer' && bankSettings.isVerified && (
                  <div className="bg-cream-100/90 p-4 rounded-xl border border-gold-300/60 space-y-3 text-xs">
                    <p className="font-bold text-forest-900">Official Corporate Banking Details:</p>
                    <div className="p-3 bg-white rounded-lg border border-cream-300 space-y-1 text-[11px] text-forest-800 leading-relaxed font-mono">
                      <p><strong>Bank:</strong> {bankSettings.bankName}</p>
                      <p><strong>Account Name:</strong> {bankSettings.accountName}</p>
                      <p><strong>Account Number:</strong> {bankSettings.accountNumber}</p>
                      <p><strong>Branch:</strong> {bankSettings.branch}</p>
                    </div>

                    <div>
                      <label className="font-semibold text-forest-800 block mb-1">
                        Attach Transfer Screenshot or Deposit Slip:
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleSlipChange}
                        className="text-xs text-forest-700 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-forest-700 file:text-cream-50 hover:file:bg-forest-800 cursor-pointer"
                      />
                      {slipPreview && (
                        <div className="mt-2 relative w-20 h-20 rounded-lg border border-cream-300 overflow-hidden shadow-sm">
                          <Image src={slipPreview} alt="Receipt Preview" fill className="object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PROMOTION CODE SECTION */}
            <div className="border-t border-cream-200 pt-4 space-y-2">
              <label className="text-xs font-semibold text-forest-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gold-500" />
                <span>Privilege Promotion Voucher</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="e.g. AURA10"
                  className="flex-1 text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600 uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
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
                      setPromoInput('');
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
            </div>

            {/* ORDER SUMMARY BREAKDOWN */}
            <div className="border-t border-cream-200 pt-4 space-y-2.5 text-xs text-forest-700">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-forest-900">{formatLKR(rawSubtotal)}</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Voucher Discount</span>
                  <span>-{formatLKR(promoDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery to {district}</span>
                {isFree ? (
                  <span className="font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                    FREE White-Glove
                  </span>
                ) : (
                  <span className="font-semibold text-forest-900">{formatLKR(shippingFee)}</span>
                )}
              </div>
            </div>

            {/* FINAL PAYABLE TOTAL */}
            <div className="border-t border-cream-300 pt-4 flex justify-between items-baseline">
              <div>
                <span className="font-serif font-bold text-sm text-forest-900 block">Total Payable</span>
                <span className="text-[10px] text-forest-500">Includes all taxes and courier charges</span>
              </div>
              <span className="font-serif text-2xl font-bold text-forest-900">
                {formatLKR(totalAmount)}
              </span>
            </div>

            {/* PLACE ORDER BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-lg bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-cream-50 font-serif font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-gold-300" />
              <span>
                {loading
                  ? 'Confirming Order...'
                  : paymentMethod === 'card'
                  ? `Pay ${formatLKR(totalAmount)} Now`
                  : 'Confirm & Place Order'}
              </span>
            </button>

            {/* Trust Badges */}
            <div className="flex items-center gap-2 text-[11px] text-forest-600/80 pt-1">
              <ShieldCheck className="w-4 h-4 text-gold-500 shrink-0" />
              <span>Full buyer protection & 7-day home exchange trial guaranteed.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
