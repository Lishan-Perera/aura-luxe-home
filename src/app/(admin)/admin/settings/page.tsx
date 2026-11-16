'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Truck, Building, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatLKR } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [colomboFee, setColomboFee] = useState('450');
  const [greaterColomboFee, setGreaterColomboFee] = useState('600');
  const [outstationFee, setOutstationFee] = useState('850');
  const [freeThreshold, setFreeThreshold] = useState('25000');

  const [bankName, setBankName] = useState('Commercial Bank of Ceylon');
  const [accountName, setAccountName] = useState('Aura Luxe Home (Pvt) Ltd');
  const [accountNumber, setAccountNumber] = useState('1000 8492 0184');
  const [branch, setBranch] = useState('Colombo Ward Place Prestige Branch');
  const [isVerified, setIsVerified] = useState(true);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.shipping) {
          setColomboFee(String(data.shipping.colomboFee || '450'));
          setGreaterColomboFee(String(data.shipping.greaterColomboFee || '600'));
          setOutstationFee(String(data.shipping.outstationFee || '850'));
          setFreeThreshold(String(data.shipping.freeThreshold || '25000'));
        }
        if (data?.bank) {
          setBankName(data.bank.bankName || 'Commercial Bank of Ceylon');
          setAccountName(data.bank.accountName || 'Aura Luxe Home (Pvt) Ltd');
          setAccountNumber(data.bank.accountNumber || '1000 8492 0184');
          setBranch(data.bank.branch || 'Colombo Ward Place Prestige Branch');
          setIsVerified(data.bank.isVerified ?? true);
        }
      })
      .catch((err) => console.warn('Settings load error:', err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping: {
            colomboFee: Number(colomboFee),
            greaterColomboFee: Number(greaterColomboFee),
            outstationFee: Number(outstationFee),
            freeThreshold: Number(freeThreshold),
          },
          bank: {
            bankName,
            accountName,
            accountNumber,
            branch,
            isVerified,
          },
        }),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.warn('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-forest-900">
          Store Logistics & Banking Settings
        </h1>
        <p className="text-xs text-forest-600 mt-1">
          Configure islandwide delivery rates across Sri Lanka’s 25 districts and official bank deposit verification.
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings successfully updated in MongoDB Atlas cluster!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* District Delivery Rates */}
        <div className="bg-white p-6 rounded-xl border border-cream-300 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-2">
            <Truck className="w-4 h-4 text-gold-500" />
            <h2 className="font-serif text-base font-bold text-forest-900">
              1. Sri Lanka District Delivery Tier Rates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Colombo 1–15 City Zone (LKR)
              </label>
              <input
                type="number"
                value={colomboFee}
                onChange={(e) => setColomboFee(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Greater Colombo / Western Suburbs (LKR)
              </label>
              <input
                type="number"
                value={greaterColomboFee}
                onChange={(e) => setGreaterColomboFee(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Outstation Districts (Kandy, Galle, Kurunegala, etc.) (LKR)
              </label>
              <input
                type="number"
                value={outstationFee}
                onChange={(e) => setOutstationFee(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Free Islandwide Delivery Spend Threshold (LKR)
              </label>
              <input
                type="number"
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-serif font-bold text-gold-600"
              />
            </div>
          </div>
        </div>

        {/* Bank Deposit Account Details */}
        <div className="bg-white p-6 rounded-xl border border-cream-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-cream-200 pb-2">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gold-500" />
              <h2 className="font-serif text-base font-bold text-forest-900">
                2. Official Corporate Bank Account (Direct Transfer)
              </h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-forest-800">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="rounded text-forest-700"
              />
              <span>Verified & Enabled for Customers</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Bank Institution Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Commercial Bank of Ceylon / HNB"
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Aura Luxe Home (Pvt) Ltd"
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter corporate account number"
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Branch Location
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Colombo Ward Place Prestige Branch"
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-md bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-cream-50 font-serif font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-gold-300" />
            {saving ? 'Saving Settings...' : 'Save Store Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
