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
    title: `${product.title} | Aura Luxe Home`,
    description: product.shortSummary || product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (await getProducts({ limit: 5 }))
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      {/* Simple Breadcrumb */}
      <nav className="text-xs text-[#666666] flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-[#123C2F] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#123C2F] transition-colors">
          Shop
        </Link>
        <span>/</span>
        <span className="text-[#123C2F] font-medium line-clamp-1">{product.title}</span>
      </nav>

      {/* Main Product Details */}
      <ProductDetailClient product={product} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-[#D9D9D4]">
          <div className="flex items-end justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#123C2F]">
              You May Also Like
            </h2>
            <Link
              href="/shop"
              className="text-xs sm:text-sm font-medium text-[#123C2F] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id || prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
