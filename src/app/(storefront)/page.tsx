import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import CompactPromoSlider from '@/components/storefront/CompactPromoSlider';
import PromotionalDealsBanner from '@/components/storefront/PromotionalDealsBanner';
import FlashSaleSection from '@/components/storefront/FlashSaleSection';
import { getBanners } from '@/lib/data/banners';
import { getCategories } from '@/lib/data/categories';
import {
  getProducts,
  getFlashSaleProducts,
  getFlashSaleCampaign,
} from '@/lib/data/products';

export default async function HomePage() {
  const [banners, categories, flashSaleProducts, flashSaleCampaign, allProducts] =
    await Promise.all([
      getBanners(),
      getCategories(),
      getFlashSaleProducts(),
      getFlashSaleCampaign(),
      getProducts({ limit: 12 }),
    ]);

  const bestSellers = allProducts.slice(0, 4);
  const newArrivals =
    allProducts.filter((p) => p.isNewArrival).length >= 4
      ? allProducts.filter((p) => p.isNewArrival).slice(0, 4)
      : allProducts.slice(2, 6);

  return (
    <div className="bg-[#FBF8F3] text-[#333333]">
      {/* 1. COMPACT PROMOTIONAL CAROUSEL (Top of homepage below navigation) */}
      <CompactPromoSlider slides={banners} />

      {/* 2. SLIM PROMOTIONAL DEALS BANNER */}
      <PromotionalDealsBanner />

      {/* 3. SHOP BY CATEGORY */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#123C2F]">
              Shop by Category
            </h2>
            <p className="text-sm text-[#666666] mt-1">
              Explore pieces curated for every room in your home.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#123C2F] hover:underline"
          >
            <span>Browse All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((cat: any) => (
            <Link
              key={cat.id || cat._id}
              href={`/shop?category=${cat.id || cat._id}`}
              className="group bg-white border border-[#D9D9D4] rounded-lg overflow-hidden hover:border-[#123C2F]/50 transition-colors"
            >
              <div className="relative aspect-[4/3] w-full bg-[#E9EDE7] overflow-hidden">
                <Image
                  src={
                    cat.image?.url ||
                    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-103"
                />
              </div>
              <div className="p-4 flex items-center justify-between">
                <h3 className="text-base font-medium text-[#123C2F]">{cat.name}</h3>
                <ArrowRight className="w-4 h-4 text-[#123C2F] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FLASH SALE SECTION (Directly after Shop by Category) */}
      <FlashSaleSection products={flashSaleProducts} campaign={flashSaleCampaign} />

      {/* 5. BEST-SELLING PRODUCTS */}
      <section className="bg-white border-b border-[#D9D9D4] py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#123C2F]">
                Best-Selling Pieces
              </h2>
              <p className="text-sm text-[#666666] mt-1">
                Our most loved designs for modern Sri Lankan interiors.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#123C2F] hover:underline"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((prod) => (
              <ProductCard key={prod.id || prod._id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#123C2F]">
              New Arrivals
            </h2>
            <p className="text-sm text-[#666666] mt-1">
              Freshly crafted designs for contemporary living.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#123C2F] hover:underline"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((prod) => (
            <ProductCard key={prod.id || prod._id} product={prod} />
          ))}
        </div>
      </section>

      {/* 7. BRAND INTRODUCTION */}
      <section id="about" className="bg-[#E9EDE7]/60 border-t border-[#D9D9D4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-[#D9D9D4] bg-white">
              <Image
                src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80"
                alt="Handcrafted Sri Lankan interior pieces"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="space-y-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#123C2F]">
                About Aura Luxe Home
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#123C2F] leading-snug">
                Crafted in Sri Lanka, Designed to Last
              </h2>
              <p className="text-sm sm:text-base text-[#333333]/85 leading-relaxed">
                At Aura Luxe Home, we partner with skilled Sri Lankan woodworkers, metal artisans, and ceramicists to create quiet, enduring pieces for modern homes. Every item is made in small batches using sustainably sourced Ceylon teak and natural materials, delivered carefully to all 25 districts.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#123C2F] hover:bg-[#0D2E24] text-white text-sm font-medium rounded-md transition-colors"
                >
                  <span>Explore the Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
