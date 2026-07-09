import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  it('allows navigation when authenticated', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideTranslateService(),
        { provide: AuthService, useValue: { isAuthenticated: signal(true) } },
      ],
    });
    expect(runGuard()).toBe(true);
  });

  it('redirects to the localized login page when not authenticated', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideTranslateService(),
        { provide: AuthService, useValue: { isAuthenticated: signal(false) } },
      ],
    });
    const result = runGuard();
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.parseUrl('/en/login'));
  });
});
