'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ExternalLink,
  Power,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { formatLKR } from '@/lib/utils';

interface ProductItem {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  roomType: string;
  categoryName?: string;
  price: number;
  compareAtPrice?: number;
  images: Array<{ url: string; alt?: string }>;
  variants?: Array<{ sku: string; stockQuantity: number }>;
  isActive: boolean;
  totalStock?: number;
  isMockShowcase?: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setStatusMessage({ type: 'error', text: `Failed to load products: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product: ProductItem) => {
    const id = product._id || product.id;
    const newStatus = !product.isActive;

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isActive: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setProducts((prev) =>
        prev.map((p) => ((p._id || p.id) === id ? { ...p, isActive: newStatus } : p))
      );

      setStatusMessage({
        type: 'success',
        text: `Product "${product.title}" is now ${newStatus ? 'Active' : 'Inactive'}.`,
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Status update failed' });
    }
  };

  const handleDelete = async (product: ProductItem) => {
    const id = product._id || product.id;
    if (!id) return;

    if (product.isMockShowcase) {
      alert('Showcase sample products cannot be deleted as they represent core portfolio items.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${product.title}" and its associated inventory records from MongoDB?`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');

      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
      setStatusMessage({
        type: 'success',
        text: `✨ ${data.message || `Product "${product.title}" deleted.`}`,
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Deletion failed' });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesRoom = !roomFilter || p.roomType === roomFilter;
    const matchesSearch =
      !searchTerm ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.roomType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.variants?.some((v) => v.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRoom && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-forest-900 tracking-tight">
            Product Catalog & Inventory
          </h1>
          <p className="text-xs text-forest-600 mt-1">
            Manage handcrafted Ceylon teak furniture, brass lighting, and ceramic pieces ({products.length} pieces in database).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="p-2.5 bg-white border border-cream-300 hover:bg-cream-100 rounded-lg text-forest-700 transition-colors"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-forest-700 hover:bg-forest-800 text-cream-50 font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-gold-300" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span className="flex-1">{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-forest-400 hover:text-forest-600">
            &times;
          </button>
        </div>
      )}

      {/* Table & Controls Card */}
      <div className="bg-white rounded-xl border border-cream-300 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-cream-50/30">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by title, SKU, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600"
            />
            <Search className="w-3.5 h-3.5 text-forest-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-forest-600 font-medium">Sanctuary Room:</span>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="text-xs bg-white border border-cream-300 rounded-lg py-1.5 px-2.5 text-forest-800 font-medium focus:outline-none focus:border-forest-600"
            >
              <option value="">All Sanctuary Rooms</option>
              <option value="Living Room">Living Room</option>
              <option value="Bedroom">Bedroom</option>
              <option value="Dining & Kitchen">Dining & Kitchen</option>
              <option value="Luxury Lighting">Luxury Lighting</option>
              <option value="Artisanal Decor">Artisanal Decor</option>
              <option value="Rugs & Textiles">Rugs & Textiles</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-forest-700 uppercase tracking-wider text-[10px] font-semibold border-b border-cream-200">
              <tr>
                <th className="py-3.5 px-5">Piece</th>
                <th className="py-3.5 px-5">Sanctuary / Category</th>
                <th className="py-3.5 px-5">Price (LKR)</th>
                <th className="py-3.5 px-5">Inventory Stock</th>
                <th className="py-3.5 px-5">Catalog Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 text-forest-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-forest-600">
                    <div className="w-6 h-6 border-2 border-forest-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading catalog records from database...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-forest-600">
                    <Package className="w-8 h-8 text-cream-400 mx-auto mb-2" />
                    <span className="font-semibold block">No matching products found</span>
                    <span className="text-[11px] text-forest-500">Try adjusting your search query or room filter.</span>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const id = p._id || p.id;
                  const stock = p.totalStock ?? p.variants?.reduce((s, v) => s + (v.stockQuantity || 0), 0) ?? 10;
                  const primaryImg = p.images?.[0]?.url || '/assets/logo.png';
                  const skuCode = p.variants?.[0]?.sku || `ALH-${p.slug?.slice(0, 4)?.toUpperCase() || 'GEN'}`;

                  return (
                    <tr key={id} className="hover:bg-cream-50/70 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg bg-cream-100 overflow-hidden shrink-0 border border-cream-200">
                            <Image src={primaryImg} alt={p.title} fill className="object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-forest-900 block">{p.title}</span>
                            <span className="text-forest-500 font-mono text-[11px]">SKU: {skuCode}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <span className="font-semibold text-forest-900 block">{p.roomType}</span>
                        <span className="text-[11px] text-forest-500">{p.categoryName || 'General'}</span>
                      </td>
                      <td className="py-3 px-5 font-bold text-forest-900">
                        {formatLKR(p.price)}
                        {p.compareAtPrice && p.compareAtPrice > p.price && (
                          <span className="block text-[10px] text-forest-400 line-through">
                            {formatLKR(p.compareAtPrice)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5">
                        <span
                          className={`font-semibold inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] ${
                            stock <= 3
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${stock <= 3 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          {stock} in stock
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            p.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                          title="Click to toggle Active / Inactive"
                        >
                          <Power className="w-3 h-3" />
                          <span>{p.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Storefront Link */}
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-forest-600 hover:text-gold-700 hover:bg-cream-100 rounded transition-colors"
                            title="View on Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Edit Product */}
                          <Link
                            href={`/admin/products/${id}/edit`}
                            className="p-1.5 text-forest-700 hover:text-forest-950 hover:bg-cream-100 rounded transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Delete Product */}
                          {!p.isMockShowcase && (
                            <button
                              type="button"
                              onClick={() => handleDelete(p)}
                              disabled={deletingId === id}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
