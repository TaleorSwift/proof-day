import { test, expect } from '@playwright/test'

// /communities/[slug]/projects/new — página de nuevo proyecto
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

test.describe('ProjectNew — /communities/producto-alpha/projects/new', () => {
  const NEW_URL = '/communities/producto-alpha/projects/new'

  test('carga la página de nuevo proyecto y muestra el heading', async ({ page }) => {
    await page.goto(NEW_URL)

    await expect(page.getByRole('heading', { name: 'Nuevo proyecto' })).toBeVisible()
  })

  test('muestra el nombre de la comunidad en el encabezado', async ({ page }) => {
    await page.goto(NEW_URL)

    // La página muestra community.name ('Producto Alpha'), no el slug
    await expect(page.getByText('Producto Alpha')).toBeVisible()
  })

  test('muestra el formulario con el campo título', async ({ page }) => {
    await page.goto(NEW_URL)

    await expect(page.getByLabel(/título/i)).toBeVisible()
  })

  test('usuario no autenticado es redirigido a /login', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto(NEW_URL)

    await expect(page).toHaveURL(/\/login/)
  })
})
