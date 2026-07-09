import { PLATFORM_ID, REQUEST, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SESSION_COOKIE } from './auth-storage';
import { LocaleNavService } from '../i18n/locale-nav.service';

export const authGuard: CanActivateFn = () => {
  // SSR has no access to localStorage (where the real session lives), so
  // AuthService.isAuthenticated() is always false there. Without this
  // branch, an authenticated user hitting a protected route directly (a
  // fresh navigation — typing the URL, or refreshing the page) would be
  // server-rendered as logged-out and wrongly redirected, even though their
  // client-side session is perfectly valid. On the server we instead check
  // the lightweight `has_session` marker cookie (see auth-storage.ts) sent
  // with the incoming request.
  const authenticated = isPlatformBrowser(inject(PLATFORM_ID))
    ? inject(AuthService).isAuthenticated()
    : hasSessionCookie(inject(REQUEST, { optional: true }));

  if (authenticated) return true;
  const nav = inject(LocaleNavService);
  return inject(Router).parseUrl(nav.path('/login'));
};

function hasSessionCookie(request: Request | null): boolean {
  if (!request) return false;
  const cookie = request.headers.get('cookie') ?? '';
  return cookie.split(';').some((part) => part.trim().startsWith(`${SESSION_COOKIE}=1`));
}
