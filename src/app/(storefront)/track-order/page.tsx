'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, CheckCircle2, Clock, Truck, Package, ShieldCheck, MapPin } from 'lucide-react';
import { formatLKR } from '@/lib/utils';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('orderNumber') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [phone, setPhone] = useState('');
  const [searched, setSearched] = useState(Boolean(initialOrder));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearched(true);
    }
  };

  const steps = [
    { label: 'Order Placed', status: 'completed', desc: 'Order received into concierge queue' },
    { label: 'Confirmed', status: 'completed', desc: 'Verified by dispatch concierge' },
    { label: 'Processing & Inspection', status: 'current', desc: 'Crated & inspected in Colombo facility' },
    { label: 'Handed to Courier', status: 'upcoming', desc: 'Dispatched via Prompt Xpress / Domex' },
    { label: 'Delivered', status: 'upcoming', desc: 'Delivered to your doorstep' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-bold">
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
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm max-w-xl mx-auto space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-forest-700">Order Reference Number</label>
          <input
            type="text"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. ALH-2026-1001"
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
          className="w-full py-3 px-6 rounded-md bg-forest-700 hover:bg-forest-800 text-cream-50 font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4 text-gold-300" />
          Track Order
        </button>
      </form>

      {/* Results View */}
      {searched && (
        <div className="bg-white rounded-2xl border border-cream-300 p-6 sm:p-8 shadow-sm space-y-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cream-200 pb-4 gap-2">
            <div>
              <span className="text-xs text-forest-500 font-medium">Order Status:</span>
              <h2 className="font-serif text-2xl font-bold text-forest-900">
                {orderNumber || 'ALH-2026-1001'}
              </h2>
            </div>
            <span className="self-start sm:self-auto bg-gold-100 text-gold-800 text-xs font-bold px-3 py-1 rounded-full border border-gold-300">
              Processing in Colombo Facility
            </span>
          </div>

          {/* Timeline visualization */}
          <div className="space-y-6">
            <h3 className="font-serif text-sm font-bold text-forest-900 uppercase tracking-wider">
              Delivery Progress
            </h3>

            <div className="relative border-l-2 border-forest-200 ml-4 sm:ml-6 space-y-8 pl-6">
              {steps.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white ${
                      step.status === 'completed'
                        ? 'bg-forest-700'
                        : step.status === 'current'
                        ? 'bg-gold-500 ring-4 ring-gold-200 animate-pulse'
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
              <span className="text-forest-400 block font-medium">Assigned Courier:</span>
              <strong className="text-forest-900 text-sm">Prompt Xpress (White-Glove)</strong>
            </div>
            <div>
              <span className="text-forest-400 block font-medium">Courier Tracking Code:</span>
              <strong className="text-forest-900 text-sm">PX-LK-8492019</strong>
            </div>
            <div>
              <span className="text-forest-400 block font-medium">Estimated Arrival:</span>
              <strong className="text-gold-600 text-sm font-serif font-bold">Within 24–48 Hours</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-forest-600 border-t border-cream-200 pt-4">
            <ShieldCheck className="w-4 h-4 text-gold-500 shrink-0" />
            <span>Need assistance with this delivery? Contact our concierge team at concierge@auraluxe.lk.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto py-20 text-center text-xs text-forest-600">Loading tracking portal...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
