import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthStorage } from './auth-storage';
import { API_BASE_URL } from '../config/app-tokens';

// A minimal, unsigned JWT: header.payload.signature, base64url-encoded.
// Good enough to exercise decodeJwtPayload without pulling in a real signer.
function fakeJwt(payload: object): string {
  const base64url = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${base64url({ alg: 'none' })}.${base64url(payload)}.sig`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://api.example.com' },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts unauthenticated with no stored session', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('login() decodes the accessToken, stores the session, and updates currentUser', () => {
    const token = fakeJwt({ sub: 'user-1', email: 'a@b.com' });

    service.login('a@b.com', 'password123').subscribe();
    httpMock.expectOne('https://api.example.com/auth/login').flush({ accessToken: token });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual({ id: 'user-1', email: 'a@b.com' });
    expect(TestBed.inject(AuthStorage).getToken()).toBe(token);
  });

  it('register() posts email/password and does not auto-authenticate (no token in the response)', () => {
    service.register('a@b.com', 'password123').subscribe();
    const req = httpMock.expectOne('https://api.example.com/auth/register');
    expect(req.request.body).toEqual({ email: 'a@b.com', password: 'password123' });
    req.flush({ id: 'user-1', email: 'a@b.com' });

    expect(service.isAuthenticated()).toBe(false);
  });

  it('deleteAccount() sends the password in the DELETE body and logs out on success', () => {
    const token = fakeJwt({ sub: 'user-1', email: 'a@b.com' });
    service.login('a@b.com', 'password123').subscribe();
    httpMock.expectOne('https://api.example.com/auth/login').flush({ accessToken: token });

    service.deleteAccount('password123').subscribe();
    const req = httpMock.expectOne('https://api.example.com/account');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({ password: 'password123' });
    req.flush({ deleted: true });

    expect(service.isAuthenticated()).toBe(false);
    expect(TestBed.inject(AuthStorage).getToken()).toBeNull();
  });

  it('logout() clears the session', () => {
    const token = fakeJwt({ sub: 'user-1', email: 'a@b.com' });
    service.login('a@b.com', 'password123').subscribe();
    httpMock.expectOne('https://api.example.com/auth/login').flush({ accessToken: token });

    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(TestBed.inject(AuthStorage).getToken()).toBeNull();
  });
});
