import { Routes } from '@angular/router';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import("./features/auth/login/login.component").then((c) => c.LoginComponent),
    canActivate: [noAuthGuard]
  }
];
