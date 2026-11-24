'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Users,
  ArrowUpRight,
  Plus,
  PackageCheck,
  Sparkles,
  RefreshCw,
  Package,
} from 'lucide-react';
import { formatLKR } from '@/lib/utils';

interface DashboardStats {
  totalRevenue: number;
  activeOrdersCount: number;
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  lowStockCount: number;
}

interface RecentOrder {
  id: string;
  client: string;
  district: string;
  amount: number;
  method: string;
  status: string;
}

interface InventoryItem {
  id: string;
  title: string;
  price: number;
  image: string;
  stock: number;
  lowStock: boolean;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 1845000,
    activeOrdersCount: 38,
    totalProducts: 12,
    totalCustomers: 184,
    totalOrders: 42,
    lowStockCount: 3,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [inventoryHealth, setInventoryHealth] = useState<InventoryItem[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
      }
      if (data.recentOrders) {
        setRecentOrders(data.recentOrders);
      }
      if (data.inventoryHealth) {
        setInventoryHealth(data.inventoryHealth);
      }
    } catch (err) {
      console.warn('Failed to load live dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const kpis = [
    {
      label: 'Total Revenue',
      value: formatLKR(stats.totalRevenue),
      change: `${stats.totalOrders} total orders placed`,
      icon: DollarSign,
      color: 'text-[#123C2F]',
      bg: 'bg-[#E9EDE7]',
    },
    {
      label: 'Active Orders',
      value: `${stats.activeOrdersCount} Orders`,
      change: 'In fulfillment pipeline',
      icon: ShoppingCart,
      color: 'text-[#123C2F]',
      bg: 'bg-[#E9EDE7]',
    },
    {
      label: 'Low Stock SKU Alerts',
      value: `${stats.lowStockCount} Items`,
      change: 'Replenishment threshold reached',
      icon: AlertTriangle,
      color: stats.lowStockCount > 0 ? 'text-amber-800' : 'text-[#123C2F]',
      bg: stats.lowStockCount > 0 ? 'bg-amber-100' : 'bg-[#E9EDE7]',
    },
    {
      label: 'Registered Clients',
      value: `${stats.totalCustomers} Clients`,
      change: `${stats.totalProducts} active products listed`,
      icon: Users,
      color: 'text-[#123C2F]',
      bg: 'bg-[#E9EDE7]',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900">
            Store Performance & Orders
          </h1>
          <p className="text-xs text-forest-600 mt-1">
            Real-time telemetry and management portal for Aura Luxe Home Sri Lanka.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={fetchDashboardData}
            className="p-2 bg-white border border-[#D9D9D4] hover:bg-[#E9EDE7] text-[#123C2F] rounded-md transition-colors"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-[#123C2F] hover:bg-[#0D2E24] text-white font-medium text-xs rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
          <Link
            href="/admin/promotions"
            className="px-4 py-2 bg-white border border-[#D9D9D4] hover:bg-[#E9EDE7] text-[#123C2F] font-medium text-xs rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            Promotions &amp; Flash Sale
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-white border border-[#D9D9D4] hover:bg-[#E9EDE7] text-[#123C2F] font-medium text-xs rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <PackageCheck className="w-4 h-4" />
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white p-5 rounded-xl border border-cream-300 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-forest-600">{kpi.label}</span>
                <div
                  className={`w-8 h-8 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-forest-900 block">
                  {kpi.value}
                </span>
                <span className="text-[11px] text-forest-500 font-medium">{kpi.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Grid */}
      <div className="bg-white rounded-xl border border-cream-300 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-cream-200 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-base font-bold text-forest-900">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-forest-500">
              Live order fulfillment queue across Sri Lanka’s 25 districts.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-[#123C2F] hover:underline flex items-center gap-1 shrink-0 whitespace-nowrap"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead className="bg-cream-100 text-forest-700 uppercase tracking-wider text-[10px] font-semibold border-b border-cream-200">
              <tr>
                <th className="py-3 px-5">Order Reference</th>
                <th className="py-3 px-5">Customer &amp; District</th>
                <th className="py-3 px-5">Amount (LKR)</th>
                <th className="py-3 px-5">Payment Mode</th>
                <th className="py-3 px-5">Fulfillment Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 text-forest-800">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-cream-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-serif font-bold text-forest-900">{order.id}</td>
                  <td className="py-3.5 px-5">
                    <span className="font-semibold block">{order.client}</span>
                    <span className="text-forest-500 text-[11px]">{order.district}</span>
                  </td>
                  <td className="py-3.5 px-5 font-serif font-semibold">
                    {formatLKR(order.amount)}
                  </td>
                  <td className="py-3.5 px-5">{order.method}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        order.status === 'Delivered'
                          ? 'bg-[#E9EDE7] text-[#123C2F]'
                          : order.status === 'Shipped'
                          ? 'bg-blue-50 text-blue-800'
                          : order.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-800'
                          : order.status === 'Cancelled'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-[#FBF8F3] text-[#333333] border border-[#D9D9D4]'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href="/admin/orders"
                      className="text-xs font-medium text-[#123C2F] hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products Inventory Summary */}
      <div className="bg-white rounded-xl border border-cream-300 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-base font-bold text-forest-900">
            Catalog Inventory Quick Health
          </h2>
          <Link
            href="/admin/products"
            className="text-xs font-medium text-[#123C2F] hover:underline flex items-center gap-1"
          >
            <span>Manage Catalog</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {inventoryHealth.map((prod) => (
            <div
              key={prod.id}
              className="p-3.5 rounded-lg border border-cream-200 bg-cream-50/50 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded bg-cream-200 overflow-hidden relative shrink-0">
                {prod.image ? (
                  <img src={prod.image} alt="" className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-forest-500">
                    <Package className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <p className="font-serif font-bold text-forest-900 truncate">{prod.title}</p>
                <p className="text-forest-600">{formatLKR(prod.price)}</p>
                <span
                  className={`text-[10px] font-semibold ${
                    prod.lowStock ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {prod.lowStock ? `⚠️ Low Stock (${prod.stock} Units)` : `In Stock (${prod.stock} Units)`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
