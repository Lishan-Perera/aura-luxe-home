import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import connectToDatabase from '@/lib/db/mongodb';
import User from '@/models/User';
import Address from '@/models/Address';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ user: null, addresses: [] }, { status: 200 });
    }

    let userDoc: any = null;
    let addresses: any[] = [];

    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      try {
        await connectToDatabase();
        if (session.userId && !session.userId.startsWith('user-') && !session.userId.startsWith('admin-')) {
          userDoc = await User.findById(session.userId).select('-passwordHash');
          addresses = await Address.find({ userId: session.userId }).sort({ isDefaultShipping: -1, createdAt: -1 });
        } else {
          userDoc = await User.findOne({ email: session.email }).select('-passwordHash');
          if (userDoc) {
            addresses = await Address.find({ userId: userDoc._id }).sort({ isDefaultShipping: -1, createdAt: -1 });
          }
        }
      } catch (dbErr) {
        console.warn('DB lookup error in /api/auth/me:', dbErr);
      }
    }

    return NextResponse.json({
      user: {
        userId: session.userId,
        email: session.email,
        fullName: userDoc?.fullName || session.fullName,
        phone: userDoc?.phone || '',
        role: session.role,
      },
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
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

