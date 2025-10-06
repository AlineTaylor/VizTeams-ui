import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LandingComponent } from './landing/landing.component';

export const routes: Routes = [
	{
		path: 'teams',
		canActivate: [authGuard],
		loadComponent: () => import('./features/teams/teams-page/teams-page.component').then(c => c.TeamsPageComponent)
	},
	{ path: '', pathMatch: 'full', component: LandingComponent }
];
