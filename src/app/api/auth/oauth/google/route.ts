import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const redirectTarget = searchParams.get('redirect') || '/checkout';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const errorUrl = new URL('/auth/login', req.url);
    errorUrl.searchParams.set('redirect', redirectTarget);
    errorUrl.searchParams.set('oauth_notice', 'google_not_configured');
    return NextResponse.redirect(errorUrl);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const callbackUrl = `${appUrl}/api/auth/oauth/google/callback`;
  const state = encodeURIComponent(redirectTarget);

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  return NextResponse.redirect(googleAuthUrl.toString());
}

