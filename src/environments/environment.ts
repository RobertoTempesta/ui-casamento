export const environment = {
  production: false,
  useEmulator: true,
  useLocalStorageForPresentes: true,
  /** Tokens válidos para acessar o site (um por convidado). Em produção, preencha com os tokens que você enviar por WhatsApp. */
  validTokens: 
  [
    "eeded3ca1875d8e246900f3b.1781049599",
    "337b3ca0ce97ded7fdb10d65.1781049599",
    "1443b85d08da2b5ce9ead150.1781049599",
    "f17a0614f8c369df5aa85f9b.1781049599",
    "a351af5fc33296f240575de9.1781049599"
  ],
  firebase: {
    apiKey: 'demo-key',
    authDomain: 'demo.firebaseapp.com',
    projectId: 'demo-project',
    storageBucket: 'demo.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef',
  },
};
