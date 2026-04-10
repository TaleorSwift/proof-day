import { test } from '@playwright/test'

/**
 * Tests E2E — Story 8.6: TopContributors Leaderboard
 * Marcados con test.skip hasta que el entorno E2E esté configurado con datos de prueba.
 */

test.describe('TopContributors Leaderboard — comunidad homepage', () => {
  test.skip('muestra el leaderboard TopContributors en el sidebar', async ({ page }) => {
    await page.goto('/communities/startup-madrid')
    await page.waitForSelector('[data-testid="top-contributors"]')
  })

  test.skip('cada fila muestra avatar, nombre, badge y conteo de feedbacks', async ({ page }) => {
    await page.goto('/communities/startup-madrid')
    const rows = page.locator('[data-testid="top-contributor-row"]')
    const count = await rows.count()
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i)
      await row.locator('[aria-label^="Avatar de"]').waitFor()
      await row.locator('[data-testid="contributor-name"]').waitFor()
      await row.locator('[data-testid="contributor-badge"]').waitFor()
      await row.locator('[data-testid="contributor-count"]').waitFor()
    }
  })

  test.skip('muestra empty state cuando no hay revisores', async ({ page }) => {
    await page.goto('/communities/sin-revisores')
    await page.waitForSelector('[data-testid="top-contributors-empty"]')
  })
})
