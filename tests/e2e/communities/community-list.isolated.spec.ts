import { test, expect } from '@playwright/test'

// E2E — /communities: empty state para usuario sin membresías
// Auth setup: tests/e2e/auth.setup.ts (storageState isolated configurado en playwright.config.ts)
// e2e-isolated no tiene membresías → /communities muestra el empty state

test.describe('Community List — empty state (sin comunidades)', () => {
  test('muestra el empty state cuando el usuario no tiene comunidades', async ({ page }) => {
    await page.goto('/communities')
    await expect(
      page.getByText('Aún no perteneces a ninguna comunidad')
    ).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('btn-create-community')).toBeVisible()
  })
})
