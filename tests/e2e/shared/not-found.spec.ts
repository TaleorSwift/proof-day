import { test, expect } from '@playwright/test'

// Rutas inexistentes — página 404
// El middleware redirige a /login si no hay sesión, por lo que se usa el auth state del proyecto chromium

test.describe('NotFound — rutas inexistentes', () => {
  test('ruta inexistente muestra la página 404', async ({ page }) => {
    await page.goto('/esta-ruta-no-existe')

    await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible()
  })

  test('la página 404 muestra el mensaje descriptivo', async ({ page }) => {
    await page.goto('/esta-ruta-no-existe')

    await expect(page.getByText('El recurso que buscas no existe.')).toBeVisible()
  })
})
