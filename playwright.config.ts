// playwright.config.ts
import { defineConfig } from '@playwright/test';

const port = process.env.CI ? 4000 : 4200;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: { baseURL },
  webServer: {
    // `ng serve`'s underlying Vite dev server binds `::1` (IPv6 loopback)
    // only by default — connecting via `127.0.0.1` (IPv4) then fails with
    // ECONNREFUSED even though the server is genuinely up. `--host 127.0.0.1`
    // forces the IPv4 bind so it matches `baseURL` above. The built SSR
    // server (`npm start`, used in CI) binds all interfaces by default and
    // doesn't need this.
    command: process.env.CI ? 'npm run build && npm start' : 'npm run dev -- --host 127.0.0.1',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: String(port),
      API_BASE_URL: process.env.API_BASE_URL ?? 'http://127.0.0.1:3000/api',
      SITE_URL: baseURL,
    },
  },
});
