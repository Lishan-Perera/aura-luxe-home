'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Truck,
  Building,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Mail,
  Phone,
  Clock,
  MapPin,
} from 'lucide-react';
import { formatLKR } from '@/lib/utils';

export default function AdminSettingsPage() {
  // Shipping
  const [colomboFee, setColomboFee] = useState('450');
  const [greaterColomboFee, setGreaterColomboFee] = useState('600');
  const [outstationFee, setOutstationFee] = useState('850');
  const [freeThreshold, setFreeThreshold] = useState('25000');

  // Banking
  const [bankName, setBankName] = useState('Commercial Bank of Ceylon');
  const [accountName, setAccountName] = useState('Aura Luxe Home (Pvt) Ltd');
  const [accountNumber, setAccountNumber] = useState('1000 8492 0184');
  const [branch, setBranch] = useState('Colombo Ward Place Prestige Branch');
  const [isVerified, setIsVerified] = useState(true);

  // Business Contact & Concierge
  const [contactEmail, setContactEmail] = useState('concierge@auraluxe.lk');
  const [whatsapp, setWhatsapp] = useState('');
  const [hotline, setHotline] = useState('');
  const [showroom, setShowroom] = useState('Colombo, Sri Lanka (Showroom visits by appointment)');
  const [businessHours, setBusinessHours] = useState('Monday – Saturday: 9:00 AM – 6:00 PM (Sri Lanka Time)');

  // Social Channels
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');

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
        if (data?.contact) {
          setContactEmail(data.contact.email || 'concierge@auraluxe.lk');
          setWhatsapp(data.contact.whatsapp || '');
          setHotline(data.contact.hotline || '');
          setShowroom(data.contact.showroom || 'Colombo, Sri Lanka (Showroom visits by appointment)');
          setBusinessHours(data.contact.businessHours || 'Monday – Saturday: 9:00 AM – 6:00 PM (Sri Lanka Time)');
        }
        if (data?.social) {
          setFacebook(data.social.facebook || '');
          setInstagram(data.social.instagram || '');
          setTiktok(data.social.tiktok || '');
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
          contact: {
            email: contactEmail.trim(),
            whatsapp: whatsapp.trim(),
            hotline: hotline.trim(),
            showroom: showroom.trim(),
            businessHours: businessHours.trim(),
          },
          social: {
            facebook: facebook.trim(),
            instagram: instagram.trim(),
            tiktok: tiktok.trim(),
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
          Store Logistics, Banking &amp; Concierge Settings
        </h1>
        <p className="text-xs text-forest-600 mt-1">
          Configure islandwide delivery rates across Sri Lanka’s 25 districts, official corporate banking, business contact channels, and social media.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All store settings saved successfully and live on storefront.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Sri Lanka District Delivery Rates */}
        <div className="bg-white rounded-xl border border-cream-300 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <Truck className="w-5 h-5 text-forest-700" />
            <div>
              <h2 className="font-serif text-base font-bold text-forest-900">
                Sri Lanka Islandwide White-Glove Shipping
              </h2>
              <p className="text-xs text-forest-500">
                Standard delivery tariffs applied across Colombo, Western Province, and Outstation districts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Colombo Metro Delivery Fee (LKR)
              </label>
              <input
                type="number"
                value={colomboFee}
                onChange={(e) => setColomboFee(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-medium"
              />
              <span className="text-[10px] text-forest-500 mt-1 block">
                Standard delivery rate for Colombo 01 through Colombo 15.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Greater Colombo &amp; Western Suburbs (LKR)
              </label>
              <input
                type="number"
                value={greaterColomboFee}
                onChange={(e) => setGreaterColomboFee(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-medium"
              />
              <span className="text-[10px] text-forest-500 mt-1 block">
                Gampaha and Kalutara districts.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Outstation Districts Delivery Fee (LKR)
              </label>
              <input
                type="number"
                value={outstationFee}
                onChange={(e) => setOutstationFee(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-medium"
              />
              <span className="text-[10px] text-forest-500 mt-1 block">
                All remaining 22 administrative districts islandwide.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Complimentary Delivery Threshold (LKR)
              </label>
              <input
                type="number"
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-medium"
              />
              <span className="text-[10px] text-forest-500 mt-1 block">
                Orders equal to or exceeding this subtotal receive free white-glove delivery.
              </span>
            </div>
          </div>
        </div>

        {/* 2. Official Corporate Banking Information */}
        <div className="bg-white rounded-xl border border-cream-300 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-cream-200 pb-3">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-forest-700" />
              <div>
                <h2 className="font-serif text-base font-bold text-forest-900">
                  Official Corporate Bank Account (Deposit Slips)
                </h2>
                <p className="text-xs text-forest-500">
                  Verified bank details displayed to customers choosing Direct Bank Transfer at checkout.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Account</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Banking Institution
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Account Beneficiary Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-medium"
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
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-mono font-medium"
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
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
              />
            </div>
          </div>
        </div>

        {/* 3. Business Concierge & Contact Settings */}
        <div className="bg-white rounded-xl border border-cream-300 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <Mail className="w-5 h-5 text-forest-700" />
            <div>
              <h2 className="font-serif text-base font-bold text-forest-900">
                Business Concierge &amp; Customer Care Settings
              </h2>
              <p className="text-xs text-forest-500">
                Displayed across Contact page, Footer, and customer communication emails.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Concierge Email Address
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="concierge@auraluxe.lk"
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Official WhatsApp Business Number
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="94770000000 (International format without + or spaces)"
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-mono"
              />
              <span className="text-[10px] text-forest-500 mt-1 block">
                Opens wa.me/WHATSAPP_NUMBER on Contact page when configured.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Direct Hotline / Phone (Optional)
              </label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                placeholder="+94 11 234 5678"
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Showroom Location &amp; Hours
              </label>
              <input
                type="text"
                value={showroom}
                onChange={(e) => setShowroom(e.target.value)}
                placeholder="Colombo, Sri Lanka (Showroom visits by appointment)"
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Business Operating Hours
              </label>
              <input
                type="text"
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                placeholder="Monday – Saturday: 9:00 AM – 6:00 PM (Sri Lanka Time)"
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
              />
            </div>
          </div>
        </div>

        {/* 4. Official Social Media Channels (Follow Us) */}
        <div className="bg-white rounded-xl border border-cream-300 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <Share2 className="w-5 h-5 text-forest-700" />
            <div>
              <h2 className="font-serif text-base font-bold text-forest-900">
                Official Social Media Channels (Footer &quot;Follow Us&quot;)
              </h2>
              <p className="text-xs text-forest-500">
                Configure verified profile URLs for Facebook, Instagram, and TikTok. Icons remain safely disabled until valid URLs are provided.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Facebook Page URL
              </label>
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/auraluxehome"
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                Instagram Profile URL
              </label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/auraluxehome"
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-700 block mb-1">
                TikTok Profile URL
              </label>
              <input
                type="url"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="https://tiktok.com/@auraluxehome"
                className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 rounded-md bg-[#123C2F] hover:bg-[#0D2E24] disabled:opacity-50 text-white font-serif font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-[#E9EDE7]" />
            {saving ? 'Saving Settings...' : 'Save All Store Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
