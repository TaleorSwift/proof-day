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
    // startup-madrid tiene 6 miembros: Alex (admin), Sara, Tom, e2e-community, e2e-admin, e2e-reviewer
    await expect(page.getByText('6 miembros')).toBeVisible()
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
