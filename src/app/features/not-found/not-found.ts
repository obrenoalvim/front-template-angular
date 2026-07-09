import { Component, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../core/seo/seo.service';
import { LocaleNavService } from '../../core/i18n/locale-nav.service';
import { Card } from '../../shared/ui/card/card';

@Component({
  selector: 'app-not-found',
  imports: [TranslatePipe, Card],
  templateUrl: './not-found.html',
})
export class NotFound {
  private readonly seo = inject(SeoService);
  private readonly translate = inject(TranslateService);
  private readonly nav = inject(LocaleNavService);

  constructor() {
    // See Home's constructor comment: get() (not instant()) so SeoService
    // never captures an untranslated key during SSR.
    this.translate.get(['notFound.title', 'notFound.description']).subscribe((t) => {
      this.seo.update({
        title: t['notFound.title'],
        description: t['notFound.description'],
        path: this.nav.path('/not-found'),
      });
    });
  }
}
