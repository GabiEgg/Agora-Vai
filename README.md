# Dossiê Paranormal — servidor

Criador de fichas de Ordem Paranormal RPG com Sobrevivendo ao Horror, Arquivos Secretos, regras opcionais, condições, interlúdio, bônus e homebrew. Esta pasta roda como um site próprio, com contas de usuário e banco de dados SQLite.

## Requisitos

- Node.js **22.13 ou mais novo**.
- `npm install` uma vez (instala só o cliente do Turso; sem Turso, o banco é um arquivo SQLite local).

## Rodar

```bash
npm start
```

Abra `http://localhost:3000`. Clique em **Entrar** → escolha um nome e uma senha → **Criar conta**. As fichas que já estavam no navegador vão junto para a conta nova.

## Configuração (variáveis de ambiente)

| Variável | Padrão | Para quê |
|---|---|---|
| `PORT` | `3000` | Porta do servidor |
| `TURSO_DATABASE_URL` | — | Endereço do banco no Turso (`libsql://…turso.io`). Se definido, os dados ficam no Turso em vez do arquivo local |
| `TURSO_AUTH_TOKEN` | — | Chave de acesso do banco no Turso |
| `DB_PATH` | `server/dados/dossie.db` | Arquivo do banco SQLite |
| `PERMITIR_CADASTRO` | `1` | `0` desliga a criação de contas novas (depois que o grupo se cadastrar) |
| `COOKIE_SECURE` | — | `1` quando o site estiver em HTTPS |
| `NODE_ENV` | — | `production` guarda a página em cache |
| `TRUST_PROXY` | — | `1` quando hospedado atrás de um proxy (Railway, Fly.io, Nginx), para o limite de tentativas de login contar por pessoa |

Exemplo: `PORT=8080 PERMITIR_CADASTRO=0 npm start`

## Docker

```bash
docker build -t dossie .
docker run -d -p 3000:3000 -v dossie-dados:/dados --name dossie dossie
```

O banco fica no volume `dossie-dados`, então sobrevive a atualizações do container.

## Colocar na internet

Qualquer serviço que rode Node.js ou Docker com disco persistente serve (VPS, Railway, Fly.io, Render com disco). Use HTTPS na frente (o próprio serviço ou um proxy como Caddy/Nginx) e defina `COOKIE_SECURE=1`.

## Hospedar de graça: Render + Turso (passo a passo)

O plano gratuito do Render apaga os arquivos do servidor quando ele reinicia ou dorme. Por isso os dados ficam no **Turso**, um SQLite na nuvem com plano gratuito.

**No Turso** (https://turso.tech):
1. Crie a conta e um banco de dados (por exemplo `dossie`). Escolha a região mais próxima da do Render.
2. Copie o endereço do banco (começa com `libsql://` e termina em `.turso.io`).
3. Gere uma chave de acesso (token) com permissão de leitura e escrita e copie.

**No Render** (https://render.com):
1. **New → Web Service** e escolha o repositório do GitHub com estes arquivos. O Render usa o `Dockerfile` da raiz.
2. Em **Environment**, crie as variáveis:
   - `TURSO_DATABASE_URL` = o endereço copiado do Turso
   - `TURSO_AUTH_TOKEN` = a chave copiada do Turso
   - `COOKIE_SECURE` = `1`
   - `TRUST_PROXY` = `1`
3. Crie o serviço no plano **Free**. Quando terminar, o log mostra `banco: Turso (…)`; se mostrar `banco: arquivo`, confira as variáveis.
4. O endereço `https://….onrender.com` é o link para o grupo. Depois que todos criarem conta, adicione `PERMITIR_CADASTRO` = `0`.

A chave do Turso é secreta: guarde só nas variáveis do Render, nunca nos arquivos do repositório. O serviço gratuito dorme depois de 15 minutos sem acesso; o primeiro acesso depois disso demora um pouco, mas os dados continuam no Turso.

## Hospedar no Fly.io (passo a passo)

Precisa do terminal (Prompt de Comando, PowerShell ou Terminal) e de uma conta no Fly.io.

1. Instale o `flyctl`: veja as instruções em https://fly.io/docs/flyctl/install/
2. Entre na conta: `fly auth login`
3. Abra o terminal **dentro desta pasta** (onde está o `Dockerfile`).
4. Escolha um nome único para o app (só letras minúsculas, números e hífen) e troque `dossie-paranormal-TROQUE` no `fly.toml` por ele.
5. Crie o app: `fly apps create NOME-ESCOLHIDO`
6. Crie o disco do banco: `fly volumes create dossie_dados --region gru --size 1`
7. Publique: `fly deploy`
8. O endereço é `https://NOME-ESCOLHIDO.fly.dev`. Mande para o grupo.
9. Depois que todos criarem conta: `fly secrets set PERMITIR_CADASTRO=0`

Para atualizar o app depois, substitua os arquivos desta pasta e rode `fly deploy` de novo; o banco fica no volume. Se o Fly criar duas máquinas, deixe só uma (`fly scale count 1`), porque o banco fica num único disco. A máquina desliga sozinha quando ninguém usa e liga no próximo acesso (o primeiro carregamento pode levar alguns segundos).

## Hospedar no Railway (passo a passo)

1. Crie uma conta no GitHub e um repositório **privado**; envie para ele o conteúdo desta pasta (dá para arrastar os arquivos em “Add file → Upload files”). O `Dockerfile` precisa ficar na raiz do repositório, não dentro de outra pasta.
2. Crie uma conta no Railway e escolha **New Project → Deploy from GitHub repo** com esse repositório. O `Dockerfile` é detectado sozinho.
3. No serviço, adicione um **Volume** com caminho de montagem `/dados` (é onde fica o banco).
4. Em **Variables**, crie: `COOKIE_SECURE=1` e `TRUST_PROXY=1`.
5. Em **Settings → Networking**, clique em **Generate Domain**. Esse endereço (https://…up.railway.app) é o link para o grupo.
6. Depois que todos criarem conta, adicione `PERMITIR_CADASTRO=0`.

Para atualizar o app depois, envie os arquivos novos para o repositório: o Railway publica de novo sozinho, e o banco no volume continua.

## Backup

Tudo está em um único arquivo: `server/dados/dossie.db` (ou o `DB_PATH` escolhido). Copie esse arquivo com o servidor parado, ou use `sqlite3 dossie.db ".backup copia.db"` com ele rodando. Cada pessoa também pode exportar um backup em JSON pelo próprio app.

## O que fica guardado

- `usuarios`: nome e senha (com hash scrypt; a senha nunca é salva em texto).
- `sessoes`: logins ativos (30 dias).
- `docs`: fichas, homebrew e configurações da mesa de cada pessoa. Cada conta só vê os próprios dados.
- `mesas`, `mesa_membros`, `mesa_eventos`: campanhas, quem participa (mestre ou jogador) e os últimos 200 avisos de rituais de cada campanha.
- `imagens`: imagens anexadas a itens e NPCs (até 8 MB cada; PNG, JPG, GIF ou WebP).

## Campanha compartilhada

1. O mestre entra, abre **Campanha**, cria uma campanha e passa o código.
2. Cada jogador entra com o código e, no Dossiê de cada agente, escolhe a campanha no campo **Campanha**.
3. Só o mestre vê as fichas ligadas (somente leitura) e os avisos de rituais (DT, teste de resistência e efeito). Jogadores veem apenas as próprias fichas.

## Estrutura

```
index.html        página do app
js/               código do app
data/dados.json   conteúdo dos livros (gerado por build.js a partir de src/)
server/server.js  servidor HTTP + API + SQLite
```

API (usada pelo app): `GET /api/eu`, `POST /api/cadastrar`, `POST /api/entrar`, `POST /api/sair`, `GET /api/docs`, `PUT/DELETE /api/docs/:id`, `POST /api/imagens`, `GET /_blob/:id`, `GET/POST /api/mesas`, `POST /api/mesas/entrar`, `DELETE /api/mesas/:id`, `POST /api/mesas/:id/sair`, `GET /api/mesas/:id/fichas` (só mestre), `GET/POST /api/mesas/:id/eventos`.
