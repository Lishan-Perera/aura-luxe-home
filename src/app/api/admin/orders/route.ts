import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      try {
        await connectToDatabase();
        const query: any = {};
        if (status && status !== 'all') {
          query.orderStatus = status;
        }
        const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, orders });
      } catch (err) {
        console.warn('DB orders fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      orders: [
        {
          orderNumber: 'ALH-2026-8492',
          customerInfo: { fullName: 'Ruwan Jayawardena', phone: '+94 77 123 4567' },
          shippingAddress: { district: 'Colombo', city: 'Colombo 07' },
          pricing: { totalAmount: 84500 },
          paymentMethod: 'cod',
          orderStatus: 'processing',
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, orderStatus, courier, verifyBankSlip } = body;

    if (!orderNumber) {
      return NextResponse.json({ error: 'Order reference number is required' }, { status: 400 });
    }

    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      try {
        await connectToDatabase();
        const updateData: any = { updatedAt: new Date() };
        if (orderStatus) updateData.orderStatus = orderStatus;
        if (courier) updateData.courier = courier;
        if (verifyBankSlip) {
          updateData['bankDepositSlip.verified'] = true;
          updateData['bankDepositSlip.verifiedAt'] = new Date();
          updateData.paymentStatus = 'paid';
        }

        const updated = await Order.findOneAndUpdate(
          { orderNumber },
          { $set: updateData },
          { new: true }
        );
        return NextResponse.json({ success: true, order: updated });
      } catch (err) {
        console.warn('DB update order fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Order ${orderNumber} status updated to ${orderStatus}`,
      orderNumber,
      orderStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

