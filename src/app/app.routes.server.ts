import { RenderMode, ServerRoute } from '@angular/ssr';
import { SUPPORTED_LOCALES } from './core/i18n/locale.service';

export const serverRoutes: ServerRoute[] = [
  {
    path: ':lang',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve(SUPPORTED_LOCALES.map((lang) => ({ lang }))),
  },
  {
    // Catch-all for any route the ':lang' entry above didn't already enumerate
    // (e.g. the NotFound wildcard `:lang/**`, whose trailing segment can't be
    // enumerated at build time). Rendered on demand via SSR instead of prerendered.
    path: '**',
    renderMode: RenderMode.Server,
  },
];
