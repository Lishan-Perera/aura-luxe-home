import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions | Aura Luxe Home',
  description: 'Terms governing purchases, pricing, and delivery at Aura Luxe Home.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2 border-b border-[#D9D9D4] pb-6">
        <nav className="text-xs text-[#666666] flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#123C2F]">Home</Link>
          <span>/</span>
          <span className="text-[#123C2F] font-medium">Terms &amp; Conditions</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#123C2F]">Terms &amp; Conditions</h1>
        <p className="text-sm text-[#666666]">
          Guidelines for using the Aura Luxe Home website and placing orders.
        </p>
      </div>

      <div className="bg-white border border-[#D9D9D4] rounded-lg p-6 sm:p-8 space-y-6 text-sm text-[#333333] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#123C2F]">Pricing &amp; Availability</h2>
          <p>
            All product prices are displayed in Sri Lankan Rupees (LKR). Because many pieces are handcrafted in small batches using natural Ceylon teak and stoneware, subtle natural variations in grain and finish may occur.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#123C2F]">Orders &amp; Delivery</h2>
          <p>
            Orders placed through the storefront are subject to stock availability and confirmation. Delivery fees and estimated timelines vary by district and are displayed clearly prior to order confirmation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#123C2F]">Questions</h2>
          <p>
            If you have any questions regarding these terms, please contact Aura Luxe Home (Pvt) Ltd through our{' '}
            <Link href="/contact" className="text-[#123C2F] font-medium underline">Contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}

