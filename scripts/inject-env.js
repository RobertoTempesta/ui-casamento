const fs = require('fs');
const path = require('path');

const env = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
};

const content = `export const environment = {
  production: true,
  useEmulator: false,
  useLocalStorageForPresentes: false,
  firebase: {
    apiKey: ${JSON.stringify(env.apiKey)},
    authDomain: ${JSON.stringify(env.authDomain)},
    projectId: ${JSON.stringify(env.projectId)},
    storageBucket: ${JSON.stringify(env.storageBucket)},
    messagingSenderId: ${JSON.stringify(env.messagingSenderId)},
    appId: ${JSON.stringify(env.appId)},
    measurementId: ${JSON.stringify(env.measurementId)}
  },
};
`;

const outPath = path.join(__dirname, '..', 'src', 'environments', 'environment.production.ts');
fs.writeFileSync(outPath, content, 'utf8');
console.log('Injected env into environment.production.ts');
