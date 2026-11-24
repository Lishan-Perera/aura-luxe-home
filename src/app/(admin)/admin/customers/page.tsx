'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  ShoppingBag,
  DollarSign,
  Calendar,
  X,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Power,
  ChevronRight,
} from 'lucide-react';
import { formatLKR } from '@/lib/utils';

interface CustomerOrderSummary {
  orderNumber: string;
  amount: number;
  status: string;
  date: string;
  itemsCount: number;
}

interface CustomerRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  district: string;
  isActive: boolean;
  orderCount: number;
  totalSpend: number;
  lastOrderDate: string | null;
  createdAt: string;
  recentOrders?: CustomerOrderSummary[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.customers) {
        setCustomers(data.customers);
      }
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      setStatusMessage({ type: 'error', text: `Failed to load customers: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  const handleToggleStatus = async (customer: CustomerRecord) => {
    try {
      setTogglingId(customer.id);
      const newStatus = !customer.isActive;

      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: customer.id,
          isActive: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle customer status');

      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, isActive: newStatus } : c))
      );

      if (selectedCustomer && selectedCustomer.id === customer.id) {
        setSelectedCustomer({ ...selectedCustomer, isActive: newStatus });
      }

      setStatusMessage({
        type: 'success',
        text: `Customer ${customer.fullName} is now ${newStatus ? 'Active' : 'Deactivated'}.`,
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Status toggle failed' });
    } finally {
      setTogglingId(null);
    }
  };

  const totalClients = customers.length;
  const activeClients = customers.filter((c) => c.isActive).length;
  const totalLifetimeValue = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
  const repeatBuyers = customers.filter((c) => c.orderCount > 1).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-forest-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#123C2F]" />
            Registered Clients &amp; Concierge Database
          </h1>
          <p className="text-xs text-forest-600 mt-1">
            Manage customer accounts, purchase history, and white-glove delivery profiles across Sri Lanka.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCustomers}
            className="p-2.5 bg-white border border-cream-300 hover:bg-cream-100 rounded-lg text-forest-700 transition-colors"
            title="Refresh clients"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-cream-300 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-forest-600">Total Registered Clients</span>
          <span className="font-serif text-2xl font-bold text-forest-900 block">{totalClients}</span>
          <span className="text-[11px] text-forest-500">{activeClients} active accounts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-cream-300 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-forest-600">Total Client Spend</span>
          <span className="font-serif text-2xl font-bold text-forest-900 block">
            {formatLKR(totalLifetimeValue)}
          </span>
          <span className="text-[11px] text-forest-500">Gross customer lifetime value</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-cream-300 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-forest-600">Repeat Buyers</span>
          <span className="font-serif text-2xl font-bold text-forest-900 block">{repeatBuyers}</span>
          <span className="text-[11px] text-forest-500">Clients with &gt; 1 completed order</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-cream-300 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-forest-600">Security &amp; Privacy</span>
          <div className="flex items-center gap-2 pt-1 text-xs text-emerald-800 font-semibold">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Credentials Redacted</span>
          </div>
          <span className="text-[11px] text-forest-500">Passwords excluded by model projection</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-cream-300 flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-forest-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3.5 py-2 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
          />
        </div>
        <span className="text-xs text-forest-500">
          Showing {customers.length} {customers.length === 1 ? 'client' : 'clients'}
        </span>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-cream-300 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-cream-100 text-forest-700 uppercase tracking-wider text-[10px] font-semibold border-b border-cream-200">
              <tr>
                <th className="py-3 px-5">Client Name</th>
                <th className="py-3 px-5">Contact Details</th>
                <th className="py-3 px-5">Primary District</th>
                <th className="py-3 px-5">Orders Placed</th>
                <th className="py-3 px-5">Lifetime Value</th>
                <th className="py-3 px-5">Account Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 text-forest-800">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-forest-500 text-xs">
                    {loading ? 'Loading registered clients from MongoDB...' : 'No clients found matching the query.'}
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-serif font-bold text-forest-900">
                      {c.fullName}
                      <span className="block font-sans text-[10px] text-forest-500 font-normal">
                        Joined: {c.createdAt}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-medium block text-forest-900">{c.email}</span>
                      <span className="text-[11px] text-forest-500">{c.phone}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-forest-700">{c.district}</span>
                    </td>
                    <td className="py-3.5 px-5 font-serif font-semibold text-forest-900">
                      {c.orderCount} {c.orderCount === 1 ? 'Order' : 'Orders'}
                      {c.lastOrderDate && (
                        <span className="block font-sans text-[10px] text-forest-500 font-normal">
                          Latest: {c.lastOrderDate}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-serif font-semibold text-[#123C2F]">
                      {formatLKR(c.totalSpend)}
                    </td>
                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        disabled={togglingId === c.id}
                        onClick={() => handleToggleStatus(c)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.isActive ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                        />
                        <span>{c.isActive ? 'Active' : 'Deactivated'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(c)}
                        className="text-xs font-bold text-[#123C2F] hover:underline"
                      >
                        Order History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-forest-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-cream-300 shadow-xl">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div>
                <span className="text-[10px] text-forest-500 uppercase tracking-widest font-semibold">
                  Client Profile &amp; Order History
                </span>
                <h3 className="font-serif text-lg font-bold text-forest-900">
                  {selectedCustomer.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-md text-forest-400 hover:text-forest-900 hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Information */}
            <div className="bg-cream-50 p-4 rounded-xl space-y-2 text-xs text-forest-800">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-forest-500 shrink-0" />
                <span>{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-forest-500 shrink-0" />
                <span>{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-forest-500 shrink-0" />
                <span>{selectedCustomer.district}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-forest-500 shrink-0" />
                <span>Registered Member Since: {selectedCustomer.createdAt}</span>
              </div>
            </div>

            {/* Orders Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900">
                  Order History ({selectedCustomer.recentOrders?.length || 0})
                </h4>
                <span className="text-xs font-bold text-[#123C2F]">
                  Total: {formatLKR(selectedCustomer.totalSpend)}
                </span>
              </div>

              {(!selectedCustomer.recentOrders || selectedCustomer.recentOrders.length === 0) ? (
                <p className="text-xs text-forest-500 py-4 text-center">
                  This client has not placed any orders yet.
                </p>
              ) : (
                <div className="divide-y divide-cream-200 border border-cream-200 rounded-lg overflow-hidden">
                  {selectedCustomer.recentOrders.map((ord, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs gap-3 hover:bg-cream-50/50">
                      <div>
                        <span className="font-serif font-bold text-forest-900 block">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-forest-500">
                          {ord.date} • {ord.itemsCount} {ord.itemsCount === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-serif font-bold text-forest-900 block">
                          {formatLKR(ord.amount)}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : ord.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-800'
                              : ord.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-cream-200">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-[#123C2F] text-white rounded text-xs font-bold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

