import { expect, test } from '@playwright/test'

test.describe('roast explorer', () => {
  test('exposes all five reference variants and keeps the page inside the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/roast')
    await expect(page.locator('[data-roast-explorer-ready="true"]')).toBeVisible()

    await expect(page.getByRole('tab')).toHaveCount(5)

    for (const label of ['Roast receipt', 'Diss track', 'Knockout card', 'Roast reel']) {
      await page.getByRole('tab', { name: new RegExp(label, 'i') }).click()
      await expect(page.getByRole('tab', { name: new RegExp(label, 'i') })).toHaveAttribute('aria-selected', 'true')
    }

    const viewportMetrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))

    expect(viewportMetrics).toEqual({ clientWidth: 390, scrollWidth: 390 })
  })

  test('switches intensity and replays the active direction', async ({ page }) => {
    await page.goto('/roast')
    await expect(page.locator('[data-roast-explorer-ready="true"]')).toBeVisible()

    await page.getByRole('button', { name: 'BURNED TO CRISP' }).click()
    await expect(page.getByRole('tabpanel').getByRole('article').getByText('Structural integrity: none')).toBeVisible()
    await expect(page.getByRole('tabpanel').getByText('97', { exact: true }).first()).toBeVisible({ timeout: 8_000 })

    await page.getByRole('button', { name: 'Replay entrance' }).click()
    await expect(page.getByText('streaming', { exact: true })).toBeVisible()
    await expect(page.getByText('filed', { exact: true })).toBeVisible({ timeout: 8_000 })
  })

  test('keeps evidence secondary and makes the card and reel interactions usable', async ({ page }) => {
    await page.goto('/roast')
    await expect(page.locator('[data-roast-explorer-ready="true"]')).toBeVisible()

    await page.getByRole('tab', { name: /Evidence deck/i }).click()
    await expect(page.getByText('Tap to continue →')).toBeVisible()
    await page.getByRole('button', { name: 'Tap to continue →' }).click()
    await expect(page.getByText(/cards$/i)).toBeVisible()

    await page.getByRole('tab', { name: /Roast reel/i }).click()
    await expect(page.getByText('One burn at a time.')).toBeVisible()
    await page.getByRole('button', { name: 'Next roast slide' }).click()
    await expect(page.getByText('Round 02')).toBeVisible()

    await page.getByRole('button', { name: /Show evidence/i }).click()
    await expect(page.getByText('Commits', { exact: true })).toBeVisible()
    await expect(page.getByText('Files', { exact: true })).toBeVisible()
  })
})
