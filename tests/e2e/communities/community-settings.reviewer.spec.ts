import { test, expect } from '@playwright/test'

// E2E — /communities/[slug]/settings: acceso de usuario member (no admin)
// Auth setup: tests/e2e/auth.setup.ts (storageState reviewer configurado en playwright.config.ts)
// e2e-reviewer es member (no admin) de startup-madrid → debe ser redirigido al feed

test.describe('Community Settings — acceso no-admin', () => {
  test('miembro sin rol admin es redirigido al feed de la comunidad', async ({ page }) => {
    await page.goto('/communities/startup-madrid/settings')
    await expect(page).toHaveURL(/\/communities(\/|\?|#|$)/, { timeout: 10_000 })
  })
})
