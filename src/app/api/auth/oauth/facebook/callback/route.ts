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

  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

  if (!clientId || !clientSecret || !code) {
    const errorUrl = new URL('/auth/login', req.url);
    errorUrl.searchParams.set('redirect', redirectTarget);
    errorUrl.searchParams.set('oauth_notice', 'facebook_not_configured');
    return NextResponse.redirect(errorUrl);
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${appUrl}/api/auth/oauth/facebook/callback`;

    // Exchange authorization code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', clientId);
    tokenUrl.searchParams.set('client_secret', clientSecret);
    tokenUrl.searchParams.set('redirect_uri', callbackUrl);
    tokenUrl.searchParams.set('code', code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || 'Failed to exchange Facebook OAuth code');
    }

    // Fetch user info from Facebook
    const userUrl = new URL('https://graph.facebook.com/me');
    userUrl.searchParams.set('fields', 'id,name,email');
    userUrl.searchParams.set('access_token', tokenData.access_token);

    const userRes = await fetch(userUrl.toString());
    const profile = await userRes.json();

    const userEmail = (profile.email || `${profile.id}@facebook.user.auraluxe.lk`).toLowerCase();
    let userId = `fb-${profile.id}`;
    let fullName = profile.name || 'Facebook Customer';
    let role: 'customer' | 'store_manager' | 'super_admin' = 'customer';

    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      await connectToDatabase();
      let user = await User.findOne({ email: userEmail });
      if (!user) {
        user = await User.create({
          fullName,
          email: userEmail,
          role: 'customer',
          isActive: true,
          passwordHash: 'oauth_managed_facebook_account',
        });
      }
      userId = user._id.toString();
      fullName = user.fullName;
      role = user.role;
    }

    // Set Session Cookie
    const sessionToken = await signJWT({
      userId,
      email: userEmail,
      role,
      fullName,
    });

    const cookieOptions = getSessionCookieOptions();
    cookies().set(AUTH_COOKIE_NAME, sessionToken, cookieOptions);

    const destination = new URL(redirectTarget, req.url);
    return NextResponse.redirect(destination);
  } catch (err: any) {
    console.error('Facebook OAuth callback error:', err);
    const errorUrl = new URL('/auth/login', req.url);
    errorUrl.searchParams.set('redirect', redirectTarget);
    errorUrl.searchParams.set('oauth_error', err.message || 'OAuth sign in failed');
    return NextResponse.redirect(errorUrl);
  }
}

