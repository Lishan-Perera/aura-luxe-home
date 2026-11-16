import { NextRequest, NextResponse } from 'next/server';

interface PromoRule {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSpend?: number;
  description: string;
}

const PROMO_CODES: Record<string, PromoRule> = {
  AURA10: {
    code: 'AURA10',
    type: 'percentage',
    value: 10,
    description: '10% Aura Luxe Welcome Privilege',
  },
  LUXE25: {
    code: 'LUXE25',
    type: 'fixed',
    value: 25000,
    minSpend: 100000,
    description: 'LKR 25,000 Heritage Suite Discount (Min. LKR 100,000)',
  },
  WELCOME5: {
    code: 'WELCOME5',
    type: 'percentage',
    value: 5,
    description: '5% Concierge Introductory Voucher',
  },
  COLOMBOVIP: {
    code: 'COLOMBOVIP',
    type: 'fixed',
    value: 5000,
    minSpend: 30000,
    description: 'LKR 5,000 Western Province VIP Voucher (Min. LKR 30,000)',
  },
};

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Please enter a valid voucher code' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const rule = PROMO_CODES[cleanCode];

    if (!rule) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid voucher code. Try "AURA10" for 10% privilege discount.',
      }, { status: 400 });
    }

    const cartSubtotal = Number(subtotal) || 0;

    if (rule.minSpend && cartSubtotal < rule.minSpend) {
      return NextResponse.json({
        valid: false,
        error: `Code ${cleanCode} requires a minimum order subtotal of LKR ${rule.minSpend.toLocaleString()}.`,
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (rule.type === 'percentage') {
      discountAmount = Math.round((cartSubtotal * rule.value) / 100);
    } else {
      discountAmount = Math.min(rule.value, cartSubtotal);
    }

    const finalSubtotal = Math.max(0, cartSubtotal - discountAmount);

    return NextResponse.json({
      valid: true,
      code: rule.code,
      type: rule.type,
      discountAmount,
      discountPercent: rule.type === 'percentage' ? rule.value : Math.round((discountAmount / cartSubtotal) * 100),
      description: rule.description,
      finalSubtotal,
    });
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

