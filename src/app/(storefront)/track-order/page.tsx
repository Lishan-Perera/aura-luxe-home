'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  ShieldCheck,
  MapPin,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { formatLKR } from '@/lib/utils';

interface TrackedOrderItem {
  title: string;
  quantity: number;
  unitPrice: number;
  variantSku?: string;
  image?: string;
}

interface TrackedOrder {
  orderNumber: string;
  customer: string;
  district: string;
  city: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  items: TrackedOrderItem[];
  courier?: {
    name?: string;
    trackingNumber?: string;
  };
  createdAt?: string;
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('orderNumber') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<TrackedOrder | null>(null);

  const fetchTracking = async (ref: string, ph: string) => {
    if (!ref.trim()) return;
    setError('');
    setLoading(true);

    try {
      const url = `/api/orders/track?orderNumber=${encodeURIComponent(ref.trim())}${
        ph ? `&phone=${encodeURIComponent(ph.trim())}` : ''
      }`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Order not found');
      }

      setOrderData(data.order);
    } catch (err: any) {
      setOrderData(null);
      setError(err.message || 'Unable to find tracking details for this order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder) {
      fetchTracking(initialOrder, '');
    }
  }, [initialOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderNumber, phone);
  };

  // Determine stage progress based on real orderStatus
  const st = (orderData?.orderStatus || 'processing').toLowerCase();
  const steps = [
    {
      label: 'Order Placed',
      status: 'completed',
      desc: 'Order received into concierge queue',
    },
    {
      label: 'Confirmed',
      status: ['confirmed', 'processing', 'shipped', 'delivered'].includes(st)
        ? 'completed'
        : st === 'pending'
        ? 'current'
        : 'upcoming',
      desc: 'Verified by dispatch concierge',
    },
    {
      label: 'Processing & Inspection',
      status: ['processing', 'shipped', 'delivered'].includes(st)
        ? 'completed'
        : st === 'confirmed'
        ? 'current'
        : 'upcoming',
      desc: 'Crated & inspected in Colombo facility',
    },
    {
      label: 'Handed to Courier',
      status: ['shipped', 'delivered'].includes(st)
        ? 'completed'
        : st === 'processing'
        ? 'current'
        : 'upcoming',
      desc: `Dispatched via ${orderData?.courier?.name || 'Prompt Xpress'}`,
    },
    {
      label: 'Delivered',
      status: st === 'delivered' ? 'completed' : st === 'shipped' ? 'current' : 'upcoming',
      desc: `Delivered to your doorstep in ${orderData?.district || 'Sri Lanka'}`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-[0.25em] text-[#123C2F] font-bold">
          Sri Lanka Logistics Portal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900">
          Track Your Delivery
        </h1>
        <p className="text-xs sm:text-sm text-forest-600">
          Enter your order reference number and mobile phone to view real-time courier status across all 25 districts.
        </p>
      </div>

      {/* Search Box */}
      <form
        onSubmit={handleSearch}
        className="bg-white p-6 rounded-2xl border border-cream-300 shadow-xs max-w-xl mx-auto space-y-4"
      >
        <div className="space-y-1">
          <label className="text-xs font-semibold text-forest-700">Order Reference Number</label>
          <input
            type="text"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. ALH-2026-8492"
            className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-medium uppercase"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-forest-700">Mobile Phone Number (Optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="077 123 4567"
            className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 rounded-md bg-[#123C2F] hover:bg-[#0D2E24] disabled:opacity-50 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4 text-[#E9EDE7]" />
          {loading ? 'Locating Order in Logistics Queue...' : 'Track Delivery Status'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs flex items-center gap-2 max-w-xl mx-auto">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {orderData && (
        <div className="bg-white rounded-2xl border border-cream-300 p-6 sm:p-8 shadow-xs space-y-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cream-200 pb-4 gap-2">
            <div>
              <span className="text-xs text-forest-500 font-medium">Order Reference:</span>
              <h2 className="font-serif text-2xl font-bold text-forest-900">
                {orderData.orderNumber}
              </h2>
              <p className="text-xs text-forest-600 mt-0.5">
                Recipient: <strong>{orderData.customer}</strong> • District: <strong>{orderData.district}</strong>
              </p>
            </div>
            <span
              className={`self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                orderData.orderStatus === 'delivered'
                  ? 'bg-emerald-100 text-emerald-900'
                  : orderData.orderStatus === 'shipped'
                  ? 'bg-blue-100 text-blue-900'
                  : orderData.orderStatus === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-[#E9EDE7] text-[#123C2F]'
              }`}
            >
              Status: {orderData.orderStatus}
            </span>
          </div>

          {/* Timeline visualization */}
          <div className="space-y-6">
            <h3 className="font-serif text-sm font-bold text-forest-900 uppercase tracking-wider">
              Fulfillment &amp; Courier Pipeline
            </h3>

            <div className="relative border-l-2 border-forest-200 ml-4 sm:ml-6 space-y-8 pl-6">
              {steps.map((step, idx) => (
                <div key={idx} className="relative group">
                  <div
                    className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white ${
                      step.status === 'completed'
                        ? 'bg-[#123C2F]'
                        : step.status === 'current'
                        ? 'bg-[#123C2F] ring-4 ring-[#E9EDE7] animate-pulse'
                        : 'bg-cream-300'
                    }`}
                  >
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : step.status === 'current' ? (
                      <Clock className="w-3.5 h-3.5" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-forest-400" />
                    )}
                  </div>

                  <div>
                    <h4
                      className={`text-sm font-serif font-bold ${
                        step.status === 'upcoming' ? 'text-forest-400' : 'text-forest-900'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-xs text-forest-600 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courier Details */}
          <div className="bg-cream-50 p-4 rounded-xl border border-cream-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-forest-700">
            <div>
              <span className="text-forest-400 block font-medium">Assigned Courier Fleet:</span>
              <strong className="text-forest-900 text-sm">
                {orderData.courier?.name || 'Prompt Xpress (White-Glove)'}
              </strong>
            </div>
            <div>
              <span className="text-forest-400 block font-medium">Courier Waybill / Tracking Code:</span>
              <strong className="text-forest-900 text-sm font-mono">
                {orderData.courier?.trackingNumber || 'Pending Assignment'}
              </strong>
            </div>
            <div>
              <span className="text-forest-400 block font-medium">Estimated Arrival:</span>
              <strong className="text-[#123C2F] text-sm font-serif font-bold">
                {orderData.orderStatus === 'delivered' ? 'Delivered' : 'Within 24–48 Hours'}
              </strong>
            </div>
          </div>

          {/* Items Summary */}
          {orderData.items && orderData.items.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900">
                Shipment Items ({orderData.items.length})
              </h4>
              <div className="divide-y divide-cream-200 border border-cream-200 rounded-lg overflow-hidden">
                {orderData.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded bg-cream-100 relative shrink-0 overflow-hidden">
                        <img
                          src={item.image || '/assets/logo.png'}
                          alt=""
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-forest-900 truncate">{item.title}</p>
                        <p className="text-[11px] text-forest-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-forest-900 whitespace-nowrap">
                      {formatLKR(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-forest-600 border-t border-cream-200 pt-4">
            <ShieldCheck className="w-4 h-4 text-[#123C2F] shrink-0" />
            <span>Need concierge assistance with this order? Email us at concierge@auraluxe.lk.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto py-20 text-center text-xs text-forest-600">
          Loading tracking portal...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
