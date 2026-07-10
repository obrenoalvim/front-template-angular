import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { AuthStorage } from './auth-storage';
import { API_BASE_URL } from '../config/app-tokens';

describe('authInterceptor', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://api.example.com' },
      ],
    });
    return {
      http: TestBed.inject(HttpClient),
      httpMock: TestBed.inject(HttpTestingController),
      storage: TestBed.inject(AuthStorage),
      authService: TestBed.inject(AuthService),
    };
  }

  it('attaches a Bearer token when one is stored', () => {
    const { http, httpMock, storage } = setup();
    jest.spyOn(storage, 'getToken').mockReturnValue('tok123');

    http.get('/anything').subscribe();
    const req = httpMock.expectOne('/anything');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok123');
    req.flush({});
  });

  it('does not add an Authorization header when there is no token', () => {
    const { http, httpMock, storage } = setup();
    jest.spyOn(storage, 'getToken').mockReturnValue(null);

    http.get('/anything').subscribe();
    const req = httpMock.expectOne('/anything');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('on a 401, refreshes once and retries the original request with the new token', () => {
    const { http, httpMock, storage } = setup();
    jest.spyOn(storage, 'getToken').mockReturnValue('expired-token');
    jest.spyOn(storage, 'getRefreshToken').mockReturnValue('refresh-token-1');

    let result: unknown;
    http.get('/protected').subscribe((res) => (result = res));

    httpMock
      .expectOne('/protected')
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    httpMock
      .expectOne((r) => r.url.includes('/auth/refresh'))
      .flush({ accessToken: 'new-token', refreshToken: 'new-refresh' });

    const retried = httpMock.expectOne('/protected');
    expect(retried.request.headers.get('Authorization')).toBe('Bearer new-token');
    retried.flush({ ok: true });

    expect(result).toEqual({ ok: true });
  });

  it('logs out and propagates the error when the refresh itself fails', () => {
    const { http, httpMock, storage, authService } = setup();
    jest.spyOn(storage, 'getToken').mockReturnValue('expired-token');
    jest.spyOn(storage, 'getRefreshToken').mockReturnValue('dead-refresh-token');
    const logoutSpy = jest.spyOn(authService, 'logout').mockImplementation(() => undefined);

    let caughtError: unknown;
    http.get('/protected').subscribe({ error: (err: unknown) => (caughtError = err) });

    httpMock
      .expectOne('/protected')
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    httpMock
      .expectOne((r) => r.url.includes('/auth/refresh'))
      .flush({ message: 'Invalid refresh token' }, { status: 401, statusText: 'Unauthorized' });

    expect(logoutSpy).toHaveBeenCalled();
    expect(caughtError).toBeTruthy();
  });
});
