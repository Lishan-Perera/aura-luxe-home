import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/db/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth/password';
import { signJWT } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME, getSessionCookieOptions } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, password } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Full name, email address and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters in length' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const cleanPhone = (phone || '').trim();

    // Check if user exists in MongoDB
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      try {
        await connectToDatabase();
        const existingEmail = await User.findOne({ email: cleanEmail });
        if (existingEmail) {
          return NextResponse.json({ error: 'An account with this email address already exists' }, { status: 400 });
        }

        if (cleanPhone) {
          const existingPhone = await User.findOne({ phone: cleanPhone });
          if (existingPhone) {
            return NextResponse.json({ error: 'An account with this phone number already exists' }, { status: 400 });
          }
        }

        const passwordHash = await hashPassword(password);
        const newUser = await User.create({
          fullName: fullName.trim(),
          email: cleanEmail,
          phone: cleanPhone || undefined,
          passwordHash,
          role: 'customer',
          isActive: true,
        });

        const token = await signJWT({
          userId: newUser._id.toString(),
          email: cleanEmail,
          role: 'customer',
          fullName: newUser.fullName,
        });

        const cookieOptions = getSessionCookieOptions();
        cookies().set(AUTH_COOKIE_NAME, token, cookieOptions);

        return NextResponse.json({
          success: true,
          user: {
            userId: newUser._id.toString(),
            email: cleanEmail,
            role: 'customer',
            fullName: newUser.fullName,
          },
        });
      } catch (dbErr: any) {
        console.warn('MongoDB registration error, falling back to simulated session:', dbErr);
      }
    }

    // Fallback registration session if DB is offline
    const fallbackUserId = `user-${Date.now()}`;
    const token = await signJWT({
      userId: fallbackUserId,
      email: cleanEmail,
      role: 'customer',
      fullName: fullName.trim(),
    });

    const cookieOptions = getSessionCookieOptions();
    cookies().set(AUTH_COOKIE_NAME, token, cookieOptions);

    return NextResponse.json({
      success: true,
      user: {
        userId: fallbackUserId,
        email: cleanEmail,
        role: 'customer',
        fullName: fullName.trim(),
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
