import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LocaleNavService } from '../i18n/locale-nav.service';

export const adminGuard: CanActivateFn = () => {
  // The role lives in the client-side JWT payload (see AuthService), which
  // SSR has no access to (same limitation authGuard documents) — so SSR
  // can't verify it and fails closed. The client re-runs this guard right
  // after hydration with the real answer.
  const isAdmin = isPlatformBrowser(inject(PLATFORM_ID))
    ? inject(AuthService).currentUser()?.role === 'admin'
    : false;

  if (isAdmin) return true;
  const nav = inject(LocaleNavService);
  return inject(Router).parseUrl(nav.path('/dashboard'));
};
