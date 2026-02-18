import { expect, test } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Snewy — Lebanon Ski Rental Aggregator')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Find rental shops by resort' })).toBeVisible()
})

test('can navigate to resort and login pages', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Resort' }).click()
  await expect(page).toHaveURL(/\/resorts\/mzaar/)

  await page.getByRole('link', { name: 'Login' }).click()
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
})
