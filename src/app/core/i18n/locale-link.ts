// src/app/core/i18n/locale-link.ts
import { Directive, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleNavService } from './locale-nav.service';

@Directive({
  selector: '[appLocaleLink]',
  hostDirectives: [{ directive: RouterLink, inputs: ['routerLink'] }],
})
export class LocaleLink {
  private readonly nav = inject(LocaleNavService);
  private readonly routerLink = inject(RouterLink);

  @Input({ required: true })
  set appLocaleLink(path: string) {
    this.routerLink.routerLink = this.nav.path(path);
  }
}
