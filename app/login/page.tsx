'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@userly.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Não foi possível entrar.');
      window.location.href = '/';
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro ao realizar login.'); }
    finally { setLoading(false); }
  }

  return <main className="login-shell">
    <section className="login-card">
      <div className="login-brand"><span className="brand-mark">u</span><span>userly<span className="brand-dot">.</span></span></div>
      <div className="login-eyebrow">ÁREA RESTRITA</div>
      <h1>Bem-vindo de volta</h1>
      <p className="login-description">Entre com suas credenciais para acessar o gerenciamento de usuários.</p>
      <form onSubmit={submit} className="login-form">
        <label>E-mail<input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" /></label>
        <label>Senha<input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha" /></label>
        {error && <div className="login-error">⚠ {error}</div>}
        <button className="primary-btn login-submit" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'} <span>→</span></button>
      </form>
      <div className="login-security"><span>◈</span> Acesso protegido por autenticação JWT</div>
    </section>
    <p className="login-footer">© 2026 Userly · Gestão simples e segura</p>
  </main>;
}
