// src/app/shared/locale-switcher/locale-switcher.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LocaleService, SUPPORTED_LOCALES } from '../../core/i18n/locale.service';

@Component({
  selector: 'app-locale-switcher',
  templateUrl: './locale-switcher.html',
})
export class LocaleSwitcher {
  private readonly router = inject(Router);
  protected readonly locales = SUPPORTED_LOCALES;
  protected readonly locale = inject(LocaleService);

  switchTo(next: (typeof SUPPORTED_LOCALES)[number]): void {
    const current = this.locale.locale();
    this.locale.setLocale(next);
    const rest = this.router.url.slice(`/${current}`.length) || '/';
    this.router.navigateByUrl(`/${next}${rest}`);
  }
}
