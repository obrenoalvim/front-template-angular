import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LocaleNavService } from '../i18n/locale-nav.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) return true;
  const nav = inject(LocaleNavService);
  return inject(Router).parseUrl(nav.path('/login'));
};
