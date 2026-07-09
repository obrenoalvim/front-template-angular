// src/app/core/auth/auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthStorage } from './auth-storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStorage).getToken();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
