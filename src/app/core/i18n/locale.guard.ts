// src/app/core/i18n/locale.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocaleService, isSupportedLocale } from './locale.service';

export const localeGuard: CanActivateFn = (route) => {
  const lang = route.paramMap.get('lang');
  if (!isSupportedLocale(lang)) return inject(Router).parseUrl('/en');
  // The URL's :lang segment is the source of truth for the active locale —
  // sync it into LocaleService on every navigation so LocaleLink/LocaleNavService
  // (which read LocaleService.locale(), not the route) build hrefs for the
  // locale actually being viewed instead of a stale localStorage value.
  inject(LocaleService).setLocale(lang);
  return true;
};
