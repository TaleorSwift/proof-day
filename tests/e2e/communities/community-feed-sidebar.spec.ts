import { test, expect } from '@playwright/test'

// E2E tests — sidebar y navegación del feed de comunidad (/communities/[slug])
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

test.describe('Community Feed — sidebar CommunityHeader', () => {
  test('muestra el nombre de la comunidad en el sidebar', async ({ page }) => {
    await page.goto('/communities/startup-madrid')
    // CommunityHeader renderiza el nombre como h2 en el sidebar
    await expect(page.getByRole('heading', { level: 2, name: 'Startup Madrid' })).toBeVisible()
  })

  test('muestra el conteo de miembros en el sidebar', async ({ page }) => {
    await page.goto('/communities/startup-madrid')
    await expect(page.getByText(/\d+ miembros?/)).toBeVisible()
  })
})

test.describe('Community Feed — BackButton', () => {
  test('muestra el BackButton con enlace a /communities', async ({ page }) => {
    await page.goto('/communities/startup-madrid')
    const backLink = page.getByRole('link', { name: /Mis comunidades/i })
    await expect(backLink).toBeVisible()
  })

  test('el BackButton navega de vuelta a /communities al hacer clic', async ({ page }) => {
    await page.goto('/communities/startup-madrid')
    await page.getByRole('link', { name: /Mis comunidades/i }).click()
    await expect(page).toHaveURL(/\/communities(\/|\?|#|$)/)
  })
})

test.describe('Community Feed — enlace Configuración (rol admin)', () => {
  // El usuario e2e-community@proofday.local es admin de startup-madrid en el seed.
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
