'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Package, MapPin, Heart, LogOut, ArrowRight, Truck, CheckCircle2, ShoppingBag, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';
import { formatLKR } from '@/lib/utils';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { SRI_LANKA_DISTRICTS } from '@/lib/constants/districts';

interface OrderItem {
  title: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  customer: string;
  phone: string;
  email: string;
  district: string;
  city: string;
  address: string;
  items: OrderItem[];
  amount: number;
  subtotal: number;
  shippingFee: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  date: string;
  courier?: { name?: string; trackingNumber?: string };
}

interface AddressRecord {
  id: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  isDefaultShipping: boolean;
}

export default function CustomerAccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'profile'>('orders');

  const { items: wishlistItems, removeItem: removeWishlistItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  const [user, setUser] = useState<{ userId: string; email: string; fullName: string; phone?: string } | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // New Address Modal / State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newApt, setNewApt] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newDistrict, setNewDistrict] = useState('Colombo');
  const [newPostal, setNewPostal] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    // 1. Fetch user session
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        if (!data?.user) {
          router.replace('/auth/login?redirect=/account');
          return;
        }
        setUser(data.user);
        if (data.addresses) setAddresses(data.addresses);
      })
      .catch(() => {
        router.replace('/auth/login?redirect=/account');
      });

    // 2. Fetch orders
    fetch('/api/user/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data?.orders) setOrders(data.orders);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Orders fetch error:', err);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressLoading(true);

    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: newRecipient,
          phone: newPhone,
          addressLine1: newStreet,
          addressLine2: newApt,
          city: newCity,
          district: newDistrict,
          postalCode: newPostal,
          isDefaultShipping: isDefault,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save address');

      if (data.address) {
        setAddresses((prev) => [data.address, ...prev]);
      }
      setShowAddAddress(false);
      // Reset form
      setNewRecipient('');
      setNewPhone('');
      setNewStreet('');
      setNewApt('');
      setNewCity('');
      setNewPostal('');
    } catch (err: any) {
      alert(err.message || 'Error saving address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      await fetch(`/api/user/addresses?id=${id}`, { method: 'DELETE' });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.warn('Delete error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-forest-900 text-cream-100 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/15 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-[0.25em] text-[#E9EDE7] font-semibold">
            Client Sanctuary
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream-50">
            Welcome, {user?.fullName || 'Valued Client'}
          </h1>
          <p className="text-xs text-cream-300/80">
            {user?.email} • Member of Aura Luxe Private Home Decor Circle
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-forest-800 hover:bg-forest-700 text-cream-200 hover:text-cream-50 text-xs font-semibold flex items-center gap-2 border border-white/15 transition-colors shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5 text-[#E9EDE7]" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Tabs (Col 1 to 3) */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-xl border border-cream-300 p-3 shadow-sm space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all ${
                activeTab === 'orders'
                  ? 'bg-forest-700 text-cream-50 font-bold'
                  : 'text-forest-800 hover:bg-cream-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Order History ({orders.length})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all ${
                activeTab === 'addresses'
                  ? 'bg-forest-700 text-cream-50 font-bold'
                  : 'text-forest-800 hover:bg-cream-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4" />
                <span>Saved Sri Lanka Addresses ({addresses.length})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all ${
                activeTab === 'wishlist'
                  ? 'bg-forest-700 text-cream-50 font-bold'
                  : 'text-forest-800 hover:bg-cream-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4" />
                <span>Saved Wishlist ({wishlistItems.length})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all ${
                activeTab === 'profile'
                  ? 'bg-forest-700 text-cream-50 font-bold'
                  : 'text-forest-800 hover:bg-cream-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                <span>Profile & Preferences</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        </aside>

        {/* Tab Content Panel (Col 4 to 12) */}
        <div className="lg:col-span-9 space-y-6">
          {/* ============================================================== */}
          {/* 1. ORDERS TAB */}
          {/* ============================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-forest-900">
                  Your Order History
                </h2>
                <span className="text-xs text-forest-500 font-medium">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-cream-300 p-10 text-center space-y-3">
                  <Package className="w-10 h-10 text-forest-400 mx-auto" />
                  <h3 className="font-serif text-base font-bold text-forest-900">No Orders Yet</h3>
                  <p className="text-xs text-forest-600 max-w-sm mx-auto">
                    When you order our handcrafted architectural pieces, tracking and delivery updates will appear here.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block mt-2 px-6 py-2.5 rounded-full bg-forest-700 text-cream-50 text-xs font-semibold"
                  >
                    Explore Shop
                  </Link>
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.orderNumber} className="bg-white rounded-xl border border-cream-300 shadow-sm p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cream-200 pb-3 gap-2">
                      <div>
                        <span className="text-xs text-forest-500 font-medium">{ord.date}</span>
                        <h3 className="font-serif text-lg font-bold text-forest-900">{ord.orderNumber}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                            ord.orderStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-[#E9EDE7] text-[#123C2F] border border-[#D9D9D4]'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                        <span className="bg-cream-100 text-forest-800 border border-cream-300 text-xs font-semibold px-2.5 py-1 rounded-full uppercase">
                          Payment: {ord.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-cream-100">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex gap-4 items-center">
                          <div className="relative w-16 h-16 rounded-lg bg-cream-100 overflow-hidden shrink-0 border border-cream-200">
                            <Image src={item.image || '/assets/logo.png'} alt={item.title} fill className="object-cover" />
                          </div>
                          <div className="flex-1 text-xs">
                            <h4 className="font-serif font-bold text-forest-900 text-sm">{item.title}</h4>
                            <p className="text-forest-500">{item.variant}</p>
                            <p className="font-semibold text-[#123C2F] mt-0.5">
                              {formatLKR(item.price)} (Qty: {item.quantity})
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-cream-50 p-3.5 rounded-lg border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-forest-700 gap-2">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#123C2F] shrink-0" />
                        <span>
                          Courier: <strong>{ord.courier?.name || 'Prompt Xpress'}</strong> ({ord.courier?.trackingNumber || ord.orderNumber})
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-serif font-bold text-sm text-forest-900">
                          Total: {formatLKR(ord.amount)}
                        </span>
                        <Link
                          href={`/track-order?orderNumber=${ord.orderNumber}`}
                          className="font-bold text-[#123C2F] hover:text-[#123C2F] underline"
                        >
                          Live Tracking
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. ADDRESSES TAB */}
          {/* ============================================================== */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-forest-900">
                  Saved Sri Lankan Delivery Addresses
                </h2>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-cream-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-[#E9EDE7]" />
                  {showAddAddress ? 'Close Form' : 'Add New Address'}
                </button>
              </div>

              {/* Add Address Form */}
              {showAddAddress && (
                <form onSubmit={handleCreateAddress} className="bg-white p-6 rounded-xl border border-cream-300 shadow-md space-y-4 text-xs">
                  <h3 className="font-serif text-sm font-bold text-forest-900 border-b border-cream-200 pb-2">
                    Enter New Sri Lankan Delivery Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-forest-800 block mb-1">Recipient Name</label>
                      <input
                        type="text"
                        required
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        placeholder="e.g. Ruwan Jayawardena"
                        className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-forest-800 block mb-1">Mobile Phone</label>
                      <input
                        type="tel"
                        required
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="077 123 4567"
                        className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-forest-800 block mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        placeholder="e.g. No. 14, Ward Place"
                        className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-forest-800 block mb-1">Apartment / Suite</label>
                      <input
                        type="text"
                        value={newApt}
                        onChange={(e) => setNewApt(e.target.value)}
                        placeholder="e.g. Residence Tower, Floor 4"
                        className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-forest-800 block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="e.g. Colombo 07"
                        className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-forest-800 block mb-1">District</label>
                      <select
                        value={newDistrict}
                        onChange={(e) => setNewDistrict(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-white border border-cream-300 rounded-lg font-medium"
                      >
                        {SRI_LANKA_DISTRICTS.map((d) => (
                          <option key={d.name} value={d.name}>{d.name} ({d.province})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-forest-800">
                      <input
                        type="checkbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="rounded text-forest-700"
                      />
                      <span>Set as default shipping address</span>
                    </label>

                    <button
                      type="submit"
                      disabled={addressLoading}
                      className="px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-cream-50 rounded-lg font-semibold shadow-sm"
                    >
                      {addressLoading ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white p-5 rounded-xl border border-cream-300 shadow-sm space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-forest-900 text-sm">{addr.recipientName}</span>
                      <div className="flex items-center gap-2">
                        {addr.isDefaultShipping && (
                          <span className="bg-forest-100 text-forest-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            Default
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-forest-400 hover:text-red-500 transition-colors"
                          title="Remove address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-forest-700 font-medium">Phone: {addr.phone}</p>
                    <p className="text-forest-600">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                    <p className="text-forest-600">{addr.city}, <strong className="text-forest-900">{addr.district} District</strong></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. WISHLIST TAB */}
          {/* ============================================================== */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-forest-900">
                Your Saved Wishlist
              </h2>

              {wishlistItems.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-cream-300 text-center space-y-3">
                  <p className="text-xs text-forest-600">You haven't saved any architectural pieces yet.</p>
                  <Link href="/shop" className="inline-block px-5 py-2 rounded-full bg-forest-700 text-cream-50 text-xs font-semibold">
                    Explore Collections
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {wishlistItems.map((item) => (
                    <div key={item.productId} className="bg-white rounded-lg border border-cream-300 overflow-hidden shadow-sm flex flex-col justify-between p-3 space-y-2">
                      <div className="relative aspect-square w-full rounded overflow-hidden bg-cream-100">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-xs text-forest-900 line-clamp-1">{item.title}</h4>
                        <p className="font-semibold text-[#123C2F] text-xs">{formatLKR(item.price)}</p>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            addToCart({
                              productId: item.productId,
                              title: item.title,
                              price: item.price,
                              image: item.image,
                            });
                          }}
                          className="flex-1 py-1.5 bg-forest-700 hover:bg-forest-800 text-cream-50 text-[11px] font-semibold rounded flex items-center justify-center gap-1"
                        >
                          <ShoppingBag className="w-3 h-3 text-[#E9EDE7]" />
                          Move to Bag
                        </button>
                        <button
                          onClick={() => removeWishlistItem(item.productId)}
                          className="px-2 py-1.5 border border-cream-300 text-forest-600 text-[11px] rounded hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. PROFILE TAB */}
          {/* ============================================================== */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-cream-300 p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-bold text-forest-900">
                Personal Profile & Concierge Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-forest-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.fullName || ''}
                    className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded text-forest-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-forest-700 block mb-1">Registered Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full text-xs px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded text-forest-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="font-semibold text-forest-700 block mb-1">Sri Lanka Mobile Phone</label>
                  <input
                    type="tel"
                    defaultValue={user?.phone || '077 123 4567'}
                    className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded text-forest-900 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert('Profile updates saved.')}
                  className="px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-cream-50 text-xs font-semibold rounded shadow-sm"
                >
                  Save Profile Updates
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
