// src/app/core/i18n/locale-nav.service.ts
import { Injectable, inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { LocaleService } from './locale.service';

@Injectable({ providedIn: 'root' })
export class LocaleNavService {
  private readonly router = inject(Router);
  private readonly locale = inject(LocaleService);

  path(path: string): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `/${this.locale.locale()}${normalized}`;
  }

  navigate(path: string, extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigateByUrl(this.path(path), extras);
  }
}
