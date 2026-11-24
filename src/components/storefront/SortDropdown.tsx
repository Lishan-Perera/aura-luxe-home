'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SortDropdown({ currentSort = 'newest' }: { currentSort?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      <label htmlFor="shop-sort" className="text-xs text-[#666666] font-medium whitespace-nowrap">
        Sort by:
      </label>
      <select
        id="shop-sort"
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="text-xs sm:text-sm bg-white border border-[#D9D9D4] rounded-md py-2 px-3 text-[#333333] font-medium focus:outline-none focus:border-[#123C2F] cursor-pointer"
      >
        <option value="newest">Newest</option>
        <option value="popular">Popular</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  );
}
