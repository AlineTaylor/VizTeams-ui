import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LandingComponent } from './layout/landing/landing.component';

export const routes: Routes = [
  {
    path: 'teams',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/teams/teams-page/teams-page.component').then(
        (c) => c.TeamsPageComponent
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component').then(
        (c) => c.ContactComponent
      ),
  },
  { path: '', pathMatch: 'full', component: LandingComponent },
];
