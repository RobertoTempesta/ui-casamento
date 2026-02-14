#!/usr/bin/env node
/**
 * Cria e popula as collections no Firestore:
 *   - presentes: lista inicial de presentes (mesma do app)
 *   - tokens: tokens de convite (formato: random.expUnix)
 *
 * Uso:
 *   node scripts/seed-firestore.js [comando] [opções]
 *
 * Comandos:
 *   presentes   — apenas collection presentes
 *   tokens      — apenas collection tokens (gera quantidade com data de expiração)
 *   all         — ambas (padrão)
 *
 * Opções para "tokens":
 *   --quantidade=N   (padrão: 50)
 *   --expira=YYYY-MM-DD   (padrão: 2026-06-09)
 *
 * Ambiente:
 *   GOOGLE_APPLICATION_CREDENTIALS  — caminho do JSON da service account (produção)
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080  — usa emulador local
 *
 * Exemplos:
 *   node scripts/seed-firestore.js
 *   node scripts/seed-firestore.js presentes
 *   node scripts/seed-firestore.js tokens --quantidade=30 --expira=2026-06-09
 *   set FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 && node scripts/seed-firestore.js all
 */

const admin = require('firebase-admin');
const crypto = require('crypto');

// ——— Parse args ———
const args = process.argv.slice(2);
let comando = 'all';
let quantidadeTokens = 50;
let dataExpira = '2026-06-09';

for (const a of args) {
  if (a === 'presentes' || a === 'tokens' || a === 'all') comando = a;
  else if (a.startsWith('--quantidade=')) quantidadeTokens = Math.max(1, parseInt(a.split('=')[1], 10) || 50);
  else if (a.startsWith('--expira=')) dataExpira = a.split('=')[1] || dataExpira;
}

// ——— Lista de presentes (igual ao PresentesService) ———
const PRESENTES_INICIAIS = [
  { nome: 'Forno Elétrico', descricao: 'Forno elétrico de embutir ou de mesa.' },
  { nome: 'Cooktop por indução', descricao: 'Cooktop 4 bocas por indução, vitrocerâmico.' },
  { nome: 'Jogo de panela por indução Brinox ceramic Vanilla', descricao: 'Jogo de panelas antiaderentes compatível com indução, linha Ceramic Vanilla.' },
  { nome: 'Bebedouro IBBL', descricao: 'Bebedouro elétrico com filtro e resfriamento.' },
  { nome: 'Jogo de talheres', descricao: 'Jogo de talheres em inox (24 peças ou 44 peças).' },
  { nome: 'Jogo de facas', descricao: 'Jogo de facas de cozinha em aço inox com suporte.' },
  { nome: 'Jogo de copos', descricao: 'Jogo de copos em vidro ou cristal.' },
  { nome: 'Jogo de potes de vidro', descricao: 'Conjunto de potes herméticos de vidro para armazenar alimentos.' },
  { nome: 'Aspirador de pó', descricao: 'Aspirador de pó vertical.' },
  { nome: 'Jogo de toalhas de banho', descricao: 'Conjunto de toalhas de banho e rosto (frio ou fricção).' },
  { nome: 'Banquetas de madeira', descricao: 'Par de banquetas altas para balcão ou ilha.' },
  { nome: 'Ferro de passar', descricao: 'Ferro de passar roupa a vapor ou central de vapor.' },
  { nome: 'Tanquinho', descricao: 'Máquina de lavar roupas semiautomática (tanquinho).' },
  { nome: 'Panela de pressão', descricao: 'Panela de pressão em inox, 6 ou 8 litros.' },
  { nome: 'Batedeira', descricao: 'Batedeira planetária ou batedeira de mesa.' },
  { nome: 'Jogo de assadeiras', descricao: 'Conjunto de assadeiras e formas para forno (vidro ou antiaderente).' },
  { nome: 'Jogo de jantar', descricao: 'Jogo de jantar (pratos, tigelas e travessas) para 6 ou 12 pessoas.' },
  { nome: 'Jogo de pratos', descricao: 'Jogo de pratos rasos e fundos em porcelana ou cerâmica.' },
];

function initFirebase() {
  if (admin.apps.length > 0) return admin.firestore();

  // Emulador: não precisa de credenciais
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'demo-project' });
    return admin.firestore();
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    const path = require('path');
    const fullPath = path.isAbsolute(credPath) ? credPath : path.resolve(process.cwd(), credPath);
    admin.initializeApp({ credential: admin.credential.cert(require(fullPath)) });
  } else {
    try {
      admin.initializeApp();
    } catch (e) {
      console.error(
        'Configure GOOGLE_APPLICATION_CREDENTIALS com o caminho do JSON da service account (Firebase Console → Configurações do projeto → Contas de serviço).'
      );
      process.exit(1);
    }
  }
  return admin.firestore();
}

function gerarTokens(quantidade, dataExp) {
  const [y, m, d] = dataExp.split('-').map(Number);
  if (!y || !m || !d) throw new Error('Data inválida. Use YYYY-MM-DD.');
  const expDate = new Date(Date.UTC(y, m - 1, d, 23, 59, 59));
  const expUnix = Math.floor(expDate.getTime() / 1000);
  const tokens = [];
  for (let i = 0; i < quantidade; i++) {
    const random = crypto.randomBytes(12).toString('hex');
    tokens.push({ token: `${random}.${expUnix}`, expiraEm: expUnix });
  }
  return tokens;
}

async function seedPresentes(db) {
  const col = db.collection('presentes');
  const snapshot = await col.limit(1).get();
  if (!snapshot.empty) {
    console.log('Collection "presentes" já contém documentos. Nada a fazer.');
    return;
  }
  const batch = db.batch();
  for (const p of PRESENTES_INICIAIS) {
    const ref = col.doc();
    const data = { nome: p.nome, reservado: false };
    if (p.descricao) data.descricao = p.descricao;
    if (p.valor != null) data.valor = p.valor;
    batch.set(ref, data);
  }
  await batch.commit();
  console.log('Collection "presentes" criada com', PRESENTES_INICIAIS.length, 'documentos.');
}

async function seedTokens(db) {
  const col = db.collection('tokens');
  const tokens = gerarTokens(quantidadeTokens, dataExpira);
  const batch = db.batch();
  for (const t of tokens) {
    const ref = col.doc();
    batch.set(ref, {
      token: t.token,
      expiraEm: t.expiraEm,
      usado: false,
    });
  }
  await batch.commit();
  console.log('Collection "tokens" criada com', tokens.length, 'documentos (expiração:', dataExpira, ').');
  console.log('Exemplo de token:', tokens[0].token);
}

async function main() {
  const db = initFirebase();
  if (comando === 'presentes' || comando === 'all') await seedPresentes(db);
  if (comando === 'tokens' || comando === 'all') await seedTokens(db);
  console.log('Concluído.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
