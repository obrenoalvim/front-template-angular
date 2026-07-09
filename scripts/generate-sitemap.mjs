// scripts/generate-sitemap.mjs
import { writeFileSync } from 'node:fs';
import { z } from 'zod';

const siteUrl = z
  .string()
  .url()
  .parse(process.env.SITE_URL ?? 'http://localhost:4200');

const locales = ['en', 'pt'];
const routes = ['', 'login', 'register', 'forgot-password'];
const outDir = process.argv[2] ?? 'dist/front-template-angular/browser';

const urls = locales.flatMap((locale) =>
  routes.map((route) => `${siteUrl}/${locale}${route ? `/${route}` : ''}`),
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;

writeFileSync(`${outDir}/sitemap.xml`, sitemap);
writeFileSync(`${outDir}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
console.log(`Generated sitemap.xml and robots.txt at ${outDir} (${urls.length} URLs)`);
