import { Routes } from '@angular/router';
import { localeGuard } from './core/i18n/locale.guard';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';
import { Home } from './features/home/home';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { Dashboard } from './features/dashboard/dashboard';
import { Account } from './features/account/account';
import { Notes } from './features/notes/notes';
import { Admin } from './features/admin/admin';
import { NotFound } from './features/not-found/not-found';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'en' },
  {
    path: ':lang',
    canActivate: [localeGuard],
    children: [
      { path: '', component: Home },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'forgot-password', component: ForgotPassword },
      { path: 'reset-password', component: ResetPassword },
      {
        path: '',
        canActivate: [authGuard],
        children: [
          { path: 'dashboard', component: Dashboard },
          { path: 'account', component: Account },
          { path: 'notes', component: Notes },
          { path: 'admin', component: Admin, canActivate: [adminGuard] },
        ],
      },
      { path: '**', component: NotFound },
    ],
  },
];
