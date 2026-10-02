# AgroLeite — Sistema de Controle Pecuário

Sistema completo para controle de uma propriedade de pecuária leiteira: animais, produção de leite, reprodução (inseminação, prenhez, partos, perdas de cria), estoque de ração/feno/silagem, despesas, receitas e um painel com gráficos.

O sistema roda **localmente no seu computador** — não precisa de internet para usar no dia a dia, e os dados ficam salvos em um arquivo de banco de dados na sua própria máquina. Várias pessoas da equipe podem acessar pelo navegador, inclusive por outros computadores/celulares na mesma rede Wi-Fi.

---

## 1. Pré-requisitos: instalar o Node.js

Se você ainda não tem o Node.js instalado no computador:

1. Acesse **https://nodejs.org**
2. Baixe a versão **LTS** (recomendada) para o seu sistema (Windows, Mac ou Linux)
3. Instale normalmente, clicando em "Avançar/Next" até o fim
4. Para confirmar que instalou corretamente, abra o terminal (Prompt de Comando no Windows, ou Terminal no Mac) e digite:
   ```
   node -v
   ```
   Deve aparecer um número de versão (ex: v20.11.0). Se aparecer, está tudo certo.

---

## 2. Instalando o sistema

Você recebeu uma pasta chamada `pecuaria`, contendo duas subpastas: `backend` e `frontend`.

### 2.1. Instalar o backend (servidor + banco de dados)

Abra o terminal, navegue até a pasta `backend` e instale as dependências:

```bash
cd caminho/para/pecuaria/backend
npm install
```

Isso vai baixar e instalar tudo que o servidor precisa (vai demorar um ou dois minutos, dependendo da sua internet).

### 2.2. Instalar o frontend (interface visual)

Em outro terminal (ou na mesma janela, depois de terminar o passo anterior), navegue até a pasta `frontend`:

```bash
cd caminho/para/pecuaria/frontend
npm install
```

---

## 3. Rodando o sistema no dia a dia

Você vai precisar rodar **dois comandos**, um para o backend (servidor de dados) e outro para o frontend (tela). Recomendo deixar dois terminais abertos.

### Terminal 1 — Backend

```bash
cd caminho/para/pecuaria/backend
npm start
```

Você verá uma mensagem confirmando que o servidor está rodando na porta 3001.

### Terminal 2 — Frontend

```bash
cd caminho/para/pecuaria/frontend
npm run dev
```

Você verá uma mensagem com um endereço, algo como `http://localhost:5173`.

### Acessando o sistema

Abra o navegador (Chrome, Edge, etc.) e acesse:

```
http://localhost:5173
```

**Login inicial (primeiro acesso):**
- E-mail: `admin@fazenda.com`
- Senha: `admin123`

> ⚠️ Recomendo trocar essa senha assim que entrar pela primeira vez, e também criar contas individuais para cada pessoa da equipe (menu "Usuários", visível apenas para administradores).

---

## 4. Acessando de outros computadores/celulares na mesma rede (equipe)

Por padrão, o sistema só fica acessível no computador onde você rodou os comandos. Para que outras pessoas da fazenda acessem pelo celular ou outro computador conectado na mesma rede Wi-Fi:

1. No computador onde o sistema está rodando, descubra o **IP local** da máquina:
   - Windows: abra o Prompt de Comando e digite `ipconfig`, procure por "Endereço IPv4" (algo como `192.168.0.105`)
   - Mac/Linux: abra o terminal e digite `ifconfig` ou `ip a`, procure por algo parecido
2. Em outro dispositivo conectado à **mesma rede Wi-Fi**, abra o navegador e acesse:
   ```
   http://SEU_IP_AQUI:5173
   ```
   Exemplo: `http://192.168.0.105:5173`

Isso deve funcionar automaticamente. Caso o outro dispositivo não consiga acessar, pode ser necessário liberar a porta 5173 e 3001 no firewall do computador que está hospedando o sistema.

---

## 5. Funcionando em modo "produção" (opcional, mais simples no dia a dia)

Se preferir rodar **apenas um comando** no dia a dia (sem precisar abrir dois terminais), você pode gerar uma versão otimizada do frontend e deixar o próprio backend servindo tudo:

```bash
cd caminho/para/pecuaria/frontend
npm run build
```

Isso vai gerar uma pasta `frontend/dist`. A partir daí, basta rodar:

```bash
cd caminho/para/pecuaria/backend
npm start
```

E acessar **apenas** `http://localhost:3001` (não precisa mais do terminal do frontend nem da porta 5173). Essa opção é mais simples para o uso diário, mas toda vez que eu (ou você) alterar algo no frontend, será necessário rodar `npm run build` de novo.

---

## 6. Onde ficam os dados

O banco de dados é um arquivo único chamado `pecuaria.db`, criado automaticamente dentro de `backend/db/` na primeira vez que você rodar o servidor. **Esse arquivo contém todos os seus dados.**

Recomendações importantes:
- Faça backups periódicos desse arquivo (basta copiá-lo para um pen-drive, e-mail ou nuvem de tempos em tempos)
- Não delete a pasta `backend/db` sem antes ter um backup
- Se quiser "zerar" o sistema, basta apagar o arquivo `pecuaria.db` e reiniciar o servidor — ele cria um banco novo automaticamente, com o usuário admin padrão

---

## 7. Resumo das funcionalidades

- **Painel (Dashboard)**: visão geral com gráficos de produção, ranking de vacas, receitas x despesas, despesas por categoria, alertas de partos e vacinas próximas
- **Animais**: cadastro com raça, brinco, categoria, status, vacinas e histórico de doenças
- **Produção de Leite**: lançamento diário por vaca (manhã/tarde/noite) com histórico e totais
- **Reprodução**: inseminação (com raça do sêmen e valor), confirmação de prenhez, registro de parto e **marcação explícita de perda de cria** (com data e motivo)
- **Estoque de Ração / Feno / Silagem**: controle de entradas (compra/produção) e consumo, com saldo atual sempre calculado
- **Despesas e Receitas**: controle financeiro simples, usado também nos gráficos do painel
- **Propriedade**: dados cadastrais da fazenda
- **Usuários**: múltiplos usuários com papéis de administrador ou operador (apenas administradores podem gerenciar outros usuários)

---

## 8. Problemas comuns

**"npm: comando não encontrado"**
→ O Node.js não foi instalado corretamente. Revise o passo 1.

**A página abre mas fica em branco / erro de conexão**
→ Confirme que o terminal do backend (`npm start` na pasta `backend`) está rodando sem erros, em outro terminal.

**"Erro 403" ou "Forbidden" durante o `npm install`**
→ Verifique sua conexão com a internet. Pode ser necessário também checar se algum firewall/antivírus está bloqueando o npm.

**Esqueci a senha do administrador**
→ Apague o arquivo `backend/db/pecuaria.db` (isso vai zerar todos os dados!) para recriar o usuário admin padrão, ou peça a outro administrador para trocar sua senha pela tela de Usuários.
