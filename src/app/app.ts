import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { LocaleService, isSupportedLocale } from './core/i18n/locale.service';
import { ToastContainer } from './shared/ui/toast/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  private readonly locale = inject(LocaleService);

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      const segment = this.router.url.split('/')[1]?.split('?')[0];
      if (isSupportedLocale(segment)) this.locale.setLocale(segment);
    });
  }
}
