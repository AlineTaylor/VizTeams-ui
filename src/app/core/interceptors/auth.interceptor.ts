import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Observable } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthenticationService);
  const token = sessionStorage.getItem('token');

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq).pipe(
      // Notes: On any 401, force logout to clear stale/expired tokens
      // Delay import to avoid adding rxjs import if not necessary here
      // Using inline tap/catchError to keep this compact
      // eslint-disable-next-line rxjs/no-ignored-error
      (source) =>
        new Observable((observer) => {
          const subscription = source.subscribe({
            next: (v) => observer.next(v),
            error: (err: any) => {
              if (err instanceof HttpErrorResponse && err.status === 401) {
                auth.logout('unauthorized');
              }
              observer.error(err);
            },
            complete: () => observer.complete(),
          });
          return () => subscription.unsubscribe();
        })
    );
  }

  return next(req);
};
