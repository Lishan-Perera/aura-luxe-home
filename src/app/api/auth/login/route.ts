import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifyPassword } from '@/lib/auth/password';
import { signJWT } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME, getSessionCookieOptions } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = (body.identifier || body.email || '').trim();
    const { password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Email or mobile phone number and password are required' }, { status: 400 });
    }

    const cleanIdentifier = identifier.toLowerCase();
    const isEmail = cleanIdentifier.includes('@');

    // Normalize phone numbers for Sri Lanka matching
    let phoneVariants = [identifier];
    if (!isEmail) {
      const digits = identifier.replace(/[^0-9]/g, '');
      if (digits.startsWith('94') && digits.length === 11) {
        phoneVariants.push(`0${digits.slice(2)}`);
        phoneVariants.push(`+94${digits.slice(2)}`);
      } else if (digits.startsWith('0') && digits.length === 10) {
        phoneVariants.push(digits);
        phoneVariants.push(`+94${digits.slice(1)}`);
      }
    }

    let user = null;
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      try {
        await connectToDatabase();
        if (isEmail) {
          user = await User.findOne({ email: cleanIdentifier }).select('+passwordHash');
        } else {
          user = await User.findOne({
            $or: [
              { phone: { $in: phoneVariants } },
              { email: cleanIdentifier }
            ]
          }).select('+passwordHash');
        }
      } catch (err) {
        console.warn('DB lookup failed in /api/auth/login:', err);
      }
    }

    let isValidPassword = false;
    let userRole: 'customer' | 'store_manager' | 'super_admin' = 'customer';
    let userId = 'user-1';
    let fullName = 'Aura Luxe Customer';
    let userEmail = isEmail ? cleanIdentifier : 'customer@auraluxe.lk';

    if (user) {
      isValidPassword = await verifyPassword(password, user.passwordHash);
      userRole = user.role;
      userId = user._id.toString();
      fullName = user.fullName;
      userEmail = user.email;
    } else {
      // In development / demo fallback mode
      const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || 'admin@auraluxe.lk').toLowerCase();
      const adminPass = process.env.ADMIN_INITIAL_PASSWORD || 'AdminAuraLuxe2026!';

      if ((cleanIdentifier === adminEmail || cleanIdentifier === '0770000000') && password === adminPass) {
        isValidPassword = true;
        userRole = 'super_admin';
        userId = 'admin-root';
        fullName = 'Aura Luxe Admin';
        userEmail = adminEmail;
      } else if (
        (cleanIdentifier === 'customer@auraluxe.lk' || phoneVariants.includes('0771234567')) &&
        password === 'Customer123!'
      ) {
        isValidPassword = true;
        userRole = 'customer';
        userId = 'customer-demo';
        fullName = 'Ruwan Jayawardena';
        userEmail = 'customer@auraluxe.lk';
      }
    }

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email, phone number, or password' }, { status: 401 });
    }

    // Generate JWT
    const token = await signJWT({
      userId,
      email: userEmail,
      role: userRole,
      fullName,
    });

    const cookieOptions = getSessionCookieOptions();
    cookies().set(AUTH_COOKIE_NAME, token, cookieOptions);

    return NextResponse.json({
      success: true,
      user: {
        userId,
        email: userEmail,
        role: userRole,
        fullName,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
