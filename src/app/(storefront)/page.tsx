import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import { getProducts } from '@/lib/data/products';
import { getCategories } from '@/lib/data/categories';

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts({ limit: 6 }),
    getCategories(),
  ]);

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative min-h-[82vh] flex items-center justify-center overflow-hidden bg-forest-900 text-cream-50">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85"
            alt="Aura Luxe Home Luxury Interior Living Space"
            fill
            priority
            className="object-cover opacity-35 scale-105 transition-transform duration-10000 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/60 to-forest-900/30" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-12 pb-16">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-cream-50 leading-[1.15]">
            Curated Living, <br />
            <span className="italic font-normal text-gold-300">Timeless Elegance</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-cream-200/90 leading-relaxed font-light">
            Handcrafted solid Ceylon teak furniture, hand-spun brass lighting, and tactile stoneware ceramics designed for mindful, elevated Sri Lankan homes.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gold-400 hover:bg-gold-500 text-forest-900 font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-gold-glow flex items-center justify-center gap-2"
            >
              Explore Collections
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/shop?room=Living+Room"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-cream-100 border border-cream-200/30 font-semibold text-xs uppercase tracking-widest backdrop-blur-sm transition-all duration-300"
            >
              Living Room Sanctuary
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY ROOM / CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-600 font-semibold">
            Architectural Spaces
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest-900">
            Shop by Sanctuary
          </h2>
          <p className="text-sm text-forest-600/80">
            Every piece is created in dialogue with modern tropical architecture and everyday tranquility.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat: any) => (
            <Link
              key={cat.id || cat._id}
              href={`/shop?category=${cat.id || cat._id}`}
              className="group relative h-80 rounded-xl overflow-hidden border border-cream-300 shadow-sm hover:shadow-luxury transition-all duration-500"
            >
              <Image
                src={cat.image?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-900/30 to-transparent" />

              <div className="absolute inset-x-6 bottom-6 text-cream-50 space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-300 font-semibold">
                  Curated Collection
                </span>
                <h3 className="font-serif text-xl font-bold group-hover:text-gold-200 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-cream-200/80 line-clamp-2 font-light">
                  {cat.description}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-gold-400 font-medium group-hover:translate-x-1 transition-transform">
                  <span>Explore room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED CURATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cream-300 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-600 font-semibold">
              Iconic Masterpieces
            </p>
            <h2 className="font-serif text-3xl font-bold text-forest-900 mt-1">
              Curated Bestsellers
            </h2>
          </div>
          <Link
            href="/shop?filter=featured"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest-700 hover:text-gold-600 transition-colors"
          >
            <span>View All Highlights</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.id || prod._id} product={prod} />
          ))}
        </div>
      </section>

      {/* 4. BRAND ETHOS / CRAFTSMANSHIP BANNER */}
      <section className="bg-forest-800 text-cream-100 py-20 border-y border-gold-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gold-400/30 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80"
                alt="Sri Lankan Teak and Brass Artisan Craftsman"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-6">
              <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-semibold">
                Our Sri Lankan Heritage
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream-50 leading-tight">
                Honoring Ceylon Teak & <br />
                <span className="italic font-normal text-gold-300">Generational Artisanship</span>
              </h2>
              <p className="text-sm text-cream-200/80 leading-relaxed font-light">
                Every dining table, sculptural lounge chair, and spun brass fixture at Aura Luxe Home is born from the hands of dedicated Sri Lankan woodworkers, brass turners, and ceramicists. We preserve traditional joinery techniques while cultivating a modern, quiet luxury design language.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-2 border-t border-forest-700 text-xs">
                <div>
                  <h4 className="font-serif text-base font-bold text-gold-300">100% Seasoned Teak</h4>
                  <p className="text-cream-300/70 mt-1">Sustainably harvested from certified plantation sources in Sri Lanka.</p>
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-gold-300">Custom Dimensions</h4>
                  <p className="text-cream-300/70 mt-1">Bespoke sizing options for private villas, suites, and residences.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW SEASON ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cream-300 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-600 font-semibold">
              Fresh Creations
            </p>
            <h2 className="font-serif text-3xl font-bold text-forest-900 mt-1">
              New Seasonal Arrivals
            </h2>
          </div>
          <Link
            href="/shop?sort=newest"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest-700 hover:text-gold-600 transition-colors"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((prod) => (
            <ProductCard key={prod.id || prod._id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. CLIENT TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cream-200/50 rounded-2xl p-8 sm:p-12 border border-cream-300 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-gold-600 font-semibold">
              Client Stories
            </p>
            <h2 className="font-serif text-3xl font-bold text-forest-900">
              Living with Aura Luxe
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-cream-300 shadow-sm space-y-3">
              <div className="flex text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-forest-800 leading-relaxed italic">
                “The Ceylon Teak Armchairs are exquisite. Delivered to our home in Colombo 07 within 24 hours with exceptional white-glove setup. Uncompromising quality.”
              </p>
              <div className="pt-2 border-t border-cream-200">
                <p className="text-xs font-serif font-bold text-forest-900">Dr. K. Jayasuriya</p>
                <p className="text-[11px] text-forest-500">Colombo 07, Sri Lanka</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-cream-300 shadow-sm space-y-3">
              <div className="flex text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-forest-800 leading-relaxed italic">
                “We ordered the Kandy brass pendant light and French linens for our boutique villa in Galle Fort. The brass patina is stunning in the tropical sea breeze.”
              </p>
              <div className="pt-2 border-t border-cream-200">
                <p className="text-xs font-serif font-bold text-forest-900">Amani & Julian</p>
                <p className="text-[11px] text-forest-500">Galle Fort Villa Owner</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-cream-300 shadow-sm space-y-3">
              <div className="flex text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-forest-800 leading-relaxed italic">
                “The Cash on Delivery option in Kandy gave us total peace of mind. Arrived meticulously crated and the solid teak dining table is the pride of our home.”
              </p>
              <div className="pt-2 border-t border-cream-200">
                <p className="text-xs font-serif font-bold text-forest-900">Ranil Senanayake</p>
                <p className="text-[11px] text-forest-500">Kandy, Central Province</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

