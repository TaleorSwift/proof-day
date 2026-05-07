import { test, expect } from '@playwright/test'

// Épica 13 — NewVersionModal e IterationHistory
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Proyecto live owned by test user: e2e-own-project — ver supabase/seed.sql

test.describe('NewVersion — modal y historial de versiones', () => {
  const PROJECT_URL = '/communities/producto-alpha/projects/e2e-own-project'

  test('muestra el botón de nueva versión al owner en un proyecto live', async ({ page }) => {
    await page.goto(PROJECT_URL)

    await expect(page.getByTestId('new-version-btn')).toBeVisible()
  })

  test('abrir el modal de nueva versión muestra el formulario', async ({ page }) => {
    await page.goto(PROJECT_URL)

    await page.getByTestId('new-version-btn').click()

    await expect(page.getByTestId('new-version-modal')).toBeVisible()
    await expect(page.getByTestId('new-version-title')).toBeVisible()
  })

  test('cerrar el modal lo oculta', async ({ page }) => {
    await page.goto(PROJECT_URL)

    await page.getByTestId('new-version-btn').click()
    await expect(page.getByTestId('new-version-modal')).toBeVisible()

    await page.getByRole('button', { name: /cancelar/i }).click()

    await expect(page.getByTestId('new-version-modal')).not.toBeVisible()
  })

  test('el historial de versiones no es visible cuando no hay iteraciones', async ({ page }) => {
    // El seed no tiene iteraciones para e2e-own-project
    await page.goto(PROJECT_URL)

    await expect(page.getByTestId('iteration-history')).not.toBeVisible()
  })
})
