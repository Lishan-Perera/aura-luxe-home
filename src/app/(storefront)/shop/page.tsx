import { Suspense } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, ArrowUpDown, X, Sparkles, ArrowRight } from 'lucide-react';
import SortDropdown from '@/components/storefront/SortDropdown';
import ProductCard from '@/components/storefront/ProductCard';
import { getProducts } from '@/lib/data/products';
import { getCategories } from '@/lib/data/categories';
import { findSubcategoryBySlug, MAIN_NAV_CATEGORIES } from '@/lib/constants/navigation';

interface ShopPageProps {
  searchParams: {
    room?: string;
    category?: string;
    subcategory?: string;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    filter?: string;
  };
}

const ROOMS = [
  'Living Room',
  'Bedroom',
  'Dining & Kitchen',
  'Luxury Lighting',
  'Artisanal Decor',
  'Rugs & Textiles',
];

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const currentRoom = searchParams.room || '';
  const currentCategory = searchParams.category || '';
  const currentSubcategory = searchParams.subcategory || '';
  const currentSort = searchParams.sort || 'newest';
  const searchQuery = searchParams.search || '';

  const subcategoryInfo = currentSubcategory ? findSubcategoryBySlug(currentSubcategory) : undefined;
  const subcategoryName = subcategoryInfo ? subcategoryInfo.subcategory.name : currentSubcategory.replace(/-/g, ' ');

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

  const activeRoomName = currentRoom || (subcategoryInfo ? subcategoryInfo.category.roomType : '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="border-b border-cream-300 pb-6">
        <nav className="text-xs text-forest-500 mb-2 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-gold-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-gold-600 transition-colors text-forest-800 font-medium">Collections</Link>
          {activeRoomName && (
            <>
              <span>/</span>
              {currentSubcategory ? (
                <Link
                  href={`/shop?room=${encodeURIComponent(activeRoomName)}`}
                  className="hover:text-gold-600 transition-colors text-forest-800"
                >
                  {activeRoomName}
                </Link>
              ) : (
                <span className="text-gold-600 font-semibold">{activeRoomName}</span>
              )}
            </>
          )}
          {currentSubcategory && (
            <>
              <span>/</span>
              <span className="text-gold-600 font-semibold">{subcategoryName}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900">
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : currentSubcategory
                  ? subcategoryName
                  : activeRoomName || 'All Luxury Collections'}
              </h1>
              {subcategoryInfo && (
                <span className="hidden sm:inline-block text-[9.5px] font-bold uppercase tracking-[0.18em] text-forest-900 bg-forest-100 px-2 py-0.5 rounded border border-forest-200/60">
                  {subcategoryInfo.category.featured?.tag || 'AURA LUXE'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-forest-600/80 mt-1">
              {subcategoryInfo?.subcategory.name
                ? `Handcrafted ${subcategoryInfo.subcategory.name} • Showing ${products.length} curated creation${products.length === 1 ? '' : 's'}.`
                : `Showing ${products.length} curated handcrafted creation${products.length === 1 ? '' : 's'}.`}
            </p>
          </div>

          {/* Sort Dropdown */}
          <Suspense fallback={<div className="h-8 w-28 bg-cream-200 rounded animate-pulse" />}>
            <SortDropdown currentSort={currentSort} />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-cream-50 p-5 rounded-lg border border-cream-300 space-y-6">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <span className="font-serif font-bold text-forest-900 text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gold-500" />
                Refine Selection
              </span>
              {(activeRoomName || currentCategory || currentSubcategory || searchQuery) && (
                <Link
                  href="/shop"
                  className="text-[11px] text-gold-600 hover:text-gold-700 font-medium underline"
                >
                  Clear All
                </Link>
              )}
            </div>

            {/* Active Subcategory Pill if selected */}
            {currentSubcategory && (
              <div className="p-2.5 rounded bg-forest-900 text-cream-50 border border-gold-400/40 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gold-400 block font-bold">
                    Active Subcategory
                  </span>
                  <span className="font-semibold">{subcategoryName}</span>
                </div>
                <Link
                  href={activeRoomName ? `/shop?room=${encodeURIComponent(activeRoomName)}` : '/shop'}
                  className="p-1 hover:bg-forest-800 rounded transition-colors text-cream-200 hover:text-cream-50"
                  title="Remove subcategory filter"
                >
                  <X className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Room Filters */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-serif font-semibold text-forest-800 uppercase tracking-wider">
                Sanctuary / Room
              </h4>
              <div className="space-y-1.5 text-xs">
                <Link
                  href="/shop"
                  className={`block py-1 px-2 rounded transition-colors ${
                    !currentRoom ? 'bg-forest-700 text-cream-50 font-medium' : 'text-forest-700 hover:bg-cream-200'
                  }`}
                >
                  All Rooms
                </Link>
                {ROOMS.map((room) => {
                  const active = currentRoom.toLowerCase() === room.toLowerCase();
                  return (
                    <Link
                      key={room}
                      href={`/shop?room=${encodeURIComponent(room)}`}
                      className={`block py-1 px-2 rounded transition-colors ${
                        active ? 'bg-forest-700 text-cream-50 font-medium' : 'text-forest-700 hover:bg-cream-200'
                      }`}
                    >
                      {room}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-2.5 border-t border-cream-200 pt-4">
              <h4 className="text-xs font-serif font-semibold text-forest-800 uppercase tracking-wider">
                Craft Category
              </h4>
              <div className="space-y-1.5 text-xs">
                {categories.map((c: any) => {
                  const active = currentCategory === (c.id || c._id);
                  return (
                    <Link
                      key={c.id || c._id}
                      href={`/shop?category=${c.id || c._id}`}
                      className={`block py-1 px-2 rounded transition-colors ${
                        active ? 'bg-forest-700 text-cream-50 font-medium' : 'text-forest-700 hover:bg-cream-200'
                      }`}
                    >
                      {c.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Price Ranges */}
            <div className="space-y-2.5 border-t border-cream-200 pt-4">
              <h4 className="text-xs font-serif font-semibold text-forest-800 uppercase tracking-wider">
                Price (LKR)
              </h4>
              <div className="space-y-1.5 text-xs">
                <Link
                  href="/shop?maxPrice=25000"
                  className="block py-1 px-2 rounded text-forest-700 hover:bg-cream-200 transition-colors"
                >
                  Under LKR 25,000
                </Link>
                <Link
                  href="/shop?minPrice=25000&maxPrice=50000"
                  className="block py-1 px-2 rounded text-forest-700 hover:bg-cream-200 transition-colors"
                >
                  LKR 25,000 – LKR 50,000
                </Link>
                <Link
                  href="/shop?minPrice=50000&maxPrice=100000"
                  className="block py-1 px-2 rounded text-forest-700 hover:bg-cream-200 transition-colors"
                >
                  LKR 50,000 – LKR 100,000
                </Link>
                <Link
                  href="/shop?minPrice=100000"
                  className="block py-1 px-2 rounded text-forest-700 hover:bg-cream-200 transition-colors"
                >
                  Above LKR 100,000
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          {products.length === 0 ? (
            currentSubcategory ? (
              <div className="bg-[#FAF7F2] rounded-xl border border-gold-400/40 p-10 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-forest-900 text-gold-300 flex items-center justify-center mx-auto border border-gold-400/30">
                  <Sparkles className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-700 bg-gold-400/15 px-3 py-1 rounded-full border border-gold-400/30 inline-block">
                    Atelier Handcrafting In Progress
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-forest-900 mt-2">
                    Curated {subcategoryName} Pieces Incoming
                  </h3>
                  <p className="text-xs text-forest-700/80 max-w-lg mx-auto leading-relaxed font-sans mt-2">
                    Our master craftsmen in Ceylon are currently finishing bespoke pieces for the {subcategoryName} atelier. Each creation is sculpted from seasoned plantation teak, solid brass, or hand-loomed fibers. Contact our concierge for custom commissions, or explore active {activeRoomName || 'sanctuary'} pieces.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  {activeRoomName && (
                    <Link
                      href={`/shop?room=${encodeURIComponent(activeRoomName)}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-forest-900 text-cream-50 text-xs font-semibold uppercase tracking-wider hover:bg-forest-950 transition-colors border border-gold-400/40 shadow-xs"
                    >
                      <span>Explore All {activeRoomName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
                    </Link>
                  )}
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-cream-100 text-forest-900 text-xs font-semibold uppercase tracking-wider hover:bg-cream-200 transition-colors border border-cream-300"
                  >
                    Browse All Collections
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-cream-300 p-12 text-center space-y-4">
                <h3 className="font-serif text-xl font-bold text-forest-800">No pieces found matching this filter</h3>
                <p className="text-xs text-forest-600 max-w-md mx-auto">
                  Try selecting a different room, clearing your price criteria, or browse all handcrafted collections.
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-6 py-2.5 rounded-full bg-forest-700 text-cream-50 text-xs font-medium uppercase tracking-wider hover:bg-forest-800 transition-colors"
                >
                  Reset Catalog Filters
                </Link>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id || prod._id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
