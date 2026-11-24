import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Setting from '@/models/Setting';
import { FREE_SHIPPING_THRESHOLD_LKR } from '@/lib/constants/districts';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settingsMap: Record<string, any> = {};

    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      try {
        await connectToDatabase();
        const docs = await Setting.find({});
        for (const s of docs) {
          settingsMap[s.key] = s.value;
        }
      } catch (err) {
        console.warn('DB settings read error:', err);
      }
    }

    const shipping = settingsMap['shipping_rates'] || {
      colomboFee: 450,
      greaterColomboFee: 600,
      outstationFee: 850,
      freeThreshold: FREE_SHIPPING_THRESHOLD_LKR,
    };

    const bank = settingsMap['corporate_bank'] || {
      bankName: 'Commercial Bank of Ceylon',
      accountName: 'Aura Luxe Home (Pvt) Ltd',
      accountNumber: '1000 8492 0184',
      branch: 'Colombo Ward Place Prestige Branch',
      isVerified: true,
      swiftCode: 'CCEYLKX',
    };

    const paymentMethods = settingsMap['payment_methods'] || {
      cod: { enabled: true, title: 'Cash on Delivery (Islandwide)' },
      card: { enabled: true, title: 'Credit / Debit Card (Visa, MasterCard, Amex)' },
      bankTransfer: { enabled: true, title: 'Direct Corporate Bank Transfer' },
    };

    const baseContact = settingsMap['store_contact'] || {};
    const contact = {
      email: baseContact.email || 'concierge@auraluxe.lk',
      showroom: baseContact.showroom || 'Colombo, Sri Lanka (Showroom visits by appointment)',
      businessHours:
        baseContact.businessHours || 'Monday – Saturday: 9:00 AM – 6:00 PM (Sri Lanka Time)',
      hotline: baseContact.hotline || '',
      whatsapp: baseContact.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    };

    const baseSocial = settingsMap['store_social'] || {};
    const social = {
      facebook: baseSocial.facebook || process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '',
      instagram: baseSocial.instagram || process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '',
      tiktok: baseSocial.tiktok || process.env.NEXT_PUBLIC_SOCIAL_TIKTOK || '',
    };

    return NextResponse.json({
      shipping,
      bank,
      paymentMethods,
      contact,
      social,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

