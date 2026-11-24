import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import connectToDatabase from '@/lib/db/mongodb';
import Setting from '@/models/Setting';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.role !== 'super_admin' && session.role !== 'store_manager')) {
      return NextResponse.json({ error: 'Unauthorized admin action' }, { status: 403 });
    }

    const body = await req.json();
    const { shipping, bank, paymentMethods, social, contact, storeInfo } = body;

    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      await connectToDatabase();

      if (shipping) {
        await Setting.findOneAndUpdate(
          { key: 'shipping_rates' },
          { key: 'shipping_rates', value: shipping, group: 'shipping' },
          { upsert: true, new: true }
        );
      }

      if (bank) {
        await Setting.findOneAndUpdate(
          { key: 'corporate_bank' },
          { key: 'corporate_bank', value: bank, group: 'payment' },
          { upsert: true, new: true }
        );
      }

      if (paymentMethods) {
        await Setting.findOneAndUpdate(
          { key: 'payment_methods' },
          { key: 'payment_methods', value: paymentMethods, group: 'payment' },
          { upsert: true, new: true }
        );
      }

      if (social) {
        await Setting.findOneAndUpdate(
          { key: 'store_social' },
          { key: 'store_social', value: social, group: 'general' },
          { upsert: true, new: true }
        );
      }

      if (contact) {
        await Setting.findOneAndUpdate(
          { key: 'store_contact' },
          { key: 'store_contact', value: contact, group: 'contact' },
          { upsert: true, new: true }
        );
      }

      if (storeInfo) {
        await Setting.findOneAndUpdate(
          { key: 'store_information' },
          { key: 'store_information', value: storeInfo, group: 'general' },
          { upsert: true, new: true }
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Settings successfully persisted' });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

