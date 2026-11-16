import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getProducts } from '@/lib/data/products';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';
import ProductCard from '@/components/storefront/ProductCard';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found | Aura Luxe Home' };

  return {
    title: `${product.title} | Aura Luxe Home Sri Lanka`,
    description: product.shortSummary || product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (await getProducts({ roomType: product.roomType, limit: 4 }))
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="text-xs text-forest-500 flex items-center gap-2">
        <Link href="/" className="hover:text-gold-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-gold-600 transition-colors">Collections</Link>
        <span>/</span>
        <Link href={`/shop?room=${encodeURIComponent(product.roomType)}`} className="hover:text-gold-600 transition-colors">
          {product.roomType}
        </Link>
        <span>/</span>
        <span className="text-forest-900 font-medium line-clamp-1">{product.title}</span>
      </nav>

      {/* Main PDP Client Interactive Layout */}
      <ProductDetailClient product={product} />

      {/* Complete the Look / Related Pieces */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-cream-300">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold-600 font-semibold">
                Curated Harmonies
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 mt-1">
                Complete the Look
              </h2>
            </div>
            <Link
              href={`/shop?room=${encodeURIComponent(product.roomType)}`}
              className="text-xs font-semibold uppercase tracking-wider text-forest-700 hover:text-gold-600"
            >
              Explore {product.roomType}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

