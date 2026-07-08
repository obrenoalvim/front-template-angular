// src/app/core/theme/theme.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, provideZonelessChangeDetection } from '@angular/core';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  function create(matchesDark = false) {
    window.matchMedia = jest
      .fn()
      .mockReturnValue({ matches: matchesDark }) as unknown as typeof window.matchMedia;
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'browser' }],
    });
    return TestBed.inject(ThemeService);
  }

  it('defaults to light when no stored preference and prefers-color-scheme is light', () => {
    const service = create(false);
    expect(service.theme()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('defaults to dark when prefers-color-scheme is dark and nothing stored', () => {
    const service = create(true);
    expect(service.theme()).toBe('dark');
  });

  it('reads a stored preference over prefers-color-scheme', () => {
    localStorage.setItem('theme', 'dark');
    const service = create(false);
    expect(service.theme()).toBe('dark');
  });

  it('toggle() flips the theme, updates the DOM class, and persists', () => {
    const service = create(false);
    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
