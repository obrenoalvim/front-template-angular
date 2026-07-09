// e2e/notes.spec.ts
import { test, expect } from '@playwright/test';

const API = process.env.API_BASE_URL ?? 'http://127.0.0.1:3000/api';

function fakeJwt(payload: object): string {
  const base64url = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${base64url({ alg: 'none' })}.${base64url(payload)}.sig`;
}

test.beforeEach(async ({ page }) => {
  const token = fakeJwt({ sub: 'user-1', email: 'ada@example.com' });
  await page.route(`${API}/auth/login`, (route) => route.fulfill({ json: { accessToken: token } }));
  await page.goto('/en/login');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/);
});

test('creates and deletes a note', async ({ page }) => {
  let notes: { id: string; title: string; content: string; createdAt: string }[] = [];

  await page.route(`${API}/notes`, (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: notes });
    const body = route.request().postDataJSON() as { title: string; content: string };
    const note = { id: '1', ...body, createdAt: new Date().toISOString() };
    notes = [note];
    return route.fulfill({ json: note });
  });
  await page.route(`${API}/notes/1`, (route) => {
    notes = [];
    return route.fulfill({ status: 204 });
  });

  await page.goto('/en/notes');
  await expect(page.getByText('No notes yet.')).toBeVisible();

  await page.getByLabel('Title').fill('First note');
  await page.getByLabel('Content').fill('Hello');
  await page.getByRole('button', { name: 'Add note' }).click();

  await expect(page.getByRole('cell', { name: 'First note' })).toBeVisible();

  await page.getByRole('button', { name: 'Delete' }).click();
  // Wait for the confirm dialog to actually settle before the second click:
  // CDK Dialog marks the rest of the page inert once the modal opens, but
  // right at the moment the overlay is being inserted there's a brief window
  // where the table's own "Delete" button is still in the a11y tree at the
  // same time the dialog is rendering on top of it — clicking immediately in
  // that window resolves the (correct, unique) button but Playwright's
  // actionability retry then fights the overlay animating/settling into
  // place, timing out with "subtree intercepts pointer events". Waiting for
  // the dialog's own heading first avoids the race. Also: not `.last()` —
  // once settled, the row's button is properly inert/unreachable by role, so
  // there's exactly one "Delete"-named button and `.last()` isn't needed.
  await expect(page.getByRole('heading', { name: 'Delete note?' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('No notes yet.')).toBeVisible();
});
