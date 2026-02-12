import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CerimoniaComponent } from './pages/cerimonia/cerimonia.component';
import { PresentesComponent } from './pages/presentes/presentes.component';
import { AdminPresentesComponent } from './pages/admin-presentes/admin-presentes.component';
import { FotosComponent } from './pages/fotos/fotos.component';
import { RsvpComponent } from './pages/rsvp/rsvp.component';
import { FaqComponent } from './pages/faq/faq.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cerimonia', component: CerimoniaComponent },
  { path: 'presentes', component: PresentesComponent },
  { path: 'presentes/admin', component: AdminPresentesComponent },
  { path: 'fotos', component: FotosComponent },
  // { path: 'rsvp', component: RsvpComponent },
  // { path: 'faq', component: FaqComponent },
  { path: '**', redirectTo: '' },
];
