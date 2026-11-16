import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import connectToDatabase from '@/lib/db/mongodb';
import Order from '@/models/Order';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      try {
        await connectToDatabase();

        const queryConditions: any[] = [];
        if (session.userId && mongoose.Types.ObjectId.isValid(session.userId)) {
          queryConditions.push({ userId: new mongoose.Types.ObjectId(session.userId) });
        }
        if (session.email) {
          queryConditions.push({ 'customerInfo.email': session.email.toLowerCase() });
        }

        const orders = await Order.find({ $or: queryConditions }).sort({ createdAt: -1 });

        if (orders && orders.length > 0) {
          return NextResponse.json({
            orders: orders.map((ord) => ({
              id: ord._id.toString(),
              orderNumber: ord.orderNumber,
              customer: ord.customerInfo?.fullName || 'Customer',
              phone: ord.customerInfo?.phone || '',
              email: ord.customerInfo?.email || '',
              district: ord.shippingAddress?.district || 'Colombo',
              city: ord.shippingAddress?.city || '',
              address: `${ord.shippingAddress?.addressLine1 || ''}${ord.shippingAddress?.addressLine2 ? ', ' + ord.shippingAddress.addressLine2 : ''}`,
              items: ord.items.map((i) => ({
                title: i.title,
                variant: i.variantSku || 'Standard',
                price: i.unitPrice,
                quantity: i.quantity,
                image: i.image || '/assets/logo.png',
              })),
              amount: ord.pricing?.totalAmount || 0,
              subtotal: ord.pricing?.subtotal || 0,
              discountAmount: ord.pricing?.discountAmount || 0,
              shippingFee: ord.pricing?.shippingFee || 0,
              paymentMethod: ord.paymentMethod,
              paymentStatus: ord.paymentStatus,
              orderStatus: ord.orderStatus,
              bankSlip: ord.bankDepositSlip?.url || null,
              courier: ord.courier || { name: 'Prompt Xpress (White-Glove)', trackingNumber: ord.orderNumber },
              date: ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recent',
            })),
          });
        }
      } catch (dbErr) {
        console.warn('MongoDB orders lookup notice, using client fallback:', dbErr);
      }
    }

    // Demo fallback order history for client
    return NextResponse.json({
      orders: [
        {
          id: 'demo-ALH-2026-8492',
          orderNumber: 'ALH-2026-8492',
          customer: session.fullName || 'Ruwan Jayawardena',
          phone: '+94 77 123 4567',
          email: session.email,
          district: 'Colombo',
          city: 'Colombo 07',
          address: 'No. 14, Ward Place',
          items: [
            {
              title: 'Ceylon Teak Sculptural Armchair',
              variant: 'Ivory Boucle / Natural Teak',
              price: 84500,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
            },
          ],
          amount: 84500,
          subtotal: 84500,
          discountAmount: 0,
          shippingFee: 0,
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          orderStatus: 'processing',
          courier: { name: 'Prompt Xpress (White-Glove)', trackingNumber: 'PX-8492' },
          date: 'November 9, 2026',
        },
      ],
    });
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
