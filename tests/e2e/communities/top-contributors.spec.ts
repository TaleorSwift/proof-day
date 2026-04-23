import { test, expect } from '@playwright/test'

// Story 8.6 — TopContributors Leaderboard
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

test.describe('TopContributors Leaderboard — comunidad homepage', () => {
  test('muestra el leaderboard TopContributors en el sidebar', async ({ page }) => {
    await page.goto('/communities/startup-madrid')
    await expect(page.getByTestId('top-contributors')).toBeVisible()
  })

  test('cada fila muestra avatar, nombre, badge y conteo de feedbacks', async ({ page }) => {
    await page.goto('/communities/startup-madrid')
    const rows = page.locator('[data-testid="top-contributor-row"]')
    const count = await rows.count()
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i)
      await expect(row.locator('[aria-label^="Avatar de"]')).toBeVisible()
      await expect(row.getByTestId('contributor-name')).toBeVisible()
      await expect(row.getByTestId('contributor-badge')).toBeVisible()
      await expect(row.getByTestId('contributor-count')).toBeVisible()
    }
  })

  test('muestra empty state cuando no hay revisores', async ({ page }) => {
    await page.goto('/communities/sin-revisores')
    await expect(page.getByTestId('top-contributors-empty')).toBeVisible()
  })
})
