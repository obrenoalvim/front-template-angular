import { Component, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/toast/toast.service';
import { LocaleLink } from '../../core/i18n/locale-link';
import { LocaleNavService } from '../../core/i18n/locale-nav.service';
import { LocaleSwitcher } from '../locale-switcher/locale-switcher';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-header',
  imports: [TranslatePipe, LocaleLink, LocaleSwitcher, ThemeToggle],
  templateUrl: './header.html',
})
export class Header {
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly nav = inject(LocaleNavService);
  private readonly translate = inject(TranslateService);

  logout(): void {
    this.auth.logout();
    this.toast.success(this.translate.instant('auth.toasts.logoutSuccess'));
    this.nav.navigate('/login');
  }
}
