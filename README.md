English | [Português](README.pt.md)

# front-template-angular

A clone-and-go base for new frontend projects: Angular with standalone components, Signals, and zoneless change detection; SSR; Tailwind CSS v4; a copy-in UI kit; i18n; dark mode; client-side auth against a REST API; and Docker, all wired together and tested end to end, including a live integration check against [back-template-nest](https://github.com/obrenoalvim/back-template-nest)'s real endpoints. Clone it, point `API_BASE_URL` at your backend, and start on your first feature instead of your fifth auth integration.

## Stack

- Angular (standalone components, zoneless change detection, strict TypeScript)
- Angular SSR (`@angular/ssr`) on a Node/Express server, with real per-route meta tags instead of a client-only SPA
- Tailwind CSS v4 (PostCSS plugin, `@custom-variant dark`)
- Angular CDK: `Dialog` (confirm dialogs) and `Table` (the notes example, sortable)
- A copy-in UI kit in `src/app/shared/ui/` (Button, TextField, Card, Dialog, Toast) that you own and edit directly, not a black-box package
- ngx-translate for `en` (default) and `pt`, switchable at runtime, with locale-prefixed routes (`/en/...`, `/pt/...`)
- A custom Signals-based `ToastService` instead of `ngx-toastr` (see Design notes for why)
- Zod, validating required env vars at startup (`src/env.schema.ts`) and backing every Reactive Forms schema through `zodValidator()`
- One `ApiClient` (`src/app/core/api/api-client.ts`) wrapping `HttpClient` with a single `ApiError` shape; components never make raw HTTP calls
- Angular `rxResource()` for cache/loading/retry state in the notes example, replacing manual subscribe+setState
- Jest (`jest-preset-angular`, zoneless) + Playwright (auth flow, locale switch, notes CRUD)
- ESLint (`angular-eslint` flat config) + Prettier (`prettier-plugin-tailwindcss`) + Husky/lint-staged
- Docker and docker-compose: multi-stage build, non-root user, healthchecked
- GitHub Actions CI (`npm audit`, lint, format check, unit tests, `ng build`, Docker image build, full e2e) + Dependabot

## Project structure

- `src/app/core` holds cross-cutting services: `ApiClient`/`ApiError`, `AuthService`/`AuthStorage`/`authGuard`/`authInterceptor`, `ThemeService`, `LocaleService`/`LocaleNavService`/`LocaleLink`/`localeGuard`, `ToastService`, `SeoService`, `zodValidator` and its schemas.
- `src/app/shared` holds the copy-in UI kit (`ui/`) and the app shell (`Header`, `Footer`, `LocaleSwitcher`, `ThemeToggle`).
- `src/app/features` holds the routed pages: `home`, `auth/{login,register,forgot-password,reset-password}`, `dashboard`, `account`, `notes`.
- `scripts/` has `generate-env.mjs`, which writes `src/environments/environment.ts` from validated env vars before every `dev`/`build`, and `generate-sitemap.mjs`, which writes `sitemap.xml`/`robots.txt` after build.

## Getting started

```bash
cp .env.example .env
# edit .env: point API_BASE_URL at your backend (include the backend's own
# global prefix if it has one, e.g. http://127.0.0.1:3000/api), SITE_URL at
# where you'll deploy this
npm install
npm run dev
```

App: <http://localhost:4200>.

## Getting started (Docker)

```bash
cp .env.example .env
npm run docker:up
```

App: <http://localhost:4000>. **Access it at the exact host in `SITE_URL`** (`localhost:4000` by default). If you see a plain, unstyled page instead of the real app, check the SSR Host allowlist gotcha below. `npm run docker:down` stops it.

## Scripts

| Script                              | What it does                                                       |
| ----------------------------------- | ------------------------------------------------------------------ |
| `npm run dev`                       | Generates the env config, then starts `ng serve` on `:4200`        |
| `npm run build`                     | Generates the env config, runs `ng build`, then writes the sitemap |
| `npm start`                         | Runs the built SSR server (`dist/.../server/server.mjs`)           |
| `npm run watch`                     | Incremental development build, no server                           |
| `npm test` / `test:watch`           | Jest unit tests, once or in watch mode                             |
| `npm run test:e2e`                  | Playwright e2e suite                                               |
| `npm run lint`                      | `ng lint` (`angular-eslint`)                                       |
| `npm run format` / `format:check`   | Prettier, write or check-only                                      |
| `npm run docker:up` / `docker:down` | `docker compose up --build` / `down`                               |

## Environment variables

See `.env.example` for the full, commented list.

| Variable       | Required | Purpose                                                                                                                   |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `API_BASE_URL` | yes      | Base URL of the backend REST API this frontend calls                                                                      |
| `SITE_URL`     | yes      | Public URL of this site: canonical tags, OG/Twitter meta, sitemap/robots, **and SSR's Host allowlist (see Design notes)** |
| `PORT`         | no       | Port the SSR Node server listens on; default `4000`                                                                       |

`src/env.schema.ts` validates these with Zod; `scripts/generate-env.mjs` runs before every `dev`/`build` and fails fast with a readable message if `API_BASE_URL`/`SITE_URL` are missing or not valid URLs. `src/server.ts` validates the same schema again at process startup, covering the case where `environment.ts` was generated once and the server is later started with different env vars, as happens in Docker.

## Auth

Client-side only, against whatever REST API you point `API_BASE_URL` at. `AuthService` (`src/app/core/auth/auth.service.ts`) expects this contract, verified live against the real [back-template-nest](https://github.com/obrenoalvim/back-template-nest) rather than assumed:

- `POST /auth/register` returns `{ id, email }`. No token, no auto-login: this template's reference backend treats email verification as a separate step, so registering sends the user to `/login`, not `/dashboard`. There is no `name` field anywhere; the User model this was built against doesn't have one.
- `POST /auth/login` returns `{ accessToken, refreshToken }`, no user object. `AuthService` decodes the access token's payload client-side (`sub`/`email`/`role`) to populate `currentUser`. That's for display only, not a trust boundary: real authorization is still enforced server-side on every API call through the token itself.
- `POST /auth/forgot-password`, `POST /auth/reset-password`.
- `PATCH /account/password` (change password) and `DELETE /account`, which requires the current password in the body. It's collected through a form field on the Account page, since `ConfirmDialog` only returns yes/no, not text input.

Pages: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/account`. `src/app/core/auth/auth.guard.ts` is the one guard protecting `/dashboard`, `/account`, `/notes`, and `/admin`, applied once on a parent route rather than per page. Toast feedback on every auth action goes through `ToastService`.

Point this at a backend with a different contract (a `name` field, a combined login response) and the one file to change is `auth.service.ts`. Nothing else references the backend's exact shapes directly.

## Sessions

The access token is short-lived (back-template-nest defaults to 15 minutes). `src/app/core/auth/auth.interceptor.ts` catches a `401`, calls `POST /auth/refresh` with the stored refresh token, and retries the failed request once with the new access token. The rest of the app never sees a stray 401 from an expired token. Concurrent requests that all 401 around the same time share a single in-flight refresh (a module-level `Subject`, not one refresh per request), so they don't race the backend's rotation and invalidate each other's refresh token. If the refresh itself fails (refresh token expired or revoked), the interceptor calls `AuthService.logout()` and lets the original error through; `authGuard` sends the user to `/login` on the next navigation. `logout()` also POSTs to `/auth/logout` to revoke the refresh token server-side. That call is best-effort: the local session clears either way.

## Roles

`currentUser().role` (`'user'` | `'admin'`) comes straight from the JWT. Never trust a role your own request sends. `/admin` (`src/app/features/admin`) is the reference for an admin-only page: `admin.guard.ts` checks the role client-side and redirects to `/dashboard` otherwise. On SSR it fails closed, since there's no way to read the client-side JWT payload server-side (the same limitation `auth.guard.ts` documents for its own check); the client re-runs the guard immediately after hydration with the real answer. This is UX only. The actual gate is `back-template-nest`'s `RolesGuard` rejecting the request server-side. To promote a user, flip the `role` column on the Nest side, then log in again to get a token with the new claim.

## i18n

Translations live in `public/assets/i18n/en.json` and `pt.json`. Routes are locale-prefixed (`/en/login`, `/pt/login`): `src/app/core/i18n/locale.guard.ts` validates the `:lang` segment, syncs it into `LocaleService`, and redirects unsupported locales to `/en`. Always link with the `appLocaleLink` directive (`src/app/core/i18n/locale-link.ts`) or navigate with `LocaleNavService.navigate()`/`.path()`. Bare `routerLink` or `Router.navigate` drops the locale prefix. Form validation messages are translation keys returned by Zod schemas (`src/app/core/validators/schemas/auth.schemas.ts`) and rendered through the `translate` pipe, so validation messages get translated too, not just labels.

## Theming

`src/app/core/theme/theme.service.ts` is a signal (`light`/`dark`), seeded from `localStorage` and then `prefers-color-scheme`, toggled from the header. Tailwind's dark variant is wired via `@custom-variant dark (&:where(.dark, .dark *));` in `src/styles.css`. The service toggles the `.dark` class on `<html>`.

## Data fetching

All backend calls go through `ApiClient` (`src/app/core/api/api-client.ts`): `get`/`post`/`patch`/`delete`, all returning `Observable<T>` and normalizing failures into one `ApiError { status, message, body }`. It recognizes both a flat `{ message }` error body and back-template-nest's own nested `{ error: { message } }` shape (its `AllExceptionsFilter`'s format), falling back gracefully either way. The notes example (`src/app/features/notes/notes.ts`) wraps `NotesService.list()` in `rxResource({ stream: ... })` for cache/loading/retry state instead of manual subscribe+setState; `notesResource.value()`, `.isLoading()`, and `.reload()` drive the template directly.

## Example CRUD resource

`/notes` is a full reference: `note.model.ts` → `notes.service.ts` (thin `ApiClient` wrapper) → `notes.ts` (CDK Table, client-side sort, create/delete via `rxResource`). Copy this shape for your first real feature, then delete `/notes` (and its route/nav entries) once you don't need the reference.

## SEO

`src/app/core/seo/seo.service.ts` wraps `Title`/`Meta` to set OpenGraph/Twitter tags and a canonical `<link>` per route, derived from `SITE_URL` plus the page's locale-aware path. Pages call it via `translate.get([...]).subscribe(...)`, not `translate.instant()`; see Design notes for why that distinction matters under SSR. `scripts/generate-sitemap.mjs` writes `sitemap.xml`/`robots.txt` after every build. Add new public routes to its `routes` array; protected routes are deliberately excluded. `public/llms.txt` gives AI agents and IDE tools a short structured summary of the project.

## Testing

- **Unit** (`npm test`): Jest + `jest-preset-angular` (zoneless setup). Every core service, guard, and interceptor has a real spec; `src/app/shared/ui/button/button.spec.ts` and `text-field.spec.ts` cover the UI kit.
- **E2E** (`npm run test:e2e`): Playwright, covering `e2e/auth.spec.ts` (register then login-not-dashboard, login → dashboard → logout, invalid-login toast, guard redirect), `e2e/i18n.spec.ts` (locale switch, unsupported-locale redirect), and `e2e/notes.spec.ts` (create/delete). This template's e2e suite mocks `API_BASE_URL` responses via Playwright's `page.route()`, so it runs standalone without a real backend. Swap in a real one, or point it at the real back-template-nest, when you're ready.
- `playwright.config.ts` reuses an already-running dev server locally (`reuseExistingServer`, forced to `--host 127.0.0.1`; see Design notes) or builds and starts the SSR server itself in CI (`workers: 2`, matching the resource constraints of a CI runner).

## CI/CD

`.github/workflows/ci.yml` runs three jobs on every push and PR to `master`: **build** (`npm audit`, lint, format check, unit tests, `ng build` with placeholder env vars), **docker** (builds the production image, no push, to catch Dockerfile breakage early), and **e2e** (installs Playwright browsers, builds and starts the app, runs the full suite). `.github/dependabot.yml` checks `npm` and GitHub Actions weekly.

## Docker

`Dockerfile` is multi-stage (`deps` → `build` → `runtime`), runs as a non-root user, and serves the real Angular SSR Node server rather than static files behind nginx, so both SSR and `/api/health` work identically to a non-Docker deploy. `docker-compose.yml` healthchecks `/api/health` via `wget` against `127.0.0.1`. **The container must be accessed at the exact host named in `SITE_URL`**: see Design notes below for the gotcha this causes if you don't.

## Using this as a template

1. Rename the project in `package.json`, `angular.json`, and this README.
2. `cp .env.example .env`, point `API_BASE_URL` at your real backend.
3. `npm install && npm run dev`.
4. Delete `/notes` (page + service + model + route + nav links) once you've copied its pattern for your first real feature.
5. Add or remove locales in `src/app/core/i18n/locale.service.ts`'s `SUPPORTED_LOCALES` and drop in a matching `public/assets/i18n/<code>.json`.

## Design notes and gotchas

- **Angular 21's SSR Host allowlist rejects any request whose Host header doesn't match `SITE_URL`'s hostname, silently at first.** It's a real SSRF-prevention feature, not a bug in this template, but it will trip you up: without configuring it, every request through Docker (or any real deploy) gets quietly downgraded to client-only rendering (a console warning, not an error) the moment the actual Host header doesn't match. `src/server.ts` derives `allowedHosts` from `SITE_URL`'s hostname and passes it to `AngularNodeAppEngine`, turning the mismatch into a **hard 400** instead of a silent downgrade. So if you see a 400 (or, before this fix, a plain unstyled `<title>FrontTemplateAngular</title>` shell instead of the real app), the browser URL you're using doesn't match `SITE_URL`'s host exactly. `localhost` and `127.0.0.1` are two _different_ hostnames to this check.
- **`ng serve`'s dev server binds `::1` (IPv6 loopback) only, not `127.0.0.1`.** Connecting via `127.0.0.1:4200` then fails with ECONNREFUSED even though the server is genuinely up. `playwright.config.ts` forces `ng serve --host 127.0.0.1` for local e2e runs so its `127.0.0.1` `baseURL` actually reaches it; CI's e2e job uses the built SSR server instead, which doesn't have this issue.
- **SSR has no access to `localStorage`, so the guard needs a cookie too, not just the client-side signal.** `authGuard` originally only checked `AuthService.isAuthenticated()` (backed by `localStorage`), which is always `false` server-side. That meant an actually logged-in user hitting a protected route through a fresh navigation (a deep link, or just refreshing the page) got server-rendered as logged-out and wrongly redirected to `/login`. The fix: a lightweight, non-`HttpOnly` `has_session` marker cookie (never the JWT itself), set and cleared alongside `localStorage` in `AuthStorage`. `authGuard` reads it via Angular's `REQUEST` injection token when running server-side, and falls back to the real signal in the browser.
- **`translate.instant()` in a component constructor returns the raw i18n key during SSR, not the translated text.** The HTTP-loaded `en.json`/`pt.json` haven't resolved yet when SSR constructs the page, so `instant()` silently returns `"home.title"` instead of real text. Anything that captured that value once, like `SeoService.update()`, keeps showing the wrong thing forever, not just on the first paint. `Home`/`NotFound` use `translate.get([...]).subscribe(...)` instead, which waits for the real translation. The `| translate` _pipe_ used directly in templates doesn't have this problem: it's reactive and updates once translations load. This only bites explicit `.instant()` calls made once, eagerly, in code.
- **`rxResource()`'s option is `stream`, not `loader`, in this Angular version.** Worth calling out because a decent amount of Angular v20-era sample code (and this template's own original plan draft) still shows `loader`. That's from an earlier API iteration and fails to compile here (`TS2769`).
- **`API_BASE_URL` is baked into the client bundle at build time, so a runtime `docker-compose environment:` entry can't change it after the image exists.** Unlike `SITE_URL` (read fresh by `server.ts` at process startup) or `PORT`, the browser makes the actual API calls, not the container, so `API_BASE_URL` has to be correct when `ng build` runs. `Dockerfile` takes it as a build `ARG`; `docker-compose.yml` passes both `API_BASE_URL` and `SITE_URL` as build args, deliberately reading them from `DOCKER_API_BASE_URL`/`DOCKER_SITE_URL` rather than the same-named variables. Compose auto-loads this project's own `.env` (written for `npm run dev`, pointing at `:4200`) for `${...}` substitution, and reusing `SITE_URL` directly there would silently bake the wrong host into every `docker compose up --build`, immediately tripping the Host-allowlist gotcha above.
- **Toast library: custom, not `ngx-toastr`.** `ngx-toastr` assumes zone.js-driven change detection for its animation timers and ships its own CSS to override; this app is zoneless and Tailwind-styled, so a ~40-line `ToastService` (Signals, `setTimeout` auto-dismiss) fit better with zero extra runtime dependency.
- **`LocaleSwitcher`'s target-URL construction has to avoid a spurious trailing slash.** Building the new locale's URL as `` `/${next}${rest}` `` where `rest` is the path _after_ the current locale segment: on the home page `rest` is `''`, and a naive `|| '/'` fallback there produces `/pt/` (trailing slash) instead of `/pt`. The router parses that as an extra empty path segment and fails to match against `{ path: '' }`, falling through to the `NotFound` catch-all. Don't add that fallback back.
- **CDK `Dialog` marks the rest of the page inert once a modal opens, but there's a brief window during the overlay's entrance animation where a table row's own action button (e.g. notes' per-row "Delete") is still reachable at the same moment the dialog is rendering on top of it.** Waiting for the dialog's own heading to appear before the next click avoids racing that window. Once settled, the row's button drops out of the accessibility tree, so there's exactly one "Delete"-named button; `.last()` isn't needed and shouldn't be used to disambiguate.
- **`api-client.ts` is deliberately dumb.** It only knows `HttpClient` + `ApiError`: no logging, no auth-header logic (that's `authInterceptor`'s job). Keep it that way so it stays trivially unit-testable with `HttpClientTestingModule`.
- **`ng build`'s `dist/front-template-angular/{browser,server}` split is load-bearing.** `scripts/generate-sitemap.mjs` writes into `.../browser` (the static/public output), and `Dockerfile`'s `CMD` points at `.../server/server.mjs`. If the project is ever renamed, update both.
