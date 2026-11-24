import Link from 'next/link';
import { Truck, Tag, Sparkles, ArrowRight } from 'lucide-react';

export default function PromotionalDealsBanner() {
  const deals = [
    {
      icon: Truck,
      title: 'Islandwide Delivery',
      desc: 'Complimentary shipping on orders over LKR 25,000',
      link: '/delivery-information',
      linkLabel: 'View terms',
    },
    {
      icon: Tag,
      title: 'Special Furniture Offers',
      desc: 'Save up to 25% on selected artisanal pieces',
      link: '#flash-sale',
      linkLabel: 'Shop deals',
    },
    {
      icon: Sparkles,
      title: 'Ceylon Teak Heritage',
      desc: 'Sustainable solid wood & handcrafted stoneware',
      link: '/shop',
      linkLabel: 'Explore',
    },
  ];

  return (
    <section aria-label="Special Deals Highlights" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="max-w-[1000px] mx-auto bg-[#E9EDE7]/70 border border-[#D9D9D4] rounded-lg p-3 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 md:divide-x md:divide-[#D9D9D4]">
          {deals.map((deal, idx) => {
            const Icon = deal.icon;
            return (
              <div
                key={deal.title}
                className={`flex items-center justify-between sm:justify-start gap-3 ${
                  idx > 0 ? 'md:pl-5' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-white text-[#123C2F] flex items-center justify-center shrink-0 border border-[#D9D9D4]/60">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-[#123C2F] truncate">
                      {deal.title}
                    </p>
                    <p className="text-[11px] text-[#333333]/80 truncate">
                      {deal.desc}
                    </p>
                  </div>
                </div>

                <Link
                  href={deal.link}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#123C2F] hover:underline shrink-0 ml-auto"
                >
                  <span>{deal.linkLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

