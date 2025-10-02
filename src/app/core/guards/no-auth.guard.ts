import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { inject } from '@angular/core';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService)
  const router = inject(Router)

  if(authService.isLoggedIn()) {
    router.navigate(['/'])
    return false;
  } else {
    // if the user is not logged in, it will allow them to go to the login page
    return true;
  }
};
