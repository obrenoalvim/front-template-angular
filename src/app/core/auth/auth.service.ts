// src/app/core/auth/auth.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiClient } from '../api/api-client';
import { AuthStorage } from './auth-storage';

export interface User {
  id: string;
  email: string;
}

// back-template-nest's real contract (verified against src/auth/auth.service.ts
// and src/auth/dto/*): register returns the created user with NO token (email
// verification is separate, login is a distinct step); login returns ONLY an
// accessToken, no user object. There is no `name` field on the User model and
// no endpoint to fetch/update a display name yet — updateProfile() is
// intentionally not implemented here until a real endpoint exists.
interface RegisterResponse {
  id: string;
  email: string;
}

interface LoginResponse {
  accessToken: string;
}

interface JwtPayload {
  sub: string;
  email: string;
}

function decodeJwtPayload(token: string): JwtPayload {
  const payloadSegment = token.split('.')[1];
  // atob is available in both the browser and Angular's Node SSR runtime.
  const json = atob(payloadSegment.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(json) as JwtPayload;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);
  private readonly storage = inject(AuthStorage);
  readonly currentUser = signal<User | null>(this.storage.getUser());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  login(email: string, password: string): Observable<User> {
    return this.api.post<LoginResponse>('/auth/login', { email, password }).pipe(
      map((res) => {
        const payload = decodeJwtPayload(res.accessToken);
        const user: User = { id: payload.sub, email: payload.email };
        this.storage.setSession(res.accessToken, user);
        this.currentUser.set(user);
        return user;
      }),
    );
  }

  register(email: string, password: string): Observable<RegisterResponse> {
    return this.api.post<RegisterResponse>('/auth/register', { email, password });
  }

  forgotPassword(email: string): Observable<{ sent: true }> {
    return this.api.post<{ sent: true }>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ reset: true }> {
    return this.api.post<{ reset: true }>('/auth/reset-password', { token, newPassword });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ changed: true }> {
    return this.api.patch<{ changed: true }>('/account/password', {
      currentPassword,
      newPassword,
    });
  }

  deleteAccount(password: string): Observable<{ deleted: true }> {
    return this.api
      .delete<{ deleted: true }>('/account', { password })
      .pipe(tap(() => this.logout()));
  }

  logout(): void {
    this.storage.clear();
    this.currentUser.set(null);
  }
}
