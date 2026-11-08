import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyToken } from '@/lib/auth';

function authorized(request: NextRequest) { return !!verifyToken(request.cookies.get('userly_token')?.value); }

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  try {
    const response = await fetch('http://localhost:3001/users', { cache: 'no-store' });
    const users = await response.json();
    return NextResponse.json(users.map(({ password, ...user }: any) => user));
  } catch { return NextResponse.json({ message: 'API indisponível.' }, { status: 503 }); }
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  try {
    const data = await request.json();
    if (!data.password || String(data.password).length < 6) return NextResponse.json({ message: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    data.password = hashPassword(String(data.password));
    const response = await fetch('http://localhost:3001/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return NextResponse.json(response.ok ? await response.json() : { message: 'Falha ao cadastrar.' }, { status: response.status });
  } catch { return NextResponse.json({ message: 'Falha ao cadastrar usuário.' }, { status: 400 }); }
}
