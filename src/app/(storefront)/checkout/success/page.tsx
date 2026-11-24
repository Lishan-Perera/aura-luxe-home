import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { formatLKR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface SuccessPageProps {
  searchParams: {
    orderNumber?: string;
    district?: string;
    total?: string;
    method?: string;
  };
}

export default function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const orderNumber = searchParams.orderNumber || 'ALH-2026-1001';
  const district = searchParams.district || 'Colombo';
  const total = searchParams.total ? Number(searchParams.total) : 0;
  const method = searchParams.method === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
      <div className="bg-white border border-[#D9D9D4] rounded-lg p-8 sm:p-10 space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#E9EDE7] text-[#123C2F] mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#123C2F]">
            Order Confirmed
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#123C2F]">
            Thank You for Your Order
          </h1>
          <p className="text-sm text-[#666666]">
            Your order has been successfully recorded and is being prepared for delivery.
          </p>
        </div>

        <div className="bg-[#FBF8F3] border border-[#D9D9D4] rounded-md p-5 text-left text-sm space-y-2.5">
          <div className="flex justify-between">
            <span className="text-[#666666]">Order Reference</span>
            <span className="font-semibold text-[#123C2F]">{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Destination</span>
            <span className="font-medium text-[#333333]">{district} District</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Payment Method</span>
            <span className="font-medium text-[#333333]">{method}</span>
          </div>
          {total > 0 && (
            <div className="flex justify-between pt-2 border-t border-[#D9D9D4] font-semibold text-[#123C2F]">
              <span>Total Amount</span>
              <span>{formatLKR(total)}</span>
            </div>
          )}
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#D9D9D4] hover:bg-[#E9EDE7] text-[#123C2F] text-sm font-medium rounded-md transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
