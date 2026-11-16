export interface DistrictConfig {
  name: string;
  province: string;
  zone: 'colombo' | 'greater_colombo' | 'outstation';
  baseDeliveryFee: number; // In LKR
  deliveryDaysText: string;
  codAvailable: boolean;
}

export const SRI_LANKA_DISTRICTS: DistrictConfig[] = [
  // Western Province
  { name: 'Colombo', province: 'Western', zone: 'colombo', baseDeliveryFee: 450, deliveryDaysText: '1–2 business days (Same-Day / Next-Day Delivery available)', codAvailable: true },
  { name: 'Gampaha', province: 'Western', zone: 'greater_colombo', baseDeliveryFee: 600, deliveryDaysText: '1–2 business days', codAvailable: true },
  { name: 'Kalutara', province: 'Western', zone: 'greater_colombo', baseDeliveryFee: 650, deliveryDaysText: '2–3 business days', codAvailable: true },

  // Central Province
  { name: 'Kandy', province: 'Central', zone: 'outstation', baseDeliveryFee: 850, deliveryDaysText: '2–3 business days', codAvailable: true },
  { name: 'Matale', province: 'Central', zone: 'outstation', baseDeliveryFee: 850, deliveryDaysText: '3–4 business days', codAvailable: true },
  { name: 'Nuwara Eliya', province: 'Central', zone: 'outstation', baseDeliveryFee: 900, deliveryDaysText: '3–4 business days', codAvailable: true },

  // Southern Province
  { name: 'Galle', province: 'Southern', zone: 'outstation', baseDeliveryFee: 850, deliveryDaysText: '2–3 business days', codAvailable: true },
  { name: 'Matara', province: 'Southern', zone: 'outstation', baseDeliveryFee: 850, deliveryDaysText: '2–4 business days', codAvailable: true },
  { name: 'Hambantota', province: 'Southern', zone: 'outstation', baseDeliveryFee: 900, deliveryDaysText: '3–4 business days', codAvailable: true },

  // North Western Province
  { name: 'Kurunegala', province: 'North Western', zone: 'outstation', baseDeliveryFee: 850, deliveryDaysText: '2–3 business days', codAvailable: true },
  { name: 'Puttalam', province: 'North Western', zone: 'outstation', baseDeliveryFee: 900, deliveryDaysText: '3–4 business days', codAvailable: true },

  // North Central Province
  { name: 'Anuradhapura', province: 'North Central', zone: 'outstation', baseDeliveryFee: 900, deliveryDaysText: '3–4 business days', codAvailable: true },
  { name: 'Polonnaruwa', province: 'North Central', zone: 'outstation', baseDeliveryFee: 900, deliveryDaysText: '3–4 business days', codAvailable: true },

  // Uva Province
  { name: 'Badulla', province: 'Uva', zone: 'outstation', baseDeliveryFee: 950, deliveryDaysText: '3–5 business days', codAvailable: true },
  { name: 'Monaragala', province: 'Uva', zone: 'outstation', baseDeliveryFee: 950, deliveryDaysText: '3–5 business days', codAvailable: true },

  // Sabaragamuwa Province
  { name: 'Ratnapura', province: 'Sabaragamuwa', zone: 'outstation', baseDeliveryFee: 850, deliveryDaysText: '2–4 business days', codAvailable: true },
  { name: 'Kegalle', province: 'Sabaragamuwa', zone: 'outstation', baseDeliveryFee: 800, deliveryDaysText: '2–3 business days', codAvailable: true },

  // Northern Province
  { name: 'Jaffna', province: 'Northern', zone: 'outstation', baseDeliveryFee: 950, deliveryDaysText: '3–5 business days', codAvailable: true },
  { name: 'Kilinochchi', province: 'Northern', zone: 'outstation', baseDeliveryFee: 950, deliveryDaysText: '4–5 business days', codAvailable: true },
  { name: 'Mannar', province: 'Northern', zone: 'outstation', baseDeliveryFee: 950, deliveryDaysText: '4–5 business days', codAvailable: true },
  { name: 'Vavuniya', province: 'Northern', zone: 'outstation', baseDeliveryFee: 900, deliveryDaysText: '3–4 business days', codAvailable: true },
  { name: 'Mullaitivu', province: 'Northern', zone: 'outstation', baseDeliveryFee: 950, deliveryDaysText: '4–5 business days', codAvailable: true },

  // Eastern Province
  { name: 'Batticaloa', province: 'Eastern', zone: 'outstation', baseDeliveryFee: 950, deliveryDaysText: '3–5 business days', codAvailable: true },
  { name: 'Ampara', province: 'Eastern', zone: 'outstation', baseDeliveryFee: 950, deliveryDaysText: '3–5 business days', codAvailable: true },
  { name: 'Trincomalee', province: 'Eastern', zone: 'outstation', baseDeliveryFee: 900, deliveryDaysText: '3–4 business days', codAvailable: true },
];

export const FREE_SHIPPING_THRESHOLD_LKR = 25000;

export function getDeliveryFee(districtName: string, subtotalLKR: number): { fee: number; isFree: boolean; eta: string } {
  const district = SRI_LANKA_DISTRICTS.find(
    (d) => d.name.toLowerCase() === districtName.toLowerCase()
  ) || SRI_LANKA_DISTRICTS[0];

  if (subtotalLKR >= FREE_SHIPPING_THRESHOLD_LKR) {
    return { fee: 0, isFree: true, eta: district.deliveryDaysText };
  }

  return { fee: district.baseDeliveryFee, isFree: false, eta: district.deliveryDaysText };
}

