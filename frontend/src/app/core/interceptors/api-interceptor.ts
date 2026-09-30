import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject, ApplicationRef } from '@angular/core';
import { catchError, switchMap, throwError, finalize } from 'rxjs';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

// Global timeout to debounce tick
let tickTimeout: any;

export const apiInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const appRef = inject(ApplicationRef);

  const token = authService.getAccessToken();
  const authReq = token ? req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${res.accessToken}`)
            });
            return next(retryReq);
          }),
          catchError(() => {
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    }),
    finalize(() => {
      if (tickTimeout) clearTimeout(tickTimeout);
      tickTimeout = setTimeout(() => {
        appRef.tick();
      }, 50);
    })
  );
};
