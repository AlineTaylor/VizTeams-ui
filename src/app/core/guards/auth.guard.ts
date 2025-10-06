import { CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../../features/auth/login/login.component';

// TRack dialog instances to avoid repeated dialogs
let loginDialogOpen = false;

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthenticationService);

  if (authService.isLoggedIn()) {
    return true;
  }

  const dialog = inject(MatDialog);

  if (!loginDialogOpen) {
    loginDialogOpen = true;
    const ref = dialog.open(LoginComponent, {
      disableClose: true,
      width: '400px',
    });
    ref.afterClosed().subscribe(() => {
      loginDialogOpen = false;
      // Manual refresh/navigate away if a user logged in via dialog is still on a protected route that failed earlier
    });
  }

  return false; // block initial navigation until authenticated
};
