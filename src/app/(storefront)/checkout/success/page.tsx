import Link from 'next/link';
import { CheckCircle2, Truck, ShieldCheck, ArrowRight, FileText, Clock, User } from 'lucide-react';
import { formatLKR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface SuccessPageProps {
  searchParams: {
    orderNumber?: string;
    district?: string;
    total?: string;
    method?: string;
    status?: string;
  };
}

export default function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const orderNumber = searchParams.orderNumber || 'ALH-2026-1001';
  const district = searchParams.district || 'Colombo';
  const total = searchParams.total ? Number(searchParams.total) : 84500;
  const method = searchParams.method || 'cod';
  const status = searchParams.status || 'pending';

  const methodText =
    method === 'cod'
      ? 'Cash on Delivery (Pay at Doorstep)'
      : method === 'bank_transfer'
      ? 'Direct Bank Transfer (Under Finance Verification)'
      : 'Credit / Debit Card (Pending Gateway Settlement)';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8">
      {/* Icon Badge */}
      <div className="w-20 h-20 rounded-full bg-forest-100 text-forest-700 mx-auto flex items-center justify-center shadow-lg border border-gold-300/40">
        <CheckCircle2 className="w-12 h-12 text-forest-700" />
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-bold">
          Order Successfully Placed
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900">
          Thank You for Welcoming Aura Luxe Home
        </h1>
        <p className="text-xs sm:text-sm text-forest-600 max-w-lg mx-auto leading-relaxed">
          Your order has been recorded in our secure system. Our Colombo concierge team will coordinate white-glove packaging and islandwide dispatch.
        </p>
      </div>

      {/* Order Reference Card */}
      <div className="bg-white rounded-2xl border border-cream-300 p-6 sm:p-8 shadow-sm space-y-5 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cream-200 pb-4 gap-2">
          <div>
            <span className="text-xs text-forest-500 font-medium">Order Reference Number:</span>
            <p className="font-serif text-xl sm:text-2xl font-bold text-forest-900 tracking-wider">
              {orderNumber}
            </p>
          </div>
          <span className="self-start sm:self-auto bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Payment Status: {status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-forest-700">
          <div>
            <span className="text-forest-400 font-medium block">Destination District:</span>
            <strong className="text-forest-900 text-sm">{district} District</strong>
          </div>
          <div>
            <span className="text-forest-400 font-medium block">Payment Method:</span>
            <strong className="text-forest-900 text-sm">{methodText}</strong>
          </div>
          <div>
            <span className="text-forest-400 font-medium block">Total Order Value:</span>
            <strong className="text-gold-600 text-sm font-serif font-bold">{formatLKR(total)}</strong>
          </div>
        </div>

        {/* Timeline Next Steps */}
        <div className="bg-cream-100 p-4 rounded-xl border border-gold-300/60 text-xs text-forest-800 space-y-2">
          <p className="font-semibold text-forest-900 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-gold-500" />
            What happens next?
          </p>
          <ul className="space-y-1.5 text-forest-700 list-disc pl-5">
            <li>Our dispatch team will phone you to confirm delivery timing and white-glove setup.</li>
            <li>For Bank Transfer orders, our finance team verifies the deposit slip before release.</li>
            <li>For Cash on Delivery orders, pay cash or card upon receiving your pieces at your doorstep.</li>
            <li>You can track courier movement anytime under Order Tracking or in your Client Sanctuary.</li>
          </ul>
        </div>
      </div>

      {/* Action Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href={`/track-order?orderNumber=${orderNumber}`}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-forest-700 hover:bg-forest-800 text-cream-50 font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4 text-gold-300" />
          Track Order Status
        </Link>
        <Link
          href="/account"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-forest-700 text-forest-800 hover:bg-cream-200 font-serif font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
        >
          <User className="w-4 h-4 text-gold-600" />
          View In Client Account
        </Link>
        <Link
          href="/shop"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-cream-200 text-forest-800 hover:bg-cream-300 font-serif font-bold text-xs uppercase tracking-wider transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
