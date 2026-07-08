// src/app/core/api/api-client.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiClient } from './api-client';
import { ApiError } from './api-error';
import { API_BASE_URL } from '../config/app-tokens';

describe('ApiClient', () => {
  let client: ApiClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://api.example.com' },
      ],
    });
    client = TestBed.inject(ApiClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('prefixes GET requests with the base URL', () => {
    client.get<{ id: string }>('/notes').subscribe();
    const req = httpMock.expectOne('https://api.example.com/notes');
    expect(req.request.method).toBe('GET');
    req.flush({ id: '1' });
  });

  it('normalizes HTTP error responses into an ApiError', (done) => {
    client.get('/notes').subscribe({
      error: (err: unknown) => {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).status).toBe(404);
        expect((err as ApiError).message).toBe('Not found');
        done();
      },
    });
    const req = httpMock.expectOne('https://api.example.com/notes');
    req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
  });

  it('normalizes network errors (status 0) into an ApiError', (done) => {
    client.get('/notes').subscribe({
      error: (err: unknown) => {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).status).toBe(0);
        done();
      },
    });
    const req = httpMock.expectOne('https://api.example.com/notes');
    req.error(new ProgressEvent('network error'));
  });
});
