// src/app/core/i18n/locale.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';
import { localeGuard } from './locale.guard';

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
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
  });

  it('allows a supported locale', () => {
    expect(runGuard('pt')).toBe(true);
  });

  it('redirects an unsupported locale to /en', () => {
    const result = runGuard('fr');
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.parseUrl('/en'));
  });
});
