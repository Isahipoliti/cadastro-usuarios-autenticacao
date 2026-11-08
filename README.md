# Userly — Cadastro de usuários com autenticação JWT

Projeto acadêmico em Next.js 14, TypeScript e JSON Server. Inclui CRUD de usuários, login, token JWT em cookie HttpOnly, logout e proteção das páginas e rotas de API.

## Requisitos
- Node.js 20 ou superior

## Como executar
1. Extraia o ZIP e abra a pasta `cadastro-usuarios-next` no VS Code.
2. Abra o terminal nessa pasta e execute:

   ```bash
   npm install
   npm run dev
   ```

3. Aguarde o Next.js e o JSON Server iniciarem.
4. Acesse `http://localhost:3000`.

O comando `npm run dev` inicia o Next.js na porta 3000 e o JSON Server na porta 3001.

## Acesso de demonstração
- E-mail: `admin@userly.com`
- Senha: `123456`

A conta de demonstração é criada no `db.json`. Os outros registros de exemplo foram mantidos; como vieram do trabalho anterior e não possuem senha, não podem autenticar até que uma senha seja definida.

## O que foi implementado
- Login com validação de e-mail e senha.
- Geração de token JWT assinado com HMAC-SHA256 e validade de 8 horas.
- Token armazenado em cookie `HttpOnly`, `SameSite=Lax`.
- Middleware que bloqueia páginas internas sem token válido e redireciona para `/login`.
- Rotas de API de listagem, cadastro, edição e exclusão protegidas por validação do token.
- Senhas novas armazenadas com hash scrypt; senhas antigas em texto simples são migradas para hash no primeiro login bem-sucedido.
- Logout com remoção do cookie de autenticação.

## Demonstração para o vídeo
1. Abra uma janela anônima e acesse `http://localhost:3000`.
2. Mostre que o sistema redireciona para a tela de login.
3. Mostre brevemente `middleware.ts`, `lib/auth.ts` e `app/api/login/route.ts`.
4. Entre com `admin@userly.com` e `123456`.
5. Mostre a listagem de usuários liberada após o login.
6. Clique em **Sair** e mostre que o acesso volta a ser bloqueado.

## Observações técnicas
- O JSON Server é usado como persistência local de demonstração. A API de aplicação (`/api/users`) exige autenticação, mas a porta 3001 do JSON Server deve permanecer restrita ao ambiente local; não exponha essa porta publicamente.
- Para produção, configure `JWT_SECRET` com um segredo aleatório forte e use HTTPS. O segredo padrão do projeto é apenas para desenvolvimento e demonstração acadêmica.
- Não utilize dados pessoais reais no ambiente de demonstração.
