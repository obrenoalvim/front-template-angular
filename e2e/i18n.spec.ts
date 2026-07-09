// e2e/i18n.spec.ts
import { test, expect } from '@playwright/test';

test('switches the UI language via the header locale switcher', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByRole('heading', { name: 'front-template-angular' })).toBeVisible();

  await page.getByRole('button', { name: 'pt' }).click();
  await expect(page).toHaveURL(/\/pt\/?$/);
  await expect(page.getByText('Um template Angular pronto para clonar.')).toBeVisible();
});

test('an unsupported locale segment redirects to /en', async ({ page }) => {
  await page.goto('/fr/login');
  await expect(page).toHaveURL(/\/en$/);
});
