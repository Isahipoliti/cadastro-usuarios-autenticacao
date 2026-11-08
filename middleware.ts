import { NextRequest, NextResponse } from 'next/server';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'userly-dev-secret-change-before-production-2026');
const cookieName = 'userly_token';

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}

async function validToken(token?: string) {
  try {
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const key = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('HMAC', key, decodeBase64Url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    if (!valid) return false;
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])));
    return typeof payload.exp === 'number' && payload.exp > Math.floor(Date.now() / 1000);
  } catch { return false; }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value;
  const isValid = await validToken(token);
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/login')) {
    if (isValid) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }
  if (!isValid) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] };
