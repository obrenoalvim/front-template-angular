import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { SeoService } from './seo.service';
import { SITE_URL } from '../config/app-tokens';

describe('SeoService', () => {
  let service: SeoService;

  beforeEach(() => {
    document.head.querySelector('link[rel="canonical"]')?.remove();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: SITE_URL, useValue: 'https://example.com' },
      ],
    });
    service = TestBed.inject(SeoService);
  });

  it('sets the document title', () => {
    service.update({ title: 'Home', description: 'desc', path: '/en' });
    expect(document.title).toBe('Home');
  });

  it('sets OpenGraph and Twitter meta tags', () => {
    service.update({ title: 'Home', description: 'desc', path: '/en' });
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      'Home',
    );
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
      'summary_large_image',
    );
  });

  it('creates a canonical link built from SITE_URL and the given path', () => {
    service.update({ title: 'Home', description: 'desc', path: '/en' });
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://example.com/en',
    );
  });

  it('reuses the same canonical link element across updates', () => {
    service.update({ title: 'Home', description: 'desc', path: '/en' });
    service.update({ title: 'Login', description: 'desc2', path: '/en/login' });
    const links = document.querySelectorAll('link[rel="canonical"]');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('https://example.com/en/login');
  });
});
