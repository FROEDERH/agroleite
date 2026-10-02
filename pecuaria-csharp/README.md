# AgroLeite — Backend ASP.NET Core (C#)

Backend da aplicação de controle pecuário, construído em **ASP.NET Core 8 Web API** com banco de dados **SQLite via Entity Framework Core**.

---

## Pré-requisitos

Instale o **.NET 8 SDK** no seu computador:

- Acesse **https://dotnet.microsoft.com/download** e baixe o **.NET 8 SDK** para o seu sistema (Windows, Mac ou Linux)
- Após instalar, confirme no terminal:
  ```
  dotnet --version
  ```
  Deve aparecer algo como `8.0.x`.

---

## Instalando e rodando

```bash
cd caminho/para/pecuaria-csharp/PecuariaApi

# Restaura os pacotes NuGet (equivalente ao npm install)
dotnet restore

# Roda o servidor (cria o banco automaticamente na primeira vez)
dotnet run
```

O servidor vai iniciar em **http://localhost:5000** (ou 5001 para HTTPS).

Na primeira execução, você verá no terminal:
```
Usuário administrador padrão criado:
  E-mail: admin@fazenda.com
  Senha:  admin123
```
**Troque essa senha após o primeiro login.**

---

## Rotas disponíveis (resumo)

| Módulo | Rota base |
|---|---|
| Autenticação | `POST /api/auth/login` |
| Usuários | `GET/POST /api/auth/usuarios` |
| Propriedade | `GET/POST /api/propriedade` |
| Animais | `GET/POST/PUT/DELETE /api/animais` |
| Produção de Leite | `GET/POST/PUT/DELETE /api/producao-leite` |
| Reprodução | `GET/POST/PUT /api/reproducao` |
| Venda de Animais | `GET/POST/DELETE /api/vendas-animais` |
| Estoque de Ração | `GET/POST/DELETE /api/estoque-racao/entradas|consumo|saldo` |
| Estoque de Feno | `GET/POST/DELETE /api/estoque-feno/entradas|consumo|saldo` |
| Estoque de Silagem | `GET/POST/DELETE /api/estoque-silagem/entradas|consumo|saldo` |
| Despesas | `GET/POST/PUT/DELETE /api/despesas` |
| Receitas | `GET/POST/PUT/DELETE /api/receitas` |
| Dashboard | `GET /api/dashboard/resumo|producao-mensal|financeiro-mensal|despesas-categoria|vendas-animais-resumo` |

A documentação interativa completa (Swagger UI) fica disponível em **http://localhost:5000/swagger** enquanto o servidor está rodando em modo desenvolvimento.

---

## Rodando frontend + backend juntos

### Modo desenvolvimento (dois terminais)

**Terminal 1 — Backend:**
```bash
cd pecuaria-csharp/PecuariaApi
dotnet run
```

**Terminal 2 — Frontend:**
```bash
cd pecuaria/frontend
npm install   # só na primeira vez
npm run dev
```
Acesse: **http://localhost:5173**

### Modo produção (um único servidor)

```bash
# 1. Build do frontend
cd pecuaria/frontend
npm run build

# 2. Copie a pasta dist para dentro de PecuariaApi/wwwroot
#    No Windows:
xcopy /E /I dist ..\pecuaria-csharp\PecuariaApi\wwwroot
#    No Linux/Mac:
cp -r dist/ ../pecuaria-csharp/PecuariaApi/wwwroot/

# 3. Rode apenas o backend
cd ../pecuaria-csharp/PecuariaApi
dotnet run
```
Acesse: **http://localhost:5000** (o backend serve o frontend também).

---

## Acessando de outros computadores/celulares na rede da fazenda (equipe)

O backend já está configurado para aceitar conexões de outros dispositivos na mesma rede Wi-Fi/local. Veja como liberar isso:

### 1. Descubra o IP local do computador que está rodando o sistema

No computador onde você roda `dotnet run` e `npm run dev`:

- **Windows**: abra o Prompt de Comando e digite `ipconfig`. Procure por "Endereço IPv4" — algo como `192.168.0.105`.
- **Mac/Linux**: abra o terminal e digite `ifconfig` ou `ip a`. Procure por um endereço parecido.

### 2. Acesse de outro dispositivo na mesma rede

Em outro computador ou celular **conectado à mesma rede Wi-Fi**, abra o navegador e acesse:

```
http://SEU_IP_AQUI:5173
```

Exemplo: `http://192.168.0.105:5173`

Isso deve funcionar automaticamente — o backend já aceita conexões de qualquer endereço de rede local privada (faixas `192.168.x.x`, `10.x.x.x` e `172.16-31.x.x`), e o frontend (Vite) também já está configurado para escutar em todos os adaptadores de rede.

### 3. Caso não funcione: firewall do Windows

Se o outro dispositivo não conseguir acessar, o motivo mais comum é o **firewall do Windows** bloqueando as portas 5000 (backend) e 5173 (frontend). Para liberar:

1. Abra o **Firewall do Windows Defender com Segurança Avançada**
2. Crie uma **Regra de Entrada** nova para cada porta (5000 e 5173), permitindo conexões TCP
3. Ou, mais simples: na primeira vez que rodar `dotnet run` ou `npm run dev`, o Windows costuma perguntar "Permitir que este aplicativo acesse redes públicas e privadas?" — clique em **Permitir**.

> **Atenção**: isso libera o acesso para qualquer dispositivo na mesma rede Wi-Fi. Em uma rede doméstica/fazenda isso normalmente é seguro, mas evite fazer isso em redes públicas (Wi-Fi de aeroporto, cafeteria, etc).

## Onde ficam os dados

O banco de dados SQLite é um arquivo único chamado `pecuaria.db`, criado automaticamente na pasta `PecuariaApi/` na primeira execução. Faça backups periódicos desse arquivo.

---

## Comportamentos especiais

- **Venda de animal**: ao registrar uma venda de corte (`POST /api/vendas-animais`), o sistema automaticamente muda o status do animal para "Vendido" e cria uma entrada em Receitas (categoria "Venda de Animal"). Ao excluir a venda, a receita vinculada também é excluída.
- **Perda de cria**: use `PUT /api/reproducao/{id}/perda-cria` com `dataPerdaCria` e `motivoPerda` para registrar abortos.
- **Previsão de parto**: calculada automaticamente como data de inseminação + 283 dias.
- **Estoque**: ao registrar consumo, o sistema valida se há saldo suficiente antes de permitir a saída.
