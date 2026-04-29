import { test, expect } from '@playwright/test'

// E2E — /communities/[slug]/settings
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

test.describe('Community Settings — usuario no autenticado', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  test('redirige a /login al acceder sin sesión', async ({ page }) => {
    await page.goto('/communities/startup-madrid/settings')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })
})

// Tests admin autenticado → tests/e2e/communities/community-settings.admin.spec.ts (chromium-admin)

// Acceso no-admin → tests/e2e/communities/community-settings.reviewer.spec.ts (chromium-reviewer)
