# Firebase em produção — passo a passo

Siga estes passos para colocar seu site no ar com Firebase (Firestore + Hosting).

---

## 1. Criar ou usar um projeto no Firebase

1. Acesse **[Firebase Console](https://console.firebase.google.com)** e faça login com sua conta Google.
2. Clique em **“Adicionar projeto”** (ou escolha um projeto existente).
3. **Nome do projeto:** por exemplo `casamento-jessica-roberto` (o nome pode ser alterado depois).
4. Se quiser, desative o Google Analytics para simplificar (não é obrigatório para o site).
5. Clique em **“Criar projeto”** e aguarde.

Anote o **ID do projeto** (ex.: `casamento-jessica-roberto` ou `dbcasamento-8a407`). Ele aparece no topo da página do projeto e nas configurações.

---

## 2. Ativar o Firestore (lista de presentes)

1. No menu lateral, clique em **“Build”** → **“Firestore Database”**.
2. Clique em **“Criar banco de dados”**.
3. Escolha **“Iniciar no modo de produção”** (as regras do seu projeto já permitem leitura/escrita para a lista de presentes; você pode ajustar depois).
4. Escolha um **local** (ex.: `southamerica-east1` para São Paulo).
5. Clique em **“Ativar”**.

---

## 3. Registrar o app Web e copiar a configuração

1. No menu lateral, clique no ícone de **engrenagem** → **“Configurações do projeto”**.
2. Role até **“Seus aplicativos”** e clique em **“</>” (Web)** para adicionar um app.
3. **Apelido do app:** por exemplo `Site Casamento`.
4. **Não** marque “Firebase Hosting” por enquanto (você fará o deploy pelo CLI).
5. Clique em **“Registrar app”**.
6. Na tela seguinte aparece um trecho de código com um objeto `firebaseConfig` contendo:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
7. **Copie esses valores** (você vai colar em `environment.prod.ts` no próximo passo).
8. Clique em **“Continuar no console”**.

---

## 4. Preencher o environment.prod.ts

1. Abra o arquivo **`src/environments/environment.prod.ts`** no projeto.
2. No objeto **`firebase`**, substitua cada placeholder pelos valores que você copiou do Firebase:

   - `apiKey` → valor de `apiKey`
   - `authDomain` → valor de `authDomain` (geralmente `SEU-PROJECT-ID.firebaseapp.com`)
   - `projectId` → valor de `projectId`
   - `storageBucket` → valor de `storageBucket` (geralmente `SEU-PROJECT-ID.appspot.com`)
   - `messagingSenderId` → valor de `messagingSenderId`
   - `appId` → valor de `appId`

3. Mantenha **`useEmulator: false`** e **`useLocalStorageForPresentes: false`** para usar o Firestore real em produção.
4. A lista **`validTokens`** pode permanecer como está (tokens que você já gerou) ou ser atualizada depois.

Salve o arquivo.

---

## 5. Vincular o projeto ao projeto local (Firebase CLI)

No terminal, na **pasta raiz do projeto** (onde está o `package.json`):

```bash
npx firebase-tools login
```

Abra o link que aparecer, autorize no navegador e volte ao terminal.

Depois:

```bash
npx firebase-tools use --add
```

- Escolha o **projeto** que você criou (ex.: `dbcasamento-8a407` ou o nome que aparecer).
- Quando pedir um “alias”, pressione Enter para usar o padrão.

Assim o comando `firebase deploy` usará esse projeto.

---

## 6. Fazer deploy das regras do Firestore

As regras em **`firestore.rules`** permitem leitura/escrita na coleção `presentes`. Para publicá-las:

```bash
npx firebase-tools deploy --only firestore:rules
```

Se aparecer algum aviso, confirme. Em seguida, o Firestore em produção estará usando essas regras.

---

## 7. Fazer deploy do site (Hosting)

1. Gere o build de produção:
   ```bash
   npm run build
   ```

2. Faça o deploy do Hosting:
   ```bash
   npx firebase-tools deploy --only hosting
   ```

   Ou use o script que já faz build + deploy:
   ```bash
   npm run deploy
   ```

3. No final, o Firebase mostra a **URL do site**, por exemplo:
   - `https://SEU-PROJECT-ID.web.app`
   - `https://SEU-PROJECT-ID.firebaseapp.com`

Use essa URL como base ao gerar os links com token (terceiro argumento do `generate-tokens.js`).

---

## Resumo rápido

| Etapa | Onde | O que fazer |
|-------|------|-------------|
| 1 | Firebase Console | Criar projeto (ou usar existente) |
| 2 | Firestore Database | Criar banco, modo produção, escolher região |
| 3 | Configurações do projeto → Seus apps | Adicionar app Web e copiar `firebaseConfig` |
| 4 | `src/environments/environment.prod.ts` | Colar apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId |
| 5 | Terminal | `npx firebase-tools login` e `npx firebase-tools use --add` |
| 6 | Terminal | `npx firebase-tools deploy --only firestore:rules` |
| 7 | Terminal | `npm run deploy` (ou `npm run build` + `npx firebase-tools deploy --only hosting`) |

Depois disso, o site estará no ar e a lista de presentes usará o Firestore em produção.
