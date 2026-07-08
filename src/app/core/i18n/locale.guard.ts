// src/app/core/i18n/locale.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isSupportedLocale } from './locale.service';

export const localeGuard: CanActivateFn = (route) => {
  const lang = route.paramMap.get('lang');
  if (isSupportedLocale(lang)) return true;
  return inject(Router).parseUrl('/en');
};
