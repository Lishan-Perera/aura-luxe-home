import Link from 'next/link';

export const metadata = {
  title: 'Returns & Refunds | Aura Luxe Home',
  description: 'Return eligibility, 7-day exchange policy, and refund guidelines for Aura Luxe Home orders.',
};

export default function ReturnsRefundsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2 border-b border-[#D9D9D4] pb-6">
        <nav className="text-xs text-[#666666] flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#123C2F]">Home</Link>
          <span>/</span>
          <span className="text-[#123C2F] font-medium">Returns &amp; Refunds</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#123C2F]">Returns &amp; Refunds</h1>
        <p className="text-sm text-[#666666]">
          Clear and fair exchange and return guidelines for your peace of mind.
        </p>
      </div>

      <div className="bg-white border border-[#D9D9D4] rounded-lg p-6 sm:p-8 space-y-6 text-sm text-[#333333] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#123C2F]">7-Day Home Exchange Policy</h2>
          <p>
            If a piece is not the right fit for your space, you may request an exchange or return within 7 days of delivery. Items must be unused, in original condition, and accompanied by original packaging.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#123C2F]">Damaged or Incorrect Items</h2>
          <p>
            Please inspect your items upon delivery. If an item arrives damaged or does not match your order, notify us within 48 hours so our team can arrange a prompt replacement or refund at no additional delivery cost.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#123C2F]">How to Request a Return</h2>
          <p>
            Submit your order reference number via our{' '}
            <Link href="/contact" className="text-[#123C2F] font-medium underline">Contact page</Link> or email{' '}
            <a href="mailto:concierge@auraluxe.lk" className="text-[#123C2F] font-medium underline">concierge@auraluxe.lk</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

