import { Component, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../core/seo/seo.service';
import { LocaleNavService } from '../../core/i18n/locale-nav.service';
import { Card } from '../../shared/ui/card/card';

@Component({
  selector: 'app-home',
  imports: [TranslatePipe, Card],
  templateUrl: './home.html',
})
export class Home {
  private readonly seo = inject(SeoService);
  private readonly translate = inject(TranslateService);
  private readonly nav = inject(LocaleNavService);

  constructor() {
    // `instant()` reads synchronously from whatever translations happen to be
    // loaded *right now* — during SSR the HTTP-loaded en.json/pt.json haven't
    // resolved yet when this constructor runs, so it silently returns the raw
    // keys ("home.title") instead of the translated text, and SeoService
    // captures that wrong value permanently. `get()` waits for the actual
    // translation to be ready before updating the tags.
    this.translate.get(['home.title', 'home.description']).subscribe((t) => {
      this.seo.update({
        title: t['home.title'],
        description: t['home.description'],
        path: this.nav.path('/'),
      });
    });
  }
}
