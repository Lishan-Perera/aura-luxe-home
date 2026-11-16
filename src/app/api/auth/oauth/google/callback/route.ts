import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/db/mongodb';
import User from '@/models/User';
import { signJWT } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME, getSessionCookieOptions } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const redirectTarget = state ? decodeURIComponent(state) : '/checkout';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || !code) {
    const errorUrl = new URL('/auth/login', req.url);
    errorUrl.searchParams.set('redirect', redirectTarget);
    errorUrl.searchParams.set('oauth_notice', 'google_not_configured');
    return NextResponse.redirect(errorUrl);
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${appUrl}/api/auth/oauth/google/callback`;

    // Exchange authorization code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to exchange Google OAuth code');
    }

    // Fetch user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();

    if (!profile.email) {
      throw new Error('Google account has no associated email address');
    }

    const cleanEmail = profile.email.toLowerCase().trim();
    let userId = `google-${profile.sub}`;
    let fullName = profile.name || 'Google Customer';
    let role: 'customer' | 'store_manager' | 'super_admin' = 'customer';

    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      await connectToDatabase();
      let user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = await User.create({
          fullName,
          email: cleanEmail,
          role: 'customer',
          isActive: true,
          passwordHash: 'oauth_managed_google_account',
        });
      }
      userId = user._id.toString();
      fullName = user.fullName;
      role = user.role;
    }

    // Set Session Cookie
    const sessionToken = await signJWT({
      userId,
      email: cleanEmail,
      role,
      fullName,
    });

    const cookieOptions = getSessionCookieOptions();
    cookies().set(AUTH_COOKIE_NAME, sessionToken, cookieOptions);

    const destination = new URL(redirectTarget, req.url);
    return NextResponse.redirect(destination);
  } catch (err: any) {
    console.error('Google OAuth callback error:', err);
    const errorUrl = new URL('/auth/login', req.url);
    errorUrl.searchParams.set('redirect', redirectTarget);
    errorUrl.searchParams.set('oauth_error', err.message || 'OAuth sign in failed');
    return NextResponse.redirect(errorUrl);
  }
}

