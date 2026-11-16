import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Inventory from '@/models/Inventory';
import Address from '@/models/Address';
import User from '@/models/User';
import { getServerSession } from '@/lib/auth/session';
import { getDeliveryFee } from '@/lib/constants/districts';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Customer Authentication Guard
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Customer authentication is required to place an order. Please sign in to your Aura Luxe account.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      customerInfo,
      shippingAddress,
      billingAddress,
      items,
      paymentMethod,
      bankDepositSlip,
      orderNotes,
      promoCode,
      saveAddress,
    } = body;

    // 2. Validate Customer Contact
    const recipientName = (shippingAddress?.recipientName || customerInfo?.fullName || session.fullName || '').trim();
    const phone = (shippingAddress?.phone || customerInfo?.phone || '').trim();
    const email = (customerInfo?.email || session.email || '').toLowerCase().trim();

    if (!recipientName || !phone) {
      return NextResponse.json({ error: 'Recipient name and Sri Lankan contact phone are required.' }, { status: 400 });
    }

    // 3. Validate Shipping Address
    if (!shippingAddress || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.district) {
      return NextResponse.json({ error: 'Complete Sri Lankan delivery address (street, city, district) is required.' }, { status: 400 });
    }

    // 4. Validate Items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Shopping bag must contain at least one item.' }, { status: 400 });
    }

    // 5. Calculate Subtotal & Discount
    const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    
    let discountAmount = 0;
    if (promoCode) {
      const upperCode = promoCode.trim().toUpperCase();
      if (upperCode === 'AURA10') {
        discountAmount = Math.round((subtotal * 10) / 100);
      } else if (upperCode === 'LUXE25' && subtotal >= 100000) {
        discountAmount = 25000;
      } else if (upperCode === 'WELCOME5') {
        discountAmount = Math.round((subtotal * 5) / 100);
      } else if (upperCode === 'COLOMBOVIP' && subtotal >= 30000) {
        discountAmount = 5000;
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const { fee: shippingFee, eta } = getDeliveryFee(shippingAddress.district, discountedSubtotal);
    const totalAmount = discountedSubtotal + shippingFee;

    // 6. Generate Unique Order Number (ALH-2026-XXXX)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ALH-2026-${randomSuffix}`;

    const orderData: any = {
      orderNumber,
      userId: mongoose.Types.ObjectId.isValid(session.userId) ? new mongoose.Types.ObjectId(session.userId) : undefined,
      customerInfo: {
        fullName: recipientName,
        email,
        phone,
      },
      shippingAddress: {
        recipientName,
        phone,
        addressLine1: shippingAddress.addressLine1.trim(),
        addressLine2: (shippingAddress.addressLine2 || '').trim(),
        city: shippingAddress.city.trim(),
        district: shippingAddress.district.trim(),
        postalCode: (shippingAddress.postalCode || '').trim(),
      },
      billingAddress: billingAddress || undefined,
      items: items.map((i: any) => ({
        productId: mongoose.Types.ObjectId.isValid(i.productId) ? new mongoose.Types.ObjectId(i.productId) : new mongoose.Types.ObjectId(),
        variantSku: i.variantSku || '',
        title: i.title,
        unitPrice: Number(i.price),
        quantity: Number(i.quantity) || 1,
        totalPrice: Number(i.price) * (Number(i.quantity) || 1),
        image: i.image || '',
      })),
      pricing: {
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        currency: 'LKR',
      },
      paymentMethod: paymentMethod || 'cod',
      // PCI-DSS & Security Compliance: Payment status MUST remain 'pending' until verified gateway confirmation
      paymentStatus: 'pending',
      orderStatus: 'pending',
      bankDepositSlip: bankDepositSlip || undefined,
      courier: {
        name: 'Prompt Xpress (White-Glove Islandwide Delivery)',
        trackingNumber: `PX-${randomSuffix}`,
        estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      notes: orderNotes || '',
    };

    // 7. Persist to MongoDB
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      try {
        await connectToDatabase();

        // Save order
        const createdOrder = await Order.create(orderData);

        // Decrement Inventory / Stock
        for (const item of items) {
          if (mongoose.Types.ObjectId.isValid(item.productId)) {
            try {
              if (item.variantSku) {
                await Product.updateOne(
                  { _id: item.productId, 'variants.sku': item.variantSku },
                  { $inc: { 'variants.$.stockQuantity': -Number(item.quantity) } }
                );
                await Inventory.updateOne(
                  { sku: item.variantSku },
                  { $inc: { stockQuantity: -Number(item.quantity), reservedQuantity: Number(item.quantity) } }
                );
              } else {
                await Inventory.updateOne(
                  { productId: item.productId },
                  { $inc: { stockQuantity: -Number(item.quantity) } }
                );
              }
            } catch (stockErr) {
              console.warn('Inventory adjustment non-fatal notice:', stockErr);
            }
          }
        }

        // Optionally save address to user's saved addresses
        if (saveAddress && session.userId && mongoose.Types.ObjectId.isValid(session.userId)) {
          try {
            const existingAddress = await Address.findOne({
              userId: session.userId,
              addressLine1: shippingAddress.addressLine1.trim(),
              city: shippingAddress.city.trim(),
            });

            if (!existingAddress) {
              await Address.create({
                userId: new mongoose.Types.ObjectId(session.userId),
                recipientName,
                phone,
                addressLine1: shippingAddress.addressLine1.trim(),
                addressLine2: (shippingAddress.addressLine2 || '').trim(),
                city: shippingAddress.city.trim(),
                district: shippingAddress.district.trim(),
                postalCode: (shippingAddress.postalCode || '').trim(),
                isDefaultShipping: true,
                isDefaultBilling: true,
              });
            }
          } catch (addrErr) {
            console.warn('Address persistence non-fatal notice:', addrErr);
          }
        }

        return NextResponse.json({
          success: true,
          orderNumber,
          orderId: createdOrder._id.toString(),
          totalAmount,
          paymentStatus: 'pending',
          deliveryEta: eta,
        });
      } catch (dbErr: any) {
        console.warn('MongoDB order insert fell back to offline confirmation:', dbErr);
      }
    }

    // Demo/Development fallback response
    return NextResponse.json({
      success: true,
      orderNumber,
      orderId: `mock-${orderNumber}`,
      totalAmount,
      paymentStatus: 'pending',
      deliveryEta: eta,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
