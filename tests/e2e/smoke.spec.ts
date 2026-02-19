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


test('booking tier auto-adjusts when gear category changes', async ({ page }) => {
  await page.goto('/book/s1')
  await page.getByLabel('Tier').selectOption('standard')
  await page.getByLabel('Gear').selectOption('snowboard')
  await expect(page.getByLabel('Tier')).toHaveValue('basic')
})


test('booking date validation prevents end date before start date', async ({ page }) => {
  await page.goto('/book/s1')
  await page.getByLabel('Start date').fill('2026-02-22')
  await page.getByLabel('End date').fill('2026-02-20')
  await page.getByLabel('Height (cm)').fill('175')
  await page.getByLabel('Weight (kg)').fill('70')
  await page.getByLabel('Shoe size (EU)').fill('42')
  await page.getByRole('button', { name: 'Submit request' }).click()
  await expect(page.getByText('End date must be on or after start date')).toBeVisible()
})


test('unknown route shows 404 fallback page', async ({ page }) => {
  await page.goto('/definitely-missing-route')
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  await page.getByRole('link', { name: 'Go Home' }).click()
  await expect(page).toHaveURL('/')
})


test('demo booking submission shows reference without login', async ({ page }) => {
  await page.goto('/book/s1')
  await page.getByLabel('Start date').fill('2026-02-22')
  await page.getByLabel('End date').fill('2026-02-23')
  await page.getByLabel('Height (cm)').fill('178')
  await page.getByLabel('Weight (kg)').fill('74')
  await page.getByLabel('Shoe size (EU)').fill('43')
  await page.getByRole('button', { name: 'Submit request' }).click()
  await expect(page.getByText(/Booking created\. Reference:/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Send booking to shop on WhatsApp' })).toBeVisible()
})
