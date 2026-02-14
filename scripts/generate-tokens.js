#!/usr/bin/env node
/**
 * Gera tokens de convite com tempo de expiração.
 * Formato do token: <random>.<unix_timestamp_exp>
 *
 * Uso:
 *   node scripts/generate-tokens.js [quantidade] [data-expiração] [URL-base]
 *
 * Exemplos:
 *   node scripts/generate-tokens.js 50
 *   node scripts/generate-tokens.js 30 2026-06-09
 *   node scripts/generate-tokens.js 10 2027-01-01 https://meucasamento.com.br
 *
 * URL-base: usada na seção "Links para enviar"; se omitida, usa placeholder.
 * Data padrão: 09/06/2026.
 */

const crypto = require('crypto');

const quantidade = parseInt(process.argv[2], 10) || 50;
const dataExp = process.argv[3] || '2026-06-09';
const baseUrl = (process.argv[4] || 'https://SEU-SITE.com').replace(/\/$/, '');

const [y, m, d] = dataExp.split('-').map(Number);
if (!y || !m || !d) {
  console.error('Data inválida. Use YYYY-MM-DD (ex.: 2026-06-09).');
  process.exit(1);
}
const expDate = new Date(Date.UTC(y, m - 1, d, 23, 59, 59));
const expUnix = Math.floor(expDate.getTime() / 1000);

const tokens = [];
for (let i = 0; i < quantidade; i++) {
  const random = crypto.randomBytes(12).toString('hex');
  tokens.push(`${random}.${expUnix}`);
}

console.log('# Tokens (válidos até', dataExp, 'inclusive)\n');
tokens.forEach((t) => console.log(t));

console.log('\n# Links para enviar (URL + token) — no primeiro acesso a pessoa entra direto e o token some da URL\n');
tokens.forEach((t, i) => {
  console.log(`${baseUrl}/?token=${t}`);
});

console.log('\n# Para usar no site: adicione ao Firestore com npm run seed-firestore tokens (ou use a lista acima para popular a collection "tokens").\n');
