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


test('shop portal demo workflow updates booking status', async ({ page }) => {
  await page.goto('/shop')
  await expect(page.getByText('Demo mode enabled')).toBeVisible()
  await page.getByRole('button', { name: /SNW-DEMO-1001/ }).click()
  await page.getByLabel('Status').selectOption('confirmed')
  await page.getByLabel('Response notes').fill('Confirmed by staff for morning pickup')
  await page.getByRole('button', { name: 'Save update' }).click()
  await expect(page.getByRole('button', { name: /SNW-DEMO-1001 confirmed/i })).toBeVisible()
})
