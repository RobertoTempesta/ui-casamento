import { Routes } from '@angular/router';
import { tokenGuard } from './core/token.guard';
import { EntrarComponent } from './pages/entrar/entrar.component';
import { HomeComponent } from './pages/home/home.component';
import { CerimoniaComponent } from './pages/cerimonia/cerimonia.component';
import { PresentesComponent } from './pages/presentes/presentes.component';
import { AdminPresentesComponent } from './pages/admin-presentes/admin-presentes.component';
import { FotosComponent } from './pages/fotos/fotos.component';
import { RsvpComponent } from './pages/rsvp/rsvp.component';
import { FaqComponent } from './pages/faq/faq.component';

export const routes: Routes = [
  { path: 'entrar', component: EntrarComponent },
  { path: '', component: HomeComponent, canActivate: [tokenGuard] },
  { path: 'cerimonia', component: CerimoniaComponent, canActivate: [tokenGuard] },
  { path: 'presentes', component: PresentesComponent, canActivate: [tokenGuard] },
  { path: 'presentes/admin', component: AdminPresentesComponent, canActivate: [tokenGuard] },
  { path: 'fotos', component: FotosComponent, canActivate: [tokenGuard] },
  { path: 'rsvp', component: RsvpComponent, canActivate: [tokenGuard] },
  { path: 'faq', component: FaqComponent, canActivate: [tokenGuard] },
  { path: '**', redirectTo: '' },
];
