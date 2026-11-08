'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

type User = {
  id: string; name: string; email: string; cpf: string; phone: string; birthDate: string;
  cep: string; street: string; number: string; complement: string; neighborhood: string;
  city: string; state: string; password?: string;
};
type UserForm = Omit<User, 'id'>;
const emptyForm: UserForm = { name:'', email:'', cpf:'', phone:'', birthDate:'', cep:'', street:'', number:'', complement:'', neighborhood:'', city:'', state:'PR', password:'' };

function maskCPF(v: string) { return v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2'); }
function maskPhone(v: string) { const d=v.replace(/\D/g,'').slice(0,11); return d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3').replace(/-$/,'') : d.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3').replace(/-$/,''); }
function maskCEP(v: string) { return v.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d)/,'$1-$2'); }

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Não foi possível consultar a API.');
      setUsers(await res.json());
    } catch { setError('Não foi possível conectar ao backend. Confira se o projeto foi iniciado com npm run dev.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filtered = useMemo(() => users.filter(u => `${u.name} ${u.email} ${u.cpf}`.toLowerCase().includes(search.toLowerCase())), [users, search]);
  const openNew = () => { setEditing(null); setForm(emptyForm); setError(''); setModal(true); };
  const openEdit = (u: User) => { setEditing(u.id); const { id, ...rest } = u; setForm({ ...emptyForm, ...rest, password:'' }); setError(''); setModal(true); };
  const closeModal = () => { setModal(false); setError(''); };
  const change = (key: keyof UserForm, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  async function saveUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError('');
    if (form.cpf.replace(/\D/g,'').length !== 11) { setError('Informe um CPF com 11 dígitos.'); return; }
    if (form.phone.replace(/\D/g,'').length < 10) { setError('Informe um telefone válido com DDD.'); return; }
    if (form.cep.replace(/\D/g,'').length !== 8) { setError('Informe um CEP com 8 dígitos.'); return; }
    if (!editing && form.password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    const payload = { ...form };
    if (editing && !payload.password) delete (payload as Partial<UserForm>).password;
    try {
      const res = await fetch(editing ? `/api/users/${editing}` : '/api/users', {
        method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Falha ao salvar usuário.');
      await loadUsers(); closeModal(); setNotice(editing ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!');
      window.setTimeout(() => setNotice(''), 3500);
    } catch { setError('Não foi possível salvar. Verifique se a API está ativa.'); }
  }
  async function logout() { await fetch('/api/logout', { method: 'POST' }); window.location.href = '/login'; }

  async function deleteUser(user: User) {
    if (!window.confirm(`Deseja realmente excluir ${user.name}?`)) return;
    try { const res = await fetch(`/api/users/${user.id}`, { method:'DELETE' }); if (!res.ok) throw new Error(); await loadUsers(); setNotice('Usuário excluído com sucesso!'); window.setTimeout(() => setNotice(''), 3500); }
    catch { setError('Não foi possível excluir o usuário.'); }
  }

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">u</span><span>userly<span className="brand-dot">.</span></span></div>
      <div className="workspace-label">WORKSPACE</div>
      <button className="nav-item active"><span className="nav-icon">▦</span> Usuários <span className="nav-count">{users.length}</span></button>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">✦</div><strong>Precisa de ajuda?</strong><p>Gerencie seus cadastros de forma simples e segura.</p></div><div className="profile"><div className="avatar">AD</div><div><strong>Administrador</strong><small>admin@userly.com</small></div><button className="logout-btn" onClick={logout} title="Sair da conta">Sair ↗</button></div></div>
    </aside>
    <section className="main-area">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Usuários</strong></div><div className="top-actions"><span className="status-dot"/> Sistema online <div className="top-avatar">AD</div></div></header>
      <div className="content">
        <div className="eyebrow">GERENCIAMENTO</div><div className="page-heading"><div><h1>Usuários</h1><p>Gerencie os usuários cadastrados na plataforma.</p></div><button className="primary-btn" onClick={openNew}><span>＋</span> Novo usuário</button></div>
        {notice && <div className="notice">✓ {notice}</div>}{error && !modal && <div className="error-banner">{error}</div>}
        <div className="stats-grid"><div className="stat-card"><div className="stat-top"><span>Total de usuários</span><span className="stat-icon purple">♙</span></div><div className="stat-value">{users.length.toString().padStart(2,'0')}</div><div className="stat-foot"><span className="trend">↗</span> Cadastros registrados</div></div><div className="stat-card"><div className="stat-top"><span>Cadastros recentes</span><span className="stat-icon green">◷</span></div><div className="stat-value">{users.filter(u => u.id && Number(u.id) > 0).length.toString().padStart(2,'0')}</div><div className="stat-foot">Usuários na base de dados</div></div><div className="stat-card"><div className="stat-top"><span>Status do sistema</span><span className="stat-icon blue">✓</span></div><div className="stat-value status-value">Operacional</div><div className="stat-foot"><span className="live-dot"/> API conectada</div></div></div>
        <section className="table-card"><div className="table-heading"><div><h2>Todos os usuários</h2><p>Visualize e gerencie os dados cadastrados.</p></div><span className="total-pill">{users.length} registros</span></div><div className="table-tools"><div className="search-box"><span>⌕</span><input aria-label="Buscar usuário" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou CPF..."/></div><button className="filter-btn" onClick={()=>setSearch('')}>↻ <span>Limpar busca</span></button></div>
          <div className="table-wrap"><table><thead><tr><th>USUÁRIO</th><th>CPF</th><th>TELEFONE</th><th>DATA DE NASCIMENTO</th><th>STATUS</th><th className="actions-head">AÇÕES</th></tr></thead><tbody>
            {loading ? <tr><td colSpan={6} className="empty-state">Carregando usuários...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="empty-state">Nenhum usuário encontrado.</td></tr> : filtered.map((u,i)=><tr key={u.id}><td><div className="user-cell"><div className={`user-avatar color-${i%5}`}>{u.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div><div><strong>{u.name}</strong><small>{u.email}</small></div></div></td><td className="muted-cell">{u.cpf}</td><td className="muted-cell">{u.phone}</td><td className="muted-cell">{u.birthDate ? new Date(`${u.birthDate}T12:00:00`).toLocaleDateString('pt-BR') : '—'}</td><td><span className="active-pill"><span/> Ativo</span></td><td><div className="row-actions"><button title="Editar usuário" aria-label={`Editar ${u.name}`} className="icon-btn edit-btn" onClick={()=>openEdit(u)}>✎</button><button title="Excluir usuário" aria-label={`Excluir ${u.name}`} className="icon-btn delete-btn" onClick={()=>deleteUser(u)}>⌫</button></div></td></tr>)}
          </tbody></table></div><div className="table-footer"><span>Exibindo <strong>{filtered.length ? 1 : 0}–{filtered.length}</strong> de <strong>{filtered.length}</strong> resultados</span><div className="pagination"><button disabled>‹</button><button className="current-page">1</button><button disabled>›</button></div></div>
        </section><footer className="footer"><span>© 2026 Userly. Todos os direitos reservados.</span><span>Feito para simplificar <b>♥</b></span></footer>
      </div>
    </section>
    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget) closeModal();}}><section className="modal-card"><div className="modal-header"><div><div className="eyebrow">CADASTRO DE USUÁRIO</div><h2>{editing ? 'Editar usuário' : 'Novo usuário'}</h2><p>Preencha os campos abaixo para {editing ? 'atualizar os dados' : 'adicionar um novo cadastro'}.</p></div><button className="close-btn" onClick={closeModal} aria-label="Fechar">×</button></div>
      <form onSubmit={saveUser}><div className="form-section-title"><span>01</span> Dados pessoais</div><div className="form-grid"><label className="full-field">Nome completo *<input required value={form.name} onChange={e=>change('name',e.target.value)} placeholder="Ex.: Maria da Silva"/></label><label>E-mail *<input required type="email" value={form.email} onChange={e=>change('email',e.target.value)} placeholder="nome@email.com"/></label><label>CPF *<input required value={form.cpf} onChange={e=>change('cpf',maskCPF(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" maxLength={14}/></label><label>Telefone *<input required value={form.phone} onChange={e=>change('phone',maskPhone(e.target.value))} placeholder="(00) 00000-0000" inputMode="tel" maxLength={15}/></label><label>Data de nascimento *<input required type="date" value={form.birthDate} max={new Date().toISOString().slice(0,10)} onChange={e=>change('birthDate',e.target.value)}/></label></div>
      <div className="form-section-title address-title"><span>02</span> Endereço</div><div className="form-grid"><label>CEP *<input required value={form.cep} onChange={e=>change('cep',maskCEP(e.target.value))} placeholder="00000-000" inputMode="numeric" maxLength={9}/></label><label className="wide-field">Rua / Avenida *<input required value={form.street} onChange={e=>change('street',e.target.value)} placeholder="Nome da rua"/></label><label>Número *<input required value={form.number} onChange={e=>change('number',e.target.value)} placeholder="Nº"/></label><label>Complemento<input value={form.complement} onChange={e=>change('complement',e.target.value)} placeholder="Apto, bloco..."/></label><label>Bairro *<input required value={form.neighborhood} onChange={e=>change('neighborhood',e.target.value)} placeholder="Seu bairro"/></label><label>Cidade *<input required value={form.city} onChange={e=>change('city',e.target.value)} placeholder="Sua cidade"/></label><label>Estado *<select required value={form.state} onChange={e=>change('state',e.target.value)}>{['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(s=><option key={s}>{s}</option>)}</select></label></div>
      <div className="form-section-title address-title"><span>03</span> Segurança</div><div className="form-grid"><label className="full-field">Senha {editing ? '(deixe em branco para manter a atual)' : '*'}<input type="password" required={!editing} minLength={6} value={form.password || ''} onChange={e=>change('password',e.target.value)} placeholder={editing ? '••••••••' : 'Mínimo de 6 caracteres'}/></label></div>
      {error && <div className="form-error">⚠ {error}</div>}<div className="modal-actions"><span className="required-note">* Campos obrigatórios</span><div><button type="button" className="cancel-btn" onClick={closeModal}>Cancelar</button><button type="submit" className="primary-btn">{editing ? 'Salvar alterações' : 'Cadastrar usuário'} <span>→</span></button></div></div></form>
    </section></div>}
  </main>;
}
