import { test, expect } from '@playwright/test'

// /profile/[id] — vista de perfil de otro usuario
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Sara Medina (a0000000-0000-4000-8000-000000000002) comparte producto-alpha con el test user

test.describe('ProfileView — /profile/[id]', () => {
  const SARA_ID = 'a0000000-0000-4000-8000-000000000002'
  const SARA_URL = `/profile/${SARA_ID}`
  // ID del test user e2e (ver supabase/seed.sql y auth.setup.ts)
  const TEST_USER_URL = '/profile/e2e00000-0000-4000-8000-000000000099'

  test('carga el perfil de otro usuario y muestra su nombre', async ({ page }) => {
    await page.goto(SARA_URL)

    await expect(page.getByRole('heading', { name: 'Sara Medina' })).toBeVisible()
  })

  test('muestra la bio del usuario', async ({ page }) => {
    await page.goto(SARA_URL)

    await expect(page.getByText(/engineering manager/i)).toBeVisible()
  })

  test('muestra los intereses como tags', async ({ page }) => {
    await page.goto(SARA_URL)

    // Sara tiene interests: ['engineering', 'teams', 'remote-work']
    // Los tags son <span> con texto exacto del interest
    await expect(page.getByText('teams')).toBeVisible()
  })

  test('muestra el contador de proyectos creados', async ({ page }) => {
    await page.goto(SARA_URL)

    // El <p> con etiqueta de la métrica — usar locator exacto para evitar colisión con el tab "Proyectos creados"
    await expect(page.locator('p', { hasText: 'proyectos creados' }).first()).toBeVisible()
  })

  test('usuario no autenticado es redirigido a /login', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto(SARA_URL)

    await expect(page).toHaveURL(/\/login/)
  })

  test('navegar al propio perfil redirige a /profile', async ({ page }) => {
    await page.goto(TEST_USER_URL)

    await expect(page).toHaveURL(/\/profile$/)
  })
})
