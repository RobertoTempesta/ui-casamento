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

1. Crie um projeto em [Firebase Console](https://console.firebase.google.com)
2. Ative o **Firestore Database**
3. Copie as credenciais (Configurações do projeto → Seus apps)
4. Edite `src/environments/environment.prod.ts` com suas credenciais
5. Em `environment.ts`, para usar produção localmente: `useEmulator: false` e preencha as credenciais reais
6. Faça deploy das regras: `firebase deploy --only firestore:rules`

---

### Criar projeto (referência)
```bash
ng new wedding-cerimonia --routing --style=scss
cd wedding-cerimonia
