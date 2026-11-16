import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import connectToDatabase from '@/lib/db/mongodb';
import Address from '@/models/Address';
import User from '@/models/User';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('mock:mock')) {
      return NextResponse.json({ addresses: [] });
    }

    await connectToDatabase();

    let userObjectId = null;
    if (mongoose.Types.ObjectId.isValid(session.userId)) {
      userObjectId = session.userId;
    } else {
      const u = await User.findOne({ email: session.email });
      if (u) userObjectId = u._id;
    }

    if (!userObjectId) {
      return NextResponse.json({ addresses: [] });
    }

    const addresses = await Address.find({ userId: userObjectId }).sort({ isDefaultShipping: -1, createdAt: -1 });

    return NextResponse.json({
      addresses: addresses.map((addr) => ({
        id: addr._id.toString(),
        recipientName: addr.recipientName,
        phone: addr.phone,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 || '',
        city: addr.city,
        district: addr.district,
        postalCode: addr.postalCode || '',
        isDefaultShipping: Boolean(addr.isDefaultShipping),
        isDefaultBilling: Boolean(addr.isDefaultBilling),
      })),
    });
  } catch (error: any) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { recipientName, phone, addressLine1, addressLine2, city, district, postalCode, isDefaultShipping } = body;

    if (!recipientName || !phone || !addressLine1 || !city || !district) {
      return NextResponse.json({ error: 'Recipient name, phone, address, city, and district are required' }, { status: 400 });
    }

    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('mock:mock')) {
      return NextResponse.json({
        success: true,
        address: {
          id: `addr-${Date.now()}`,
          recipientName,
          phone,
          addressLine1,
          addressLine2: addressLine2 || '',
          city,
          district,
          postalCode: postalCode || '',
          isDefaultShipping: Boolean(isDefaultShipping),
        },
      });
    }

    await connectToDatabase();

    let userObjectId: any = null;
    if (mongoose.Types.ObjectId.isValid(session.userId)) {
      userObjectId = session.userId;
    } else {
      let u = await User.findOne({ email: session.email });
      if (!u) {
        u = await User.create({
          fullName: session.fullName,
          email: session.email,
          role: 'customer',
          passwordHash: 'oauth_or_session_user',
        });
      }
      userObjectId = u._id;
    }

    // If marked default, unset other defaults
    if (isDefaultShipping) {
      await Address.updateMany({ userId: userObjectId }, { $set: { isDefaultShipping: false } });
    }

    const newAddress = await Address.create({
      userId: userObjectId,
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: (addressLine2 || '').trim(),
      city: city.trim(),
      district: district.trim(),
      postalCode: (postalCode || '').trim(),
      isDefaultShipping: Boolean(isDefaultShipping),
      isDefaultBilling: Boolean(isDefaultShipping),
    });

    return NextResponse.json({
      success: true,
      address: {
        id: newAddress._id.toString(),
        recipientName: newAddress.recipientName,
        phone: newAddress.phone,
        addressLine1: newAddress.addressLine1,
        addressLine2: newAddress.addressLine2,
        city: newAddress.city,
        district: newAddress.district,
        postalCode: newAddress.postalCode,
        isDefaultShipping: newAddress.isDefaultShipping,
      },
    });
  } catch (error: any) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, recipientName, phone, addressLine1, addressLine2, city, district, postalCode, isDefaultShipping } = body;

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('mock:mock')) {
      return NextResponse.json({ success: true });
    }

    await connectToDatabase();

    if (isDefaultShipping) {
      const existing = await Address.findById(id);
      if (existing) {
        await Address.updateMany({ userId: existing.userId }, { $set: { isDefaultShipping: false } });
      }
    }

    const updated = await Address.findByIdAndUpdate(
      id,
      {
        ...(recipientName && { recipientName: recipientName.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(addressLine1 && { addressLine1: addressLine1.trim() }),
        ...(addressLine2 !== undefined && { addressLine2: addressLine2.trim() }),
        ...(city && { city: city.trim() }),
        ...(district && { district: district.trim() }),
        ...(postalCode !== undefined && { postalCode: postalCode.trim() }),
        ...(isDefaultShipping !== undefined && { isDefaultShipping }),
      },
      { new: true }
    );

    return NextResponse.json({ success: true, address: updated });
  } catch (error: any) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      await connectToDatabase();
      await Address.findByIdAndDelete(id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

