// src/app/core/i18n/locale-nav.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { LocaleNavService } from './locale-nav.service';
import { LocaleService } from './locale.service';

describe('LocaleNavService', () => {
  let service: LocaleNavService;
  let locale: LocaleService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTranslateService()],
    });
    service = TestBed.inject(LocaleNavService);
    locale = TestBed.inject(LocaleService);
  });

  it('path() prefixes the current locale', () => {
    expect(service.path('/login')).toBe('/en/login');
    locale.setLocale('pt');
    expect(service.path('/login')).toBe('/pt/login');
  });

  it('path() normalizes a path without a leading slash', () => {
    expect(service.path('login')).toBe('/en/login');
  });

  it('navigate() calls Router.navigateByUrl with the locale-prefixed path', async () => {
    const router = TestBed.inject(Router);
    const spy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    await service.navigate('/dashboard');
    expect(spy).toHaveBeenCalledWith('/en/dashboard', undefined);
  });
});
