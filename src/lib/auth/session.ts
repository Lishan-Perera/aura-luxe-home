import { cookies } from 'next/headers';
import { verifyJWT, TokenPayload } from './jwt';

export const AUTH_COOKIE_NAME = 'auraluxe_session';

export async function getServerSession(): Promise<TokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  return await verifyJWT(token);
}

export function getSessionCookieOptions() {
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

