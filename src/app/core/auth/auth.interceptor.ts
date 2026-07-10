// src/app/core/auth/auth.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Subject, catchError, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthStorage } from './auth-storage';

// Module-level (not per-request) so N concurrent 401s share a single in-flight
// refresh instead of each rotating the refresh token and invalidating the others.
let isRefreshing = false;
const refreshed$ = new Subject<string>();

const AUTH_BOOTSTRAP_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(AuthStorage);
  const authService = inject(AuthService);

  const token = storage.getToken();
  const authedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authedReq).pipe(
    catchError((error: unknown) => {
      const isBootstrapCall = AUTH_BOOTSTRAP_PATHS.some((path) => req.url.includes(path));
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isBootstrapCall) {
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        authService.refreshAccessToken().subscribe({
          next: (res) => {
            isRefreshing = false;
            refreshed$.next(res.accessToken);
          },
          error: () => {
            isRefreshing = false;
            authService.logout();
            refreshed$.next(''); // wake up anyone waiting so they fail through, not hang
          },
        });
      }

      return refreshed$.pipe(
        take(1),
        switchMap((newToken) => {
          if (!newToken) return throwError(() => error);
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
        }),
      );
    }),
  );
};
