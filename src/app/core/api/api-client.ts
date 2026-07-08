// src/app/core/api/api-client.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/app-tokens';
import { ApiError } from './api-error';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get<T>(path: string, params?: Record<string, string | number>): Observable<T> {
    return this.http
      .get<T>(this.url(path), { params })
      .pipe(catchError((err: unknown) => this.normalize(err)));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(this.url(path), body)
      .pipe(catchError((err: unknown) => this.normalize(err)));
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .patch<T>(this.url(path), body)
      .pipe(catchError((err: unknown) => this.normalize(err)));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<T>(this.url(path))
      .pipe(catchError((err: unknown) => this.normalize(err)));
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private normalize(err: unknown): Observable<never> {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as unknown;
      const message =
        body && typeof body === 'object' && 'message' in body
          ? String((body as { message?: unknown }).message)
          : err.message || 'Unexpected error';
      return throwError(() => new ApiError(err.status, message, body));
    }
    return throwError(() => new ApiError(0, 'Network error', err));
  }
}
