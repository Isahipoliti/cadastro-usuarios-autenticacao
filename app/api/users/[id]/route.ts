import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyToken } from '@/lib/auth';

type Context = { params: { id: string } };
function authorized(request: NextRequest) { return !!verifyToken(request.cookies.get('userly_token')?.value); }

export async function PATCH(request: NextRequest, { params }: Context) {
  if (!authorized(request)) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  try {
    const data = await request.json();
    if (data.password) {
      if (String(data.password).length < 6) return NextResponse.json({ message: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
      data.password = hashPassword(String(data.password));
    }
    const response = await fetch(`http://localhost:3001/users/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch { return NextResponse.json({ message: 'Falha ao atualizar usuário.' }, { status: 400 }); }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  if (!authorized(request)) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  try {
    const response = await fetch(`http://localhost:3001/users/${params.id}`, { method: 'DELETE' });
    return NextResponse.json({ success: response.ok }, { status: response.status });
  } catch { return NextResponse.json({ message: 'Falha ao excluir usuário.' }, { status: 400 }); }
}
