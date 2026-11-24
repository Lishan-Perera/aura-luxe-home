import { Suspense } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import SortDropdown from '@/components/storefront/SortDropdown';
import ProductCard from '@/components/storefront/ProductCard';
import { getProducts } from '@/lib/data/products';
import { getCategories } from '@/lib/data/categories';
import { findSubcategoryBySlug } from '@/lib/constants/navigation';

interface ShopPageProps {
  searchParams: {
    room?: string;
    category?: string;
    subcategory?: string;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
    search?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const currentRoom = searchParams.room || '';
  const currentCategory = searchParams.category || '';
  const currentSubcategory = searchParams.subcategory || '';
  const currentSort = searchParams.sort || 'newest';
  const searchQuery = searchParams.search || '';

  const subcategoryInfo = currentSubcategory ? findSubcategoryBySlug(currentSubcategory) : undefined;
  const subcategoryName = subcategoryInfo
    ? subcategoryInfo.subcategory.name
    : currentSubcategory.replace(/-/g, ' ');

  const [products, categories] = await Promise.all([
    getProducts({
      roomType: currentRoom || subcategoryInfo?.category.roomType,
      category: currentCategory,
      subcategory: currentSubcategory,
      sort: currentSort,
      search: searchQuery,
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    }),
    getCategories(),
  ]);

  const activeCategoryObj = categories.find(
    (c: any) => (c.id || c._id) === currentCategory || c.slug === currentCategory
  );
  const pageTitle = searchQuery
    ? `Search: "${searchQuery}"`
    : currentSubcategory
    ? subcategoryName
    : activeCategoryObj?.name || currentRoom || 'Shop All';

  const hasActiveFilter = Boolean(currentRoom || currentCategory || currentSubcategory || searchQuery);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      {/* Page Title & Controls */}
      <div className="space-y-5 border-b border-[#D9D9D4] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <nav className="text-xs text-[#666666] mb-2 flex items-center gap-1.5">
              <Link href="/" className="hover:text-[#123C2F]">Home</Link>
              <span>/</span>
              <span className="text-[#123C2F] font-medium">Shop</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#123C2F]">
              {pageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-1">
              Showing {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Simple Search Box */}
            <form action="/shop" method="GET" className="relative">
              {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
              {currentRoom && <input type="hidden" name="room" value={currentRoom} />}
              <Search className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search products..."
                className="w-full sm:w-56 pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#D9D9D4] rounded-md text-[#333333] placeholder:text-[#666666] focus:outline-none focus:border-[#123C2F]"
              />
            </form>

            {/* Sort Dropdown */}
            <Suspense fallback={<div className="h-9 w-36 bg-[#E9EDE7] rounded-md" />}>
              <SortDropdown currentSort={currentSort} />
            </Suspense>
          </div>
        </div>

        {/* Simple Horizontal Category Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/shop"
            className={`px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors border ${
              !currentCategory && !currentRoom && !currentSubcategory
                ? 'bg-[#123C2F] text-white border-[#123C2F]'
                : 'bg-white text-[#333333] border-[#D9D9D4] hover:bg-[#E9EDE7] hover:text-[#123C2F]'
            }`}
          >
            All Products
          </Link>

          {categories.map((cat: any) => {
            const catId = cat.id || cat._id;
            const isActive =
              currentCategory === catId ||
              currentCategory === cat.slug ||
              currentRoom.toLowerCase() === (cat.name || '').toLowerCase();
            return (
              <Link
                key={catId}
                href={`/shop?category=${catId}`}
                className={`px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors border ${
                  isActive
                    ? 'bg-[#123C2F] text-white border-[#123C2F]'
                    : 'bg-white text-[#333333] border-[#D9D9D4] hover:bg-[#E9EDE7] hover:text-[#123C2F]'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}

          {hasActiveFilter && (
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#666666] hover:text-[#123C2F]"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Link>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="bg-white border border-[#D9D9D4] rounded-lg p-12 text-center space-y-4">
          <h3 className="text-lg font-semibold text-[#123C2F]">No products found</h3>
          <p className="text-sm text-[#666666] max-w-md mx-auto">
            Try choosing another category or clearing your search to view our full collection.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 bg-[#123C2F] hover:bg-[#0D2E24] text-white text-sm font-medium rounded-md transition-colors"
          >
            View All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <ProductCard key={prod.id || prod._id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
