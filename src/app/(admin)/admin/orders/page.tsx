'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  FileText,
  X,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Save,
  Package,
} from 'lucide-react';
import { formatLKR } from '@/lib/utils';

interface OrderItem {
  title: string;
  qty: number;
  quantity?: number;
  price: number;
  variant?: string;
  image?: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  customer: string;
  phone: string;
  email: string;
  district: string;
  city: string;
  address: string;
  items: OrderItem[];
  amount: number;
  subtotal: number;
  shippingFee: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  bankSlip?: string | null;
  courier?: { name?: string; trackingNumber?: string };
  date: string;
  notes?: string;
}

export default function AdminOrdersPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders?status=${filterStatus}`);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setStatusMessage({ type: 'error', text: `Failed to load orders: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const updateStatus = async (orderNumber: string, newStatus: string) => {
    try {
      setUpdatingId(orderNumber);
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          orderStatus: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');

      setOrders((prev) =>
        prev.map((o) => (o.orderNumber === orderNumber ? { ...o, orderStatus: newStatus } : o))
      );

      if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }

      setStatusMessage({
        type: 'success',
        text: `Order ${orderNumber} status changed to ${newStatus.toUpperCase()}.`,
      });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Status update failed' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveCourier = async () => {
    if (!selectedOrder) return;
    try {
      setUpdatingId(selectedOrder.orderNumber);
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: selectedOrder.orderNumber,
          courier: {
            name: courierName.trim() || 'Prompt Xpress',
            trackingNumber: trackingNumber.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign courier');

      const updatedCourier = {
        name: courierName.trim() || 'Prompt Xpress',
        trackingNumber: trackingNumber.trim(),
      };

      setOrders((prev) =>
        prev.map((o) =>
          o.orderNumber === selectedOrder.orderNumber ? { ...o, courier: updatedCourier } : o
        )
      );

      setSelectedOrder({
        ...selectedOrder,
        courier: updatedCourier,
      });

      setCourierModalOpen(false);
      setStatusMessage({
        type: 'success',
        text: `Courier assigned to ${selectedOrder.orderNumber}: ${updatedCourier.name} (${updatedCourier.trackingNumber})`,
      });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to assign courier' });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      o.district.toLowerCase().includes(q) ||
      (o.courier?.trackingNumber || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-forest-900">
            Order Fulfillment &amp; Sri Lanka Courier Queue
          </h1>
          <p className="text-xs text-forest-600 mt-1">
            Dispatch, courier tracking assignment, and bank deposit verification across Sri Lanka’s 25 districts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-white border border-cream-300 hover:bg-cream-100 rounded-lg text-forest-700 transition-colors"
            title="Refresh orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-cream-300">
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md uppercase tracking-wider transition-all ${
                filterStatus === st
                  ? 'bg-[#123C2F] text-white'
                  : 'bg-[#FBF8F3] text-[#333333] hover:bg-[#E9EDE7] border border-[#D9D9D4]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-forest-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ref, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3.5 py-2 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
          />
        </div>
      </div>

      {/* Notification Banner */}
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

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-cream-300 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-cream-100 text-forest-700 uppercase tracking-wider text-[10px] font-semibold border-b border-cream-200">
              <tr>
                <th className="py-3 px-5">Order Reference</th>
                <th className="py-3 px-5">Customer &amp; District</th>
                <th className="py-3 px-5">Amount (LKR)</th>
                <th className="py-3 px-5">Payment &amp; Slip</th>
                <th className="py-3 px-5">Fulfillment Status</th>
                <th className="py-3 px-5">Courier Tracking</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 text-forest-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-forest-500 text-xs">
                    {loading ? 'Loading orders from database...' : 'No orders found matching the criteria.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.orderNumber || ord.id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-serif font-bold text-forest-900">
                      {ord.orderNumber}
                      <span className="block font-sans text-[10px] text-forest-500 font-normal">{ord.date}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold block">{ord.customer}</span>
                      <span className="text-forest-500 text-[11px]">
                        {ord.district} • {ord.phone}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-serif font-semibold">
                      {formatLKR(ord.amount)}
                      <span className="block font-sans text-[10px] text-forest-500 font-normal">
                        {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <span className="uppercase text-[10px] font-medium text-forest-700">
                          {ord.paymentMethod === 'cod'
                            ? 'COD'
                            : ord.paymentMethod === 'bank_transfer'
                            ? 'Bank'
                            : 'Card'}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded ${
                            ord.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </div>
                      {ord.bankSlip && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(ord);
                            setSlipModalOpen(true);
                          }}
                          className="mt-1 text-[10px] text-[#123C2F] underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Deposit Slip</span>
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <select
                        value={ord.orderStatus}
                        disabled={updatingId === ord.orderNumber}
                        onChange={(e) => updateStatus(ord.orderNumber, e.target.value)}
                        className={`text-[11px] font-semibold uppercase tracking-wider py-1 px-2.5 rounded-full border border-current focus:outline-none transition-colors ${
                          ord.orderStatus === 'delivered'
                            ? 'bg-[#E9EDE7] text-[#123C2F] border-transparent'
                            : ord.orderStatus === 'shipped'
                            ? 'bg-blue-50 text-blue-800 border-transparent'
                            : ord.orderStatus === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-transparent'
                            : ord.orderStatus === 'cancelled'
                            ? 'bg-red-50 text-red-700 border-transparent'
                            : 'bg-[#FBF8F3] text-[#333333] border-[#D9D9D4]'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="space-y-0.5">
                        <span className="font-medium text-[11px] block text-forest-900">
                          {ord.courier?.name || 'Prompt Xpress'}
                        </span>
                        <span className="text-[10px] text-forest-500 font-mono block">
                          {ord.courier?.trackingNumber || 'Tracking Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(ord);
                          setCourierName(ord.courier?.name || 'Prompt Xpress');
                          setTrackingNumber(ord.courier?.trackingNumber || '');
                          setCourierModalOpen(true);
                        }}
                        className="text-[11px] font-medium text-[#123C2F] hover:underline"
                        title="Assign Courier Tracking"
                      >
                        Courier
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="text-[11px] font-bold text-[#123C2F] hover:underline"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && !courierModalOpen && !slipModalOpen && (
        <div className="fixed inset-0 z-50 bg-forest-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-cream-300 shadow-xl">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div>
                <span className="text-[10px] text-forest-500 uppercase tracking-widest font-semibold">
                  Order Details
                </span>
                <h3 className="font-serif text-lg font-bold text-forest-900">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-md text-forest-400 hover:text-forest-900 hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-cream-50 p-4 rounded-xl space-y-1.5 text-xs text-forest-800">
              <p>
                <strong>Customer:</strong> {selectedOrder.customer}
              </p>
              <p>
                <strong>Phone:</strong> {selectedOrder.phone}
              </p>
              {selectedOrder.email && (
                <p>
                  <strong>Email:</strong> {selectedOrder.email}
                </p>
              )}
              <p>
                <strong>Delivery Address:</strong> {selectedOrder.address}, {selectedOrder.city},{' '}
                {selectedOrder.district}
              </p>
              {selectedOrder.notes && (
                <p>
                  <strong>Notes:</strong> {selectedOrder.notes}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900">
                Order Items ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-cream-200 border border-cream-200 rounded-lg overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded bg-cream-100 relative shrink-0 overflow-hidden">
                        <img src={item.image || '/assets/logo.png'} alt="" className="object-cover w-full h-full" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-forest-900 truncate">{item.title}</p>
                        <p className="text-[11px] text-forest-500">
                          {item.variant || 'Standard'} • Qty: {item.qty || item.quantity || 1}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-forest-900 whitespace-nowrap">
                      {formatLKR(item.price * (item.qty || item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-cream-50 p-3.5 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between text-forest-600">
                <span>Subtotal:</span>
                <span>{formatLKR(selectedOrder.subtotal || selectedOrder.amount)}</span>
              </div>
              <div className="flex justify-between text-forest-600">
                <span>Delivery Fee:</span>
                <span>{selectedOrder.shippingFee === 0 ? 'FREE White-Glove' : formatLKR(selectedOrder.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-forest-900 font-bold border-t border-cream-300 pt-1 text-sm">
                <span>Total Amount:</span>
                <span className="font-serif">{formatLKR(selectedOrder.amount)}</span>
              </div>
            </div>

            {/* Courier Section */}
            <div className="p-3 border border-cream-300 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-forest-500 block text-[10px] uppercase font-semibold">
                  Courier Assignment
                </span>
                <p className="font-semibold text-forest-900">
                  {selectedOrder.courier?.name || 'Prompt Xpress'} ({selectedOrder.courier?.trackingNumber || 'Pending'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCourierName(selectedOrder.courier?.name || 'Prompt Xpress');
                  setTrackingNumber(selectedOrder.courier?.trackingNumber || '');
                  setCourierModalOpen(true);
                }}
                className="px-3 py-1.5 bg-[#123C2F] text-white rounded text-[11px] font-semibold hover:bg-[#0D2E24]"
              >
                Change Courier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courier Assignment Modal */}
      {courierModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-forest-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-cream-300 shadow-xl">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-serif text-base font-bold text-forest-900">
                Assign Sri Lanka Courier &amp; Tracking Code
              </h3>
              <button
                type="button"
                onClick={() => setCourierModalOpen(false)}
                className="p-1 rounded-md text-forest-400 hover:text-forest-900 hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-forest-600">
              Assign tracking code for {selectedOrder.orderNumber} ({selectedOrder.customer},{' '}
              {selectedOrder.district}).
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-forest-700 block mb-1">
                  Courier Provider
                </label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600"
                >
                  <option value="Prompt Xpress (White-Glove Islandwide Delivery)">
                    Prompt Xpress (White-Glove Islandwide)
                  </option>
                  <option value="Domex Courier Logistics">Domex Courier Logistics</option>
                  <option value="Pronto Logistics Sri Lanka">Pronto Logistics Sri Lanka</option>
                  <option value="Certis Lanka Courier Services">Certis Lanka Courier Services</option>
                  <option value="Aura Luxe Dedicated In-House Concierge Delivery">
                    Aura Luxe Dedicated In-House Fleet
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-forest-700 block mb-1">
                  Courier Waybill / Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. PX-LK-8492019"
                  className="w-full text-xs p-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-200">
              <button
                type="button"
                onClick={() => setCourierModalOpen(false)}
                className="px-4 py-2 border border-cream-300 text-forest-700 rounded text-xs font-medium hover:bg-cream-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCourier}
                disabled={updatingId === selectedOrder.orderNumber}
                className="px-4 py-2 bg-[#123C2F] hover:bg-[#0D2E24] text-white rounded text-xs font-bold transition-colors"
              >
                Save &amp; Update Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Slip Modal */}
      {slipModalOpen && selectedOrder && selectedOrder.bankSlip && (
        <div className="fixed inset-0 z-50 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-cream-300 shadow-xl">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-serif text-base font-bold text-forest-900">
                Bank Deposit Slip: {selectedOrder.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setSlipModalOpen(false)}
                className="p-1 rounded-md text-forest-400 hover:text-forest-900 hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-[4/3] bg-cream-100 rounded-lg overflow-hidden border border-cream-300 relative">
              <img
                src={selectedOrder.bankSlip}
                alt="Bank deposit receipt"
                className="object-contain w-full h-full"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-forest-600">
                Payment Status: <strong>{selectedOrder.paymentStatus}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSlipModalOpen(false)}
                className="px-4 py-2 bg-[#123C2F] text-white rounded text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
