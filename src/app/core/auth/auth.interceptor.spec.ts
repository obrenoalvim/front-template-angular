import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthStorage } from './auth-storage';

describe('authInterceptor', () => {
  it('attaches a Bearer token when one is stored', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    jest.spyOn(TestBed.inject(AuthStorage), 'getToken').mockReturnValue('tok123');

    TestBed.inject(HttpClient).get('/anything').subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne('/anything');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok123');
  });

  it('does not add an Authorization header when there is no token', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    jest.spyOn(TestBed.inject(AuthStorage), 'getToken').mockReturnValue(null);

    TestBed.inject(HttpClient).get('/anything').subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne('/anything');
    expect(req.request.headers.has('Authorization')).toBe(false);
  });
});
