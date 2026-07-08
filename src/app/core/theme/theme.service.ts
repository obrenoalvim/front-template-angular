// src/app/core/theme/theme.service.ts
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly theme = signal<Theme>(this.initialTheme());

  constructor() {
    // ponytail: applied imperatively (not via effect()) because a root-injector
    // effect() only flushes on the zoneless scheduler's microtask/tick, not
    // synchronously on signal.set() — this must apply synchronously with toggle().
    this.applyTheme(this.theme());
  }

  toggle(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.applyTheme(next);
  }

  private applyTheme(value: Theme): void {
    if (!this.isBrowser()) return;
    document.documentElement.classList.toggle('dark', value === 'dark');
    localStorage.setItem(STORAGE_KEY, value);
  }

  private initialTheme(): Theme {
    if (!this.isBrowser()) return 'light';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
