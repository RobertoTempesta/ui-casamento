# Site de Casamento (Cerimônia) — Angular (Tema Clássico)
Guia completo para criar um site em Angular com **lista de presentes**, **fotos**, **RSVP**, **informações da cerimônia** e **FAQ**, no estilo **clássico** (minimalista e elegante).

---

## 1) Objetivo e Escopo
### Objetivo
Criar um site simples e elegante para:
- Informar detalhes da **cerimônia**
- Permitir **confirmar presença (RSVP)**
- Disponibilizar **lista de presentes**
- Exibir **galeria de fotos**
- Responder dúvidas via **FAQ**

### Páginas (Rotas)
- `/` (Home)
- `/cerimonia`
- `/presentes`
- `/fotos`
- `/rsvp`
- `/faq`

---

## 2) Requisitos Não-Funcionais (importantes)
### Responsivo
- Desktop e Mobile (prioridade Mobile).

### Performance
- Imagens otimizadas e lazy-loading.
- Build de produção com cache de assets.

### Privacidade (recomendado)
- Se você quiser que **fotos não apareçam no Google**, bloquear indexação (ver seção SEO/robots).

### Acessibilidade
- Bom contraste.
- Tamanho de fonte legível.
- Navegação por teclado nos itens principais.

---

## 3) Stack Recomendada (simples e eficiente)
### Frontend
- Angular (versão atual do seu workspace, ex: Angular 19)
- Angular Router
- Angular Forms (Reactive Forms)
- (Opcional) Angular Material **ou** componentes próprios (tema clássico fica lindo sem Material)

### Backend (3 opções)
Escolha uma:
1) **Firebase** (rápido)  
   - Firestore (RSVP + reservas)
   - Storage (fotos)
2) **Supabase** (rápido e “SQL-like”)  
   - Database (RSVP + reservas)
   - Storage (fotos)
3) **Sem backend (MVP)**  
   - RSVP via Google Forms / Typeform
   - Lista de presentes só com links e sem “reservar”

> Se você quer evitar presentes duplicados com “Reservar”, precisa de backend (Firebase/Supabase).

---

## 4) Design System (Tema Clássico)
### Paleta
- Fundo: creme / off-white
- Texto: preto suave / grafite
- Detalhes: dourado discreto (linhas, divisores, pequenos ícones)

### Tipografia
- Títulos: serifada (ex: Playfair Display / Cormorant Garamond)
- Texto: sans clean (ex: Inter / Lato)

### Componentes visuais
- Layout com bastante espaço em branco
- Cards com borda leve
- Separadores horizontais finos (dourado)
- Monograma no topo (opcional)

---

## 5) Criando o Projeto Angular
### Pré-requisitos
- Node LTS instalado
- Angular CLI instalado

### Projeto criado

O projeto **ui-casamento** já está configurado neste repositório.

**Executar em desenvolvimento:**
```bash
npm start
# ou
npx ng serve
```

**Build para produção:**
```bash
npm run build
```

**Estrutura:**
- `/` — Home
- `/cerimonia` — Informações da cerimônia
- `/presentes` — Lista de presentes (com reserva via Firebase)
- `/presentes/admin` — Cadastrar e gerenciar presentes
- `/fotos` — Galeria
- `/rsvp` — Confirmação de presença
- `/faq` — Perguntas frequentes

### Firebase — desenvolvimento local (emulator)

Para desenvolver sem usar o Firebase em produção:

1. **Instale o Firebase CLI** (se ainda não tiver):
   ```bash
   npm install -g firebase-tools
   ```
   Ou use `npx firebase-tools` nos comandos abaixo.

2. **Inicie o emulador do Firestore** (em um terminal separado):
   ```bash
   firebase emulators:start --only firestore
   ```
   Ou: `npx firebase-tools emulators:start --only firestore`

3. **O app já está configurado** para usar o emulator quando `useEmulator: true` em `environment.ts` (padrão em dev).

4. **Interface do emulator:** http://localhost:4000 — visualize e edite dados localmente.

5. **Fluxo:** Terminal 1: `firebase emulators:start` | Terminal 2: `npm start`

---

### Firebase — produção

Guia completo: **[docs/FIREBASE-PRODUCAO.md](docs/FIREBASE-PRODUCAO.md)** (criar projeto, ativar Firestore, copiar config, preencher `environment.prod.ts`, deploy).

Resumo:
1. Crie um projeto em [Firebase Console](https://console.firebase.google.com)
2. Ative o **Firestore Database** (Build → Firestore Database → Criar banco)
3. Em **Configurações do projeto** → **Seus apps**, adicione um app **Web** e copie o objeto `firebaseConfig`
4. Cole os valores em `src/environments/environment.prod.ts` no objeto `firebase` (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
5. No terminal: `npx firebase-tools login` e `npx firebase-tools use --add` (escolha o projeto)
6. Deploy das regras: `npx firebase-tools deploy --only firestore:rules`
7. Deploy do site: `npm run deploy`

---

### Subir o site na internet (deploy — grátis ou bem barato)

O projeto já está configurado para **Firebase Hosting**. No plano gratuito você tem, por exemplo, 10 GB de armazenamento e 360 MB/dia de tráfego — mais do que suficiente para um site de casamento.

**Passo a passo:**

1. **Crie (ou use) um projeto no Firebase**  
   [Console Firebase](https://console.firebase.google.com) → adicione um projeto (ou use o que já tem para o Firestore).

2. **Vincule o projeto à pasta do app**  
   No terminal, na pasta do projeto:
   ```bash
   npx firebase-tools login
   npx firebase-tools use --add
   ```
   Escolha o projeto e defina como padrão.

3. **Configure produção**  
   - Em `src/environments/environment.prod.ts`: coloque as credenciais do Firebase e a lista de `validTokens`.  
   - Se quiser usar Firestore em produção, deixe `useLocalStorageForPresentes: false`; senão o site usa só localStorage (dados por navegador).

4. **Build e deploy**  
   ```bash
   npm run deploy
   ```
   Ou em dois passos:
   ```bash
   npm run build
   npx firebase-tools deploy --only hosting
   ```

5. **URL do site**  
   Após o deploy, o Firebase mostra uma URL do tipo `https://SEU-PROJETO.web.app` (e também `https://SEU-PROJETO.firebaseapp.com`). Você pode usar essa URL como base ao gerar os links com token (terceiro argumento do `generate-tokens.js`).

**Domínio próprio (opcional):** no Console Firebase → Hosting → “Conectar domínio” você pode apontar um domínio que você já tenha (ex.: `casamento.seudominio.com.br`) para o mesmo site. Continua usando o plano gratuito do Hosting.

**Outras opções gratuitas:**  
- **Vercel** ou **Netlify:** faça push do código no GitHub e conecte o repositório; eles fazem build e deploy automático. Também têm plano gratuito generoso.  
- **GitHub Pages:** free, mas exige configurar o build (ex.: GitHub Actions) para gerar a pasta `dist` e publicar.  

Para este projeto, **Firebase Hosting** é a opção mais direta, pois você já usa Firebase e o `firebase.json` já está configurado.

---

### Acesso por token (convite por WhatsApp)

O site pode ser **acessado apenas por quem tem um link com token**. Assim você envia um link por WhatsApp para cada convidado e só eles entram.

**Tokens com expiração:** cada token pode ter uma **data de validade**. O formato é `id.expiração` (ex.: `a1b2c3d4e5f6.1735689600`), em que a segunda parte é a data de expiração em segundos (Unix). Depois dessa data o link deixa de funcionar.

**Gerar tokens com expiração (recomendado):**
```bash
node scripts/generate-tokens.js [quantidade] [data-expiração] [URL-base]
```
- **quantidade:** número de tokens (padrão: 50).
- **data-expiração:** no formato `YYYY-MM-DD` (padrão: 2026-06-09).
- **URL-base:** URL do site (ex.: `https://meucasamento.com.br`). O script gera uma seção **"Links para enviar"** com um link completo por token — basta copiar e enviar por WhatsApp; no primeiro acesso a pessoa entra direto.

Exemplos:
```bash
node scripts/generate-tokens.js 50
node scripts/generate-tokens.js 30 2026-06-09
node scripts/generate-tokens.js 10 2027-01-01 https://meucasamento.com.br
```
O script imprime: (1) os tokens; (2) **os links prontos (URL + token)** para enviar; (3) o array JSON para colar em `validTokens` no `environment.prod.ts`.

**Fluxo:**

1. Rode o script com a URL do seu site e copie a seção **"Links para enviar"**.
2. Em **produção**, edite `src/environments/environment.prod.ts` e cole o array em `validTokens`.
3. Envie um link por WhatsApp para cada convidado (cada linha da seção é um link completo).
4. No **primeiro acesso**, a pessoa abre o link → o app valida o token, grava em **cookie e memória** (sessionStorage) e **redireciona para a home sem o token na URL** (o endereço fica limpo). Nos acessos seguintes, o token já está no navegador e ela entra direto sem precisar do link de novo (até expirar ou limpar dados do site).

**Tokens sem expiração:** se você colocar em `validTokens` um valor **sem ponto** (ex.: `convite-dev`), esse token não expira e vale para sempre.

**Em desenvolvimento:** o token `convite-dev` está em `environment.ts`; use `http://localhost:4200/?token=convite-dev` para testar.

**Persistência:** o token é salvo em **sessionStorage** e em **cookie** (path=/, SameSite=Lax). O cookie usa a data de expiração do token quando existir, ou 90 dias para tokens sem expiração. Assim o convidado pode fechar o navegador e voltar depois sem precisar do link de novo.

---

### Segurança — reserva de presentes

O app já inclui **proteções leves** no cliente:

- **Honeypot:** campo invisível no formulário; se for preenchido, o envio é ignorado (reduz bots automáticos).
- **Cooldown:** intervalo mínimo de 1 minuto entre reservas no mesmo navegador (sessionStorage).
- **Limite por nome:** cada nome pode reservar no máximo 3 presentes (evita uma pessoa reservar a lista toda).

Para **reduzir ainda mais** abusos e bots em produção:

| Opção | Descrição | Dificuldade |
|-------|-----------|-------------|
| **Firebase App Check** | Garante que as requisições vêm do seu app, não de scripts. Ative no Console e restrinja as regras do Firestore a `request.auth.token.firebase.sign_in_provider == 'anonymous'` ou use reCAPTCHA v3 como provider. | Média |
| **reCAPTCHA v3** | Verificação invisível; o token é validado em uma **Cloud Function** antes de gravar no Firestore. Bloqueia a maioria dos bots. | Média (exige Cloud Functions) |
| **Código do convite** | Exigir um código (ex.: no modal de reserva) para poder enviar. Quem não tem o código não reserva. Pode ser um valor fixo no `environment` ou um link com token. | Fácil |
| **Rate limit no backend** | Usar uma **Cloud Function** como proxy: a reserva é enviada à função, que valida reCAPTCHA, aplica rate limit por IP/identificador e então grava no Firestore. | Média/Alta |
| **Regras do Firestore** | Em produção, use `allow read: if true; allow write: if request.auth != null` (ou com App Check) para que apenas clientes autenticados/verificados gravem. | Fácil (com Auth ou App Check) |

Recomendação mínima para produção: ativar **App Check** (reCAPTCHA v3 ou reCAPTCHA Enterprise) e ajustar as regras do Firestore para exigir App Check ou Auth.

---

### Criar projeto (referência)
```bash
ng new wedding-cerimonia --routing --style=scss
cd wedding-cerimonia
