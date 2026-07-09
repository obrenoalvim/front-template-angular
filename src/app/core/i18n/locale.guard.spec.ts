// src/app/core/i18n/locale.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { localeGuard } from './locale.guard';
import { LocaleService } from './locale.service';

function runGuard(lang: string | null) {
  return TestBed.runInInjectionContext(() =>
    localeGuard(
      { paramMap: { get: () => lang } } as unknown as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
    ),
  );
}

describe('localeGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTranslateService()],
    });
  });

  it('allows a supported locale', () => {
    expect(runGuard('pt')).toBe(true);
  });

  it("syncs LocaleService to the URL's :lang segment, not a stale stored value", () => {
    const locale = TestBed.inject(LocaleService);
    locale.setLocale('pt');

    runGuard('en');

    expect(locale.locale()).toBe('en');
  });

  it('redirects an unsupported locale to /en', () => {
    const result = runGuard('fr');
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.parseUrl('/en'));
  });
});
