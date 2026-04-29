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

test.describe('Community Settings — admin autenticado', () => {
  test('admin puede ver la sección de invitaciones', async ({ page }) => {
    await page.goto('/communities/startup-madrid/settings')
    await expect(page.getByRole('heading', { name: /Configuración/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('heading', { name: /Links de invitación/i })).toBeVisible()
  })

  test('admin puede ver el botón "Generar link de invitación"', async ({ page }) => {
    await page.goto('/communities/startup-madrid/settings')
    await expect(
      page.getByRole('button', { name: /Generar link de invitación/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('admin genera un link y aparece en la lista', async ({ page }) => {
    await page.goto('/communities/startup-madrid/settings')
    await page.getByRole('button', { name: /Generar link de invitación/i }).click()

    // El link debe aparecer en la lista (input de sólo lectura con la URL)
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 10_000 })

    // Verificar que la URL del link contiene un token real (no undefined/null)
    const linkValue = await page.getByRole('textbox').first().inputValue()
    const url = new URL(linkValue, 'http://localhost:3000')
    expect(url.pathname).toMatch(/^\/invite\/[A-Za-z0-9_-]{8,}$/)
  })

  test('admin ve el botón "Copiar link" junto al link generado', async ({ page }) => {
    await page.goto('/communities/startup-madrid/settings')
    await page.getByRole('button', { name: /Generar link de invitación/i }).click()

    await expect(
      page.getByRole('button', { name: /Copiar link/i }).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('el back-link apunta al feed de la comunidad', async ({ page }) => {
    await page.goto('/communities/startup-madrid/settings')
    const backLink = page.getByRole('link', { name: /Volver al feed/i })
    await expect(backLink).toBeVisible({ timeout: 10_000 })
    await expect(backLink).toHaveAttribute('href', '/communities/startup-madrid')
  })
})

test.describe('Community Settings — acceso no-admin', () => {
  // Requiere un segundo usuario con rol "member" (no admin) en la comunidad startup-madrid.
  // El seed de test actual solo tiene el usuario admin. Activar cuando haya fixture de miembro.
  test.skip(
    true,
    'Requiere seed con usuario member (no admin) en startup-madrid. ' +
    'Cuando haya fixture, crear usuario member en auth.setup.ts y eliminar este skip.'
  )

  test('miembro sin rol admin es redirigido a /communities', async ({ page }) => {
    await page.goto('/communities/startup-madrid/settings')
    await expect(page).toHaveURL(/\/communities(\/|\?|#|$)/, { timeout: 10_000 })
  })
})
