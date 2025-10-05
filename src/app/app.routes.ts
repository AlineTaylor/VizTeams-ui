import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{
		path: 'teams',
		canActivate: [authGuard],
		loadComponent: () => import('./features/teams/teams-page/teams-page.component').then(c => c.TeamsPageComponent)
	},
	{ path: '', pathMatch: 'full', redirectTo: 'teams' }
];
