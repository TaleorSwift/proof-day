import { test, expect } from '@playwright/test'

// E2E tests — sidebar enlace Configuración (rol admin)
// Auth setup: tests/e2e/auth.setup.ts — proyecto chromium-admin usa admin.json
// El usuario e2e-admin@proofday.local (e2e00000-...098) es admin de startup-madrid en el seed.

test.describe('Community Feed — enlace Configuración (rol admin)', () => {
  test('el admin ve el enlace "Configuración" en el sidebar', async ({ page }) => {
    await page.goto('/communities/startup-madrid')
    const link = page.getByRole('link', { name: 'Configuración' })
    await expect(link).toBeVisible()
  })

  test('el enlace Configuración apunta a /communities/[slug]/settings', async ({ page }) => {
    await page.goto('/communities/startup-madrid')
    const link = page.getByRole('link', { name: 'Configuración' })
    await expect(link).toHaveAttribute('href', '/communities/startup-madrid/settings')
  })
})
