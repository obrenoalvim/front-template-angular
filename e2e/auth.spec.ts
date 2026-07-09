// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

const API = process.env.API_BASE_URL ?? 'http://127.0.0.1:3000/api';

// Minimal unsigned JWT — good enough to exercise AuthService's client-side
// payload decode (sub/email), same helper used in the unit specs.
function fakeJwt(payload: object): string {
  const base64url = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${base64url({ alg: 'none' })}.${base64url(payload)}.sig`;
}

// back-template-nest's real register response has no token (email
// verification is a separate step) — registering does NOT auto-authenticate.
test('sign up redirects to login, not the dashboard (no auto-login)', async ({ page }) => {
  await page.route(`${API}/auth/register`, (route) =>
    route.fulfill({ json: { id: '1', email: 'ada@example.com' } }),
  );

  await page.goto('/en/register');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL(/\/en\/login$/);
});

test('logs in, sees the dashboard, then logs out', async ({ page }) => {
  const token = fakeJwt({ sub: 'user-1', email: 'ada@example.com' });
  await page.route(`${API}/auth/login`, (route) => route.fulfill({ json: { accessToken: token } }));

  await page.goto('/en/login');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL(/\/en\/dashboard$/);
  await expect(page.getByText('ada@example.com')).toBeVisible();

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/en\/login$/);
});

test('shows an error toast on invalid login credentials', async ({ page }) => {
  await page.route(`${API}/auth/login`, (route) =>
    route.fulfill({ status: 401, json: { message: 'Invalid credentials' } }),
  );

  await page.goto('/en/login');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Password').fill('wrongpassword');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByRole('status')).toBeVisible();
});

test('unauthenticated users are redirected away from /dashboard', async ({ page }) => {
  await page.goto('/en/dashboard');
  await expect(page).toHaveURL(/\/en\/login$/);
});
