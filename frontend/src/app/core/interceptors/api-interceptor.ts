import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject, ApplicationRef } from '@angular/core';
import { catchError, switchMap, throwError, finalize } from 'rxjs';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

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
      // Force global change detection when the HTTP request finishes.
      // This ensures all pages update instantly regardless of Zone.js issues.
      setTimeout(() => appRef.tick(), 10);
    })
  );
};
