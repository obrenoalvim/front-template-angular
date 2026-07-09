import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { Login } from './login';
import { API_BASE_URL } from '../../../core/config/app-tokens';
import { ToastService } from '../../../core/toast/toast.service';

// Same minimal unsigned-JWT helper as auth.service.spec.ts — good enough to
// exercise AuthService.login()'s client-side payload decode.
function fakeJwt(payload: object): string {
  const base64url = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${base64url({ alg: 'none' })}.${base64url(payload)}.sig`;
}

describe('Login', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        // A wildcard route is required: LocaleNavService.navigate() calls
        // router.navigateByUrl(), which rejects (crashing the test process via
        // an unhandled rejection, not just failing the assertion) if no route
        // matches — `provideRouter([])` alone isn't enough once a component
        // actually navigates somewhere on success.
        provideRouter([{ path: '**', component: Login }]),
        provideTranslateService(),
        { provide: API_BASE_URL, useValue: 'https://api.example.com' },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('disables submit until the form is valid', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.valid).toBe(false);
  });

  it('calls AuthService.login and shows a success toast on submit', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const toast = TestBed.inject(ToastService);
    const successSpy = jest.spyOn(toast, 'success');

    fixture.componentInstance.form.setValue({ email: 'a@b.com', password: 'password123' });
    fixture.componentInstance.submit();

    httpMock
      .expectOne('https://api.example.com/auth/login')
      .flush({ accessToken: fakeJwt({ sub: '1', email: 'a@b.com' }) });

    expect(successSpy).toHaveBeenCalled();
  });

  it('shows an error toast when login fails', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const toast = TestBed.inject(ToastService);
    const errorSpy = jest.spyOn(toast, 'error');

    fixture.componentInstance.form.setValue({ email: 'a@b.com', password: 'wrongpassword' });
    fixture.componentInstance.submit();

    httpMock
      .expectOne('https://api.example.com/auth/login')
      .flush(
        { error: { message: 'Invalid credentials' } },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(errorSpy).toHaveBeenCalled();
  });
});
