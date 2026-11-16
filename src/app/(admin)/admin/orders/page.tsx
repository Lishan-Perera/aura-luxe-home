'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, Truck, CheckCircle2, Clock, Filter, Search, FileText, X } from 'lucide-react';
import { formatLKR } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [slipModalOpen, setSlipModalOpen] = useState(false);

  const [orders, setOrders] = useState([
    {
      id: 'ALH-2026-8492',
      customer: 'Ruwan Jayawardena',
      phone: '+94 77 123 4567',
      district: 'Colombo',
      city: 'Colombo 07',
      address: 'No. 14, Ward Place',
      items: [
        { title: 'Ceylon Teak Sculptural Armchair', qty: 1, price: 84500 },
      ],
      amount: 84500,
      shippingFee: 0,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'processing',
      courier: { name: 'Prompt Xpress', trackingNumber: 'PX-8492' },
      date: '2026-11-09',
    },
    {
      id: 'ALH-2026-8491',
      customer: 'Dr. Nilmini Perera',
      phone: '+94 71 889 0012',
      district: 'Kandy',
      city: 'Peradeniya',
      address: 'No. 88, River View Road',
      items: [
        { title: 'Kandy Hand-Hammered Brass Pendant Light', qty: 1, price: 36500 },
      ],
      amount: 36500,
      shippingFee: 850,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      bankSlip: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
      courier: { name: 'Domex', trackingNumber: 'DX-LK-00129' },
      date: '2026-11-08',
    },
    {
      id: 'ALH-2026-8490',
      customer: 'Julian De Silva',
      phone: '+94 77 554 9988',
      district: 'Galle',
      city: 'Galle Fort',
      address: 'No. 22, Lighthouse Street',
      items: [
        { title: 'Mirissa Solid Teak Dining Table (8-Seater)', qty: 1, price: 195000 },
      ],
      amount: 195000,
      shippingFee: 0,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      orderStatus: 'shipped',
      courier: { name: 'Pronto Logistics', trackingNumber: 'PR-90184' },
      date: '2026-11-07',
    },
  ]);

  const updateStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
    }
  };

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.orderStatus === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-forest-900">
            Order Fulfillment & Sri Lanka Courier Queue
          </h1>
          <p className="text-xs text-forest-600 mt-1">
            Dispatch, bank deposit slip verification, and courier assignment.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'confirmed', 'processing', 'shipped', 'delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                filterStatus === st
                  ? 'bg-forest-700 text-cream-50 shadow-sm'
                  : 'bg-white border border-cream-300 text-forest-700 hover:bg-cream-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-cream-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-forest-700 uppercase tracking-wider text-[10px] font-semibold border-b border-cream-200">
              <tr>
                <th className="py-3 px-5">Order #</th>
                <th className="py-3 px-5">Customer & District</th>
                <th className="py-3 px-5">Items</th>
                <th className="py-3 px-5">Total (LKR)</th>
                <th className="py-3 px-5">Payment Mode</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 text-forest-800">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-cream-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-serif font-bold text-forest-900">{ord.id}</td>
                  <td className="py-3.5 px-5">
                    <span className="font-semibold block">{ord.customer}</span>
                    <span className="text-[11px] text-forest-500">{ord.district} District • {ord.phone}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="block font-medium">{ord.items[0]?.title}</span>
                    {ord.items.length > 1 && (
                      <span className="text-[10px] text-forest-500">+{ord.items.length - 1} more items</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 font-serif font-bold text-forest-900">
                    {formatLKR(ord.amount)}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1.5">
                      <span className="uppercase tracking-wider font-semibold text-[10px] bg-cream-200 px-2 py-0.5 rounded">
                        {ord.paymentMethod}
                      </span>
                      {ord.bankSlip && (
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setSlipModalOpen(true);
                          }}
                          className="text-[10px] text-gold-600 font-bold hover:underline"
                        >
                          View Slip
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.orderStatus === 'processing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-cream-200 text-forest-800'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="px-3 py-1 bg-forest-700 hover:bg-forest-800 text-cream-50 rounded text-xs font-semibold"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && !slipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-cream-300">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div>
                <span className="text-xs text-forest-500">Order Management</span>
                <h3 className="font-serif text-xl font-bold text-forest-900">{selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full hover:bg-cream-100"
              >
                <X className="w-5 h-5 text-forest-600" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-forest-700">
              <div className="bg-cream-50 p-3.5 rounded-lg border border-cream-200 space-y-1">
                <p><strong>Customer:</strong> {selectedOrder.customer}</p>
                <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                <p><strong>Shipping Address:</strong> {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.district} District</p>
                <p><strong>Total Value:</strong> {formatLKR(selectedOrder.amount)}</p>
              </div>

              {/* Courier info */}
              <div className="space-y-1">
                <label className="font-semibold text-forest-900 block">Assigned Courier:</label>
                <div className="flex gap-2">
                  <select
                    defaultValue={selectedOrder.courier?.name || 'Prompt Xpress'}
                    className="flex-1 text-xs bg-white border border-cream-300 rounded p-2"
                  >
                    <option value="Prompt Xpress">Prompt Xpress (White-Glove)</option>
                    <option value="Domex">Domex Logistics</option>
                    <option value="Pronto">Pronto Sri Lanka</option>
                    <option value="Koombiyo">Koombiyo Delivery</option>
                  </select>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="space-y-2 pt-2 border-t border-cream-200">
                <label className="font-semibold text-forest-900 block">Transition Status:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['confirmed', 'processing', 'shipped', 'delivered'].map((st) => (
                    <button
                      key={st}
                      onClick={() => updateStatus(selectedOrder.id, st)}
                      className={`py-2 text-xs font-semibold rounded uppercase tracking-wider transition-colors ${
                        selectedOrder.orderStatus === st
                          ? 'bg-forest-700 text-cream-50'
                          : 'bg-cream-100 text-forest-800 hover:bg-cream-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-forest-700 text-cream-50 font-semibold text-xs rounded hover:bg-forest-800"
              >
                Close & Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Slip Inspection Modal */}
      {slipModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div>
                <span className="text-xs text-forest-500">Bank Transfer / Deposit Receipt</span>
                <h3 className="font-serif text-lg font-bold text-forest-900">{selectedOrder.id}</h3>
              </div>
              <button onClick={() => setSlipModalOpen(false)}>
                <X className="w-5 h-5 text-forest-600" />
              </button>
            </div>

            <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-cream-300">
              <Image src={selectedOrder.bankSlip} alt="Deposit Slip" fill className="object-cover" />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-forest-600">Expected: {formatLKR(selectedOrder.amount)}</span>
              <button
                onClick={() => {
                  updateStatus(selectedOrder.id, 'confirmed');
                  setSlipModalOpen(false);
                }}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded"
              >
                Approve Payment & Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

