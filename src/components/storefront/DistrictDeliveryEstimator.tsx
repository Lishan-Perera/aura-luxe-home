'use client';

import { useState } from 'react';
import { Truck, MapPin, Clock, Banknote, ShieldCheck } from 'lucide-react';
import { SRI_LANKA_DISTRICTS, getDeliveryFee, FREE_SHIPPING_THRESHOLD_LKR } from '@/lib/constants/districts';
import { formatLKR } from '@/lib/utils';

interface DistrictDeliveryEstimatorProps {
  productPrice: number;
}

export default function DistrictDeliveryEstimator({ productPrice }: DistrictDeliveryEstimatorProps) {
  const [selectedDistrict, setSelectedDistrict] = useState('Colombo');

  const { fee, isFree, eta } = getDeliveryFee(selectedDistrict, productPrice);
  const districtObj = SRI_LANKA_DISTRICTS.find((d) => d.name === selectedDistrict) || SRI_LANKA_DISTRICTS[0];

  return (
    <div className="rounded-lg border border-gold-300/50 bg-cream-50 p-4 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between border-b border-cream-200 pb-2.5">
        <div className="flex items-center gap-2 text-forest-900 font-serif font-semibold text-sm">
          <Truck className="w-4 h-4 text-gold-500" />
          <span>Sri Lanka Islandwide Delivery Options</span>
        </div>
        <span className="text-[11px] font-semibold text-forest-700 bg-cream-200 px-2 py-0.5 rounded border border-cream-300">
          25 Districts Covered
        </span>
      </div>

      {/* District Dropdown Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-forest-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-forest-500" />
          Select Destination District:
        </label>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="w-full text-xs bg-white border border-cream-300 rounded-md py-2 px-3 text-forest-900 font-medium focus:outline-none focus:ring-1 focus:ring-forest-600 focus:border-forest-600 shadow-sm"
        >
          {SRI_LANKA_DISTRICTS.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name} ({d.province} Province)
            </option>
          ))}
        </select>
      </div>

      {/* Estimated Shipping Fee & Timeline Result */}
      <div className="bg-white rounded-md p-3 border border-cream-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-forest-600">Standard Delivery Fee:</span>
          {isFree ? (
            <span className="font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
              FREE (Qualifies over {formatLKR(FREE_SHIPPING_THRESHOLD_LKR, true)})
            </span>
          ) : (
            <span className="font-bold text-forest-900">
              {formatLKR(fee)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-forest-600">
          <Clock className="w-3.5 h-3.5 text-gold-500 shrink-0" />
          <span>Estimated Timeline: <strong className="text-forest-800">{eta}</strong></span>
        </div>

        <div className="flex items-center gap-2 text-xs text-forest-600">
          <Banknote className="w-3.5 h-3.5 text-gold-500 shrink-0" />
          <span>Cash on Delivery (COD): <strong className="text-forest-700">Available in {selectedDistrict}</strong></span>
        </div>
      </div>

      {/* Trust Guarantee */}
      <div className="flex items-center gap-2 text-[11px] text-forest-600/80 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-gold-500 shrink-0" />
        <span>Carefully crated and insured against transit damage across Sri Lanka.</span>
      </div>
    </div>
  );
}

