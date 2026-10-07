# Hospedagem do AgroLeite (Neon + Render + Cloudflare Pages)

| Parte | Serviço | O que roda |
|---|---|---|
| Banco | Neon | PostgreSQL |
| API | Render (Docker) | `pecuaria-csharp/PecuariaApi` |
| Tela | Cloudflare Pages | `pecuaria/frontend` |

Depois de configurado, cada `git push` na branch escolhida atualiza o Render e o Pages sozinhos.
O uso local no PC continua igual (SQLite, `pecuaria.db`).

## 1. Banco — Neon

1. Crie a conta em https://neon.tech e um projeto (região: São Paulo / `sa-east-1`, se houver).
2. Em **Connect**, copie a connection string (`postgresql://usuario:senha@ep-....neon.tech/neondb?sslmode=require`).

## 2. Levar os dados do PC para o Neon (uma vez só)

Com o backend parado, no PowerShell, dentro de `pecuaria-csharp/PecuariaApi`:

```powershell
$env:ConnectionStrings__DefaultConnection = "postgresql://...(do Neon)"
$env:Jwt__ChaveSecreta = "qualquer-coisa-so-para-importar-1234567890"
dotnet run -- importar-sqlite pecuaria.db
```

Isso cria as tabelas no Neon e copia tudo. **Apaga o que já existir no Neon** antes de copiar,
então pode ser repetido se precisar. Feche o terminal depois (para não ficar com as variáveis).

## 3. API — Render

1. Crie a conta em https://render.com entrando com o GitHub.
2. **New → Web Service** → repositório `agroleite`.
3. Configuração:
   - Branch: `main` (ou a que for usada)
   - Root Directory: `pecuaria-csharp/PecuariaApi`
   - Language/Runtime: **Docker**
   - Instance Type: **Free**
4. **Environment Variables**:

   | Variável | Valor |
   |---|---|
   | `ConnectionStrings__DefaultConnection` | connection string do Neon |
   | `Jwt__ChaveSecreta` | chave longa e aleatória (ex: gere com um gerador de senhas, 64 caracteres) |
   | `Cors__OrigensPermitidas` | URL do Pages, ex: `https://agroleite.pages.dev` (preencher depois do passo 4) |
   | `Admin__SenhaInicial` | opcional — senha do admin se o banco estiver vazio (sem importação) |

5. Após o deploy, anote a URL (ex: `https://agroleite-api.onrender.com`).
   Teste abrindo `https://.../api/animais` — deve responder "Token não fornecido".

## 4. Tela — Cloudflare Pages

1. Dashboard da Cloudflare → **Workers & Pages → Create → Pages → Connect to Git** → `agroleite`.
2. Configuração:
   - Framework preset: **Vite** (ou None)
   - Root directory: `pecuaria/frontend`
   - Build command: `npm run build`
   - Build output directory: `dist`
3. **Environment variables**: `VITE_API_URL` = URL do Render (passo 3).
4. Após o deploy, copie a URL do Pages e coloque em `Cors__OrigensPermitidas` no Render.

## Observações

- **Plano gratuito do Render**: a API "dorme" após ~15 min sem uso; o primeiro acesso depois disso leva 30–60 s.
- **Mudou uma tabela/model?** Gere uma migration antes do push (o Render aplica sozinho ao iniciar):
  ```powershell
  cd pecuaria-csharp/PecuariaApi
  dotnet tool restore
  dotnet tool run dotnet-ef migrations add NomeDaMudanca
  ```
- **Segurança**: troque a senha do admin no primeiro acesso. A API se recusa a subir com PostgreSQL
  se `Jwt__ChaveSecreta` não estiver definida.
- **Backup**: o Neon guarda histórico de alterações (restauração das últimas horas no plano gratuito).
  O `backup.ps1` continua valendo só para o banco local.
