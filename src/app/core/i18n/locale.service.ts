// src/app/core/i18n/locale.service.ts
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export const SUPPORTED_LOCALES = ['en', 'pt'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
const STORAGE_KEY = 'locale';

export function isSupportedLocale(value: string | null): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value ?? '');
}

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly locale = signal<Locale>(DEFAULT_LOCALE);

  constructor() {
    this.translate.addLangs(SUPPORTED_LOCALES as unknown as string[]);
    this.translate.setFallbackLang(DEFAULT_LOCALE);
    const stored = this.isBrowser() ? localStorage.getItem(STORAGE_KEY) : null;
    this.setLocale(isSupportedLocale(stored) ? stored : DEFAULT_LOCALE);
  }

  setLocale(locale: Locale): void {
    if (!isSupportedLocale(locale)) return;
    this.locale.set(locale);
    this.translate.use(locale);
    if (this.isBrowser()) localStorage.setItem(STORAGE_KEY, locale);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
