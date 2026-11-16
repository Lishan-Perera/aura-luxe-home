import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const redirectTarget = searchParams.get('redirect') || '/checkout';

  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const errorUrl = new URL('/auth/login', req.url);
    errorUrl.searchParams.set('redirect', redirectTarget);
    errorUrl.searchParams.set('oauth_notice', 'facebook_not_configured');
    return NextResponse.redirect(errorUrl);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const callbackUrl = `${appUrl}/api/auth/oauth/facebook/callback`;
  const state = encodeURIComponent(redirectTarget);

  const fbAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  fbAuthUrl.searchParams.set('client_id', clientId);
  fbAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  fbAuthUrl.searchParams.set('state', state);
  fbAuthUrl.searchParams.set('scope', 'email,public_profile');

  return NextResponse.redirect(fbAuthUrl.toString());
}

