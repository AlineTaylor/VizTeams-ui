import { CanActivateFn, RouterStateSnapshot, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../../features/auth/login/login.component';

// TRack dialog instances to avoid repeated dialogs
let loginDialogOpen = false;

export const authGuard: CanActivateFn = (route, state: RouterStateSnapshot) => {
  const authService = inject(AuthenticationService);

  if (authService.isLoggedIn()) {
    return true;
  }

  const dialog = inject(MatDialog);
  const router = inject(Router);

  if (!loginDialogOpen) {
    // store intended route so teams layout page is automatically displayed without needing to manually refresh
    authService.setPendingRedirect(state.url || '/teams');
    loginDialogOpen = true;
    const ref = dialog.open(LoginComponent);
    ref.afterClosed().subscribe(() => {
      loginDialogOpen = false;
      // Manual refresh/navigate away if a user logged in via dialog is still on a protected route that failed earlier
      // If user closes dialog without authenticating, send them to landing page
      if (!authService.isLoggedIn()) {
        router.navigate(['/']);
      }
    });
  }

  return false; // block initial navigation until authenticated
};
