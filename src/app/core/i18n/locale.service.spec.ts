// src/app/core/i18n/locale.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { LocaleService } from './locale.service';

describe('LocaleService', () => {
  let service: LocaleService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideTranslateService()],
    });
    service = TestBed.inject(LocaleService);
  });

  it('defaults to "en"', () => {
    expect(service.locale()).toBe('en');
  });

  it('setLocale updates the signal, ngx-translate, and localStorage', () => {
    const translate = TestBed.inject(TranslateService);
    service.setLocale('pt');
    expect(service.locale()).toBe('pt');
    expect(translate.currentLang()).toBe('pt');
    expect(localStorage.getItem('locale')).toBe('pt');
  });

  it('ignores unsupported locales', () => {
    // @ts-expect-error intentionally invalid input
    service.setLocale('fr');
    expect(service.locale()).toBe('en');
  });
});
