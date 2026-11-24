import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Aura Luxe Home',
  description: 'How Aura Luxe Home collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2 border-b border-[#D9D9D4] pb-6">
        <nav className="text-xs text-[#666666] flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#123C2F]">Home</Link>
          <span>/</span>
          <span className="text-[#123C2F] font-medium">Privacy Policy</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#123C2F]">Privacy Policy</h1>
        <p className="text-sm text-[#666666]">
          How Aura Luxe Home (Pvt) Ltd respects and safeguards customer information.
        </p>
      </div>

      <div className="bg-white border border-[#D9D9D4] rounded-lg p-6 sm:p-8 space-y-6 text-sm text-[#333333] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#123C2F]">Information We Collect</h2>
          <p>
            We collect only the details necessary to process your orders and respond to your inquiries, including your name, email address, phone number, and Sri Lankan delivery address.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#123C2F]">How We Use Your Information</h2>
          <p>
            Your information is used strictly to fulfill orders, coordinate courier delivery, manage your account, and reply to messages submitted through our Contact page. We never sell or rent customer data to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#123C2F]">Data Security &amp; Contact</h2>
          <p>
            Account credentials are encrypted using industry-standard hashing and secure HTTP-only session cookies. For privacy inquiries, please reach us at{' '}
            <a href="mailto:concierge@auraluxe.lk" className="text-[#123C2F] font-medium underline">concierge@auraluxe.lk</a> or via our{' '}
            <Link href="/contact" className="text-[#123C2F] font-medium underline">Contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}

