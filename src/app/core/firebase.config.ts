import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

let app: FirebaseApp;
let firestore: Firestore;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(environment.firebase);
  }
  return app;
}

export function getFirestoreInstance(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
    if (environment.useEmulator) {
      connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
    }
  }
  return firestore;
}
