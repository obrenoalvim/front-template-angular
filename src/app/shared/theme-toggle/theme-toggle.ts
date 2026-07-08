// src/app/shared/theme-toggle/theme-toggle.ts
import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [TranslatePipe],
  templateUrl: './theme-toggle.html',
})
export class ThemeToggle {
  protected readonly themeService = inject(ThemeService);
}
