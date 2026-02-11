import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { getFirebaseApp } from './app/core/firebase.config';

// Inicializa Firebase ao carregar o app
getFirebaseApp();

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
