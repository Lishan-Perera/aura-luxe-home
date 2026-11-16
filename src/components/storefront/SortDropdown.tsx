'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

export default function SortDropdown({ currentSort = 'newest' }: { currentSort?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-forest-600 font-medium flex items-center gap-1.5">
        <ArrowUpDown className="w-3.5 h-3.5 text-gold-500" />
        Sort By:
      </span>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="text-xs bg-white border border-cream-300 rounded-md py-2 px-3 text-forest-900 font-medium focus:outline-none focus:ring-1 focus:ring-forest-600 shadow-sm cursor-pointer"
      >
        <option value="newest">Newest Arrivals</option>
        <option value="popular">Most Popular</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  );
}

