import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const secret = process.env.JWT_SECRET || 'userly-dev-secret-change-before-production-2026';
const cookieName = 'userly_token';
const b64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  if (!stored) return false;
  if (stored.startsWith('scrypt$')) {
    const [, salt, expected] = stored.split('$');
    const actual = scryptSync(password, salt, 64);
    const expectedBuffer = Buffer.from(expected, 'hex');
    return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
  }
  // Compatibilidade com cadastros antigos do primeiro trabalho.
  return stored === password;
}

export function createToken(payload: { id: string; email: string; name: string }) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 }));
  const unsigned = `${header}.${body}`;
  const signature = createHmac('sha256', secret).update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
}

export function verifyToken(token?: string | null) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const unsigned = `${parts[0]}.${parts[1]}`;
    const expected = createHmac('sha256', secret).update(unsigned).digest();
    const received = Buffer.from(parts[2], 'base64url');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload as { id: string; email: string; name: string; exp: number };
  } catch { return null; }
}

export { cookieName };
