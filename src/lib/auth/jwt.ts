import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'auraluxe_luxury_home_decor_secret_key_2026_super_secure';
const key = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'customer' | 'store_manager' | 'super_admin';
  fullName: string;
}

export async function signJWT(payload: TokenPayload, expiresIn: string = '7d'): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyJWT(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

