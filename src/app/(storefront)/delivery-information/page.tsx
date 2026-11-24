import Link from 'next/link';
import { FREE_SHIPPING_THRESHOLD_LKR } from '@/lib/constants/districts';
import { formatLKR } from '@/lib/utils';

export const metadata = {
  title: 'Delivery Information | Aura Luxe Home',
  description: 'Islandwide delivery coverage, shipping fees, and delivery times across all 25 districts of Sri Lanka.',
};

export default function DeliveryInformationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2 border-b border-[#D9D9D4] pb-6">
        <nav className="text-xs text-[#666666] flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#123C2F]">Home</Link>
          <span>/</span>
          <span className="text-[#123C2F] font-medium">Delivery Information</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#123C2F]">Delivery Information</h1>
        <p className="text-sm text-[#666666]">
          Careful islandwide delivery across all 25 districts of Sri Lanka.
        </p>
      </div>

      <div className="bg-white border border-[#D9D9D4] rounded-lg p-6 sm:p-8 space-y-6 text-sm text-[#333333] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#123C2F]">Delivery Zones &amp; Timelines</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Colombo City Zone:</strong> 1–2 business days (LKR 450 standard fee).</li>
            <li><strong>Greater Colombo (Gampaha &amp; Kalutara):</strong> 1–2 business days (LKR 600 standard fee).</li>
            <li><strong>Outstation Districts (Islandwide):</strong> 2–4 business days (LKR 850 standard fee).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#123C2F]">Complimentary Delivery</h2>
          <p>
            Orders exceeding <strong>{formatLKR(FREE_SHIPPING_THRESHOLD_LKR)}</strong> qualify automatically for complimentary islandwide delivery across Sri Lanka.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#123C2F]">Cash on Delivery &amp; Order Tracking</h2>
          <p>
            Cash on Delivery is available islandwide so you can inspect your pieces upon arrival. You can check delivery progress anytime on our{' '}
            <Link href="/track-order" className="text-[#123C2F] font-medium underline">Track Order</Link> page or{' '}
            <Link href="/contact" className="text-[#123C2F] font-medium underline">Contact Us</Link> for delivery inquiries.
          </p>
        </section>
      </div>
    </div>
  );
}

