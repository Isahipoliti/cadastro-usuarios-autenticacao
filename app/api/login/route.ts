import { NextRequest, NextResponse } from 'next/server';
import { createToken, cookieName, hashPassword, verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ message: 'Informe e-mail e senha.' }, { status: 400 });
    const response = await fetch('http://localhost:3001/users', { cache: 'no-store' });
    if (!response.ok) throw new Error('API de usuários indisponível');
    const users = await response.json();
    const user = users.find((item: any) => item.email?.toLowerCase() === String(email).toLowerCase());
    if (!user || !verifyPassword(String(password), user.password || '')) {
      return NextResponse.json({ message: 'E-mail ou senha inválidos.' }, { status: 401 });
    }
    // Migra automaticamente senhas antigas em texto simples para hash scrypt.
    if (!String(user.password).startsWith('scrypt$')) {
      await fetch(`http://localhost:3001/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: hashPassword(String(password)) }) });
    }
    const token = createToken({ id: String(user.id), email: user.email, name: user.name });
    const result = NextResponse.json({ message: 'Login realizado com sucesso.', user: { id: user.id, name: user.name, email: user.email } });
    result.cookies.set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
    return result;
  } catch {
    return NextResponse.json({ message: 'Não foi possível autenticar. Verifique se a API está ativa.' }, { status: 503 });
  }
}
