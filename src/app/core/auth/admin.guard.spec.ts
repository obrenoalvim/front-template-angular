import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { adminGuard } from './admin.guard';
import { AuthService } from './auth.service';

describe('adminGuard', () => {
  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  it('allows navigation for an admin user', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideTranslateService(),
        { provide: AuthService, useValue: { currentUser: signal({ role: 'admin' }) } },
      ],
    });
    expect(runGuard()).toBe(true);
  });

  it('redirects to the localized dashboard for a non-admin user', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideTranslateService(),
        { provide: AuthService, useValue: { currentUser: signal({ role: 'user' }) } },
      ],
    });
    const result = runGuard();
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.parseUrl('/en/dashboard'));
  });

  it('redirects to the localized dashboard when there is no user', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideTranslateService(),
        { provide: AuthService, useValue: { currentUser: signal(null) } },
      ],
    });
    const result = runGuard();
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.parseUrl('/en/dashboard'));
  });
});
