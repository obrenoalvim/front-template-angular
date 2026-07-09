// src/app/core/auth/auth-storage.ts
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { User } from './auth.service';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
export const SESSION_COOKIE = 'has_session';

@Injectable({ providedIn: 'root' })
export class AuthStorage {
  private readonly platformId = inject(PLATFORM_ID);

  getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(TOKEN_KEY) : null;
  }

  getUser(): User | null {
    if (!this.isBrowser()) return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  setSession(token: string, user: User): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // A tiny non-HttpOnly marker cookie (never the JWT itself) so authGuard
    // can tell during SSR that *some* session exists — SSR has no access to
    // localStorage, so without this an authenticated user hitting a
    // protected route directly (a fresh navigation, e.g. a page refresh)
    // gets server-rendered as logged-out and incorrectly redirected to
    // /login, even though the client-side session is perfectly valid.
    document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  }

  clear(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
