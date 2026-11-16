import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'auraluxe_luxury_home_decor_secret_key_2026_super_secure';
const key = new TextEncoder().encode(JWT_SECRET);
const AUTH_COOKIE_NAME = 'auraluxe_session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, key);
      const role = (payload as any).role;

      if (role !== 'super_admin' && role !== 'store_manager') {
        const homeUrl = new URL('/', req.url);
        return NextResponse.redirect(homeUrl);
      }
    } catch (err) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Admin APIs
  if (pathname.startsWith('/api/admin')) {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, key);
      const role = (payload as any).role;

      if (role !== 'super_admin' && role !== 'store_manager') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin', '/api/admin/:path*'],
};

