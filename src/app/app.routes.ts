import { Routes } from '@angular/router';
import { localeGuard } from './core/i18n/locale.guard';
import { Home } from './features/home/home';
import { NotFound } from './features/not-found/not-found';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'en' },
  {
    path: ':lang',
    canActivate: [localeGuard],
    children: [
      { path: '', component: Home },
      { path: '**', component: NotFound },
    ],
  },
];
