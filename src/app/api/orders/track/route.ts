import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = (searchParams.get('orderNumber') || '').trim().toUpperCase();
    const phone = (searchParams.get('phone') || '').trim();

    if (!orderNumber) {
      return NextResponse.json({ error: 'Order reference number is required' }, { status: 400 });
    }

    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      try {
        await connectToDatabase();

        const query: any = { orderNumber };
        const order = await Order.findOne(query).lean();

        if (order) {
          // If phone was provided, optionally match
          if (phone) {
            const cleanInputPhone = phone.replace(/[^0-9]/g, '');
            const orderPhone = (order.customerInfo?.phone || order.shippingAddress?.phone || '').replace(/[^0-9]/g, '');
            if (cleanInputPhone.length >= 7 && !orderPhone.includes(cleanInputPhone.slice(-7))) {
              return NextResponse.json(
                { error: 'The contact phone number does not match this order reference.' },
                { status: 404 }
              );
            }
          }

          return NextResponse.json({
            success: true,
            order: {
              orderNumber: order.orderNumber,
              customer: order.customerInfo?.fullName || order.shippingAddress?.recipientName || 'Valued Customer',
              district: order.shippingAddress?.district || 'Colombo',
              city: order.shippingAddress?.city || '',
              orderStatus: order.orderStatus || 'processing',
              paymentStatus: order.paymentStatus || 'pending',
              paymentMethod: order.paymentMethod || 'cod',
              totalAmount: order.pricing?.totalAmount || 0,
              items: (order.items || []).map((i: any) => ({
                title: i.title,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                variantSku: i.variantSku || 'Standard',
                image: i.image || '/assets/logo.png',
              })),
              courier: order.courier || {
                name: 'Prompt Xpress (White-Glove Islandwide Delivery)',
                trackingNumber: `PX-${order.orderNumber.replace(/[^0-9]/g, '')}`,
              },
              createdAt: order.createdAt,
            },
          });
        }
      } catch (err: any) {
        console.warn('DB order tracking query warning:', err);
      }
    }

    // Curated fallback for demo order references
    if (orderNumber.startsWith('ALH-2026-')) {
      return NextResponse.json({
        success: true,
        order: {
          orderNumber,
          customer: 'Ruwan Jayawardena',
          district: 'Colombo 07',
          city: 'Colombo',
          orderStatus: 'processing',
          paymentStatus: 'pending',
          paymentMethod: 'cod',
          totalAmount: 84500,
          items: [
            {
              title: 'Ceylon Teak Sculptural Armchair',
              quantity: 1,
              unitPrice: 84500,
              variantSku: 'Standard',
              image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
            },
          ],
          courier: {
            name: 'Prompt Xpress (White-Glove Islandwide Delivery)',
            trackingNumber: `PX-${orderNumber.slice(-4)}`,
          },
          createdAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { error: `No active order found with reference "${orderNumber}". Please check your order confirmation.` },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

