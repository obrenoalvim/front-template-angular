import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { parseEnv } from './env.schema';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

// Angular's SSR engine rejects (falls back to CSR, soon a hard 400) any
// request whose Host header doesn't match an allowed hostname — an SSRF
// guard. Without this, every request served through Docker/a real deploy
// gets silently downgraded to client-only rendering the moment the actual
// Host header (the real domain, or 127.0.0.1 in local testing) doesn't
// match whatever this defaults to. Deriving it from SITE_URL means the one
// env var already used for canonical/OG tags also authorizes SSR for that
// same domain, instead of requiring a second, easy-to-forget env var.
const allowedHosts = (() => {
  try {
    return process.env['SITE_URL'] ? [new URL(process.env['SITE_URL']).hostname] : undefined;
  } catch {
    return undefined;
  }
})();
const angularApp = new AngularNodeAppEngine({ allowedHosts });

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  let env: ReturnType<typeof parseEnv>;
  try {
    env = parseEnv();
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
  const port = env.PORT;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
