import Link from 'next/link';
import { DollarSign, ShoppingCart, AlertTriangle, Users, ArrowUpRight, Plus, PackageCheck } from 'lucide-react';
import { formatLKR } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/data/mockData';

export default function AdminDashboardPage() {
  const kpis = [
    { label: 'Monthly Revenue', value: 'LKR 1,845,000', change: '+24% from last month', icon: DollarSign, color: 'text-gold-600', bg: 'bg-gold-50' },
    { label: 'Active Orders', value: '38 Orders', change: '8 pending dispatch', icon: ShoppingCart, color: 'text-forest-700', bg: 'bg-forest-50' },
    { label: 'Low Stock SKU Alerts', value: '3 Items', change: 'Replenishment needed', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Registered Clients', value: '184 Clients', change: '+18 this week', icon: Users, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  ];

  const recentOrders = [
    { id: 'ALH-2026-8492', client: 'Ruwan Jayawardena', district: 'Colombo 07', amount: 84500, method: 'Cash on Delivery', status: 'Processing' },
    { id: 'ALH-2026-8491', client: 'Dr. Nilmini Perera', district: 'Kandy', amount: 36500, method: 'Bank Transfer (Verified)', status: 'Confirmed' },
    { id: 'ALH-2026-8490', client: 'Julian De Silva', district: 'Galle Fort', amount: 195000, method: 'Credit Card (Paid)', status: 'Shipped' },
    { id: 'ALH-2026-8489', client: 'Anushka Fernando', district: 'Gampaha', amount: 32000, method: 'Cash on Delivery', status: 'Delivered' },
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
            Real-time MongoDB Atlas telemetry for Aura Luxe Home Sri Lanka.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-forest-950 font-semibold text-xs rounded-md shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold text-xs rounded-md shadow-sm transition-all flex items-center gap-1.5"
          >
            <PackageCheck className="w-4 h-4 text-gold-300" />
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white p-5 rounded-xl border border-cream-300 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-forest-600">{kpi.label}</span>
                <div className={`w-8 h-8 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-forest-900 block">{kpi.value}</span>
                <span className="text-[11px] text-forest-500 font-medium">{kpi.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Grid */}
      <div className="bg-white rounded-xl border border-cream-300 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-cream-200 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-base font-bold text-forest-900">Recent Customer Orders</h2>
            <p className="text-xs text-forest-500">Live order fulfillment queue across 25 districts.</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-forest-700 uppercase tracking-wider text-[10px] font-semibold border-b border-cream-200">
              <tr>
                <th className="py-3 px-5">Order Reference</th>
                <th className="py-3 px-5">Customer & District</th>
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
                  <td className="py-3.5 px-5 font-serif font-semibold">{formatLKR(order.amount)}</td>
                  <td className="py-3.5 px-5">{order.method}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gold-100 text-gold-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={`/admin/orders`}
                      className="text-xs font-semibold text-forest-700 hover:text-gold-600 underline"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products Inventory Summary */}
      <div className="bg-white rounded-xl border border-cream-300 p-5 shadow-sm space-y-4">
        <h2 className="font-serif text-base font-bold text-forest-900">
          Catalog Inventory Quick Health
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MOCK_PRODUCTS.slice(0, 3).map((prod) => (
            <div key={prod.id || prod._id} className="p-3.5 rounded-lg border border-cream-200 bg-cream-50/50 flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-cream-200 overflow-hidden relative shrink-0">
                <img src={prod.images?.[0]?.url} alt="" className="object-cover w-full h-full" />
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <p className="font-serif font-bold text-forest-900 truncate">{prod.title}</p>
                <p className="text-forest-600">{formatLKR(prod.price)}</p>
                <span className="text-[10px] text-emerald-700 font-semibold">In Stock (12 Units)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

