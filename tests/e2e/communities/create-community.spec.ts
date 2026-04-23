import { test, expect } from '@playwright/test'

/**
 * E2E — Creación de comunidad por usuario autenticado
 *
 * Usa el auth state guardado por auth.setup.ts (usuario de test pre-autenticado).
 * No depende del flujo de email/magic link.
 *
 * Requiere:
 *   - Next.js corriendo en localhost:3000
 *   - Supabase local corriendo (npx supabase start)
 *   - Auth state en tests/e2e/.auth/user.json (generado por el proyecto "setup")
 */

test.describe('Crear comunidad — usuario autenticado', () => {
  test('puede crear una comunidad y ve la lista de comunidades', async ({ page }) => {
    // 1. Navegar directamente a crear comunidad (auth state ya cargado)
    await page.goto('/communities/new')
    await expect(page.getByRole('heading', { name: 'Crear comunidad' })).toBeVisible()

    // 2. Rellenar el formulario con datos válidos
    const communityName = `Test E2E ${Date.now()}`
    await page.getByLabel('Nombre').fill(communityName)
    await page.getByLabel('Descripción').fill('Comunidad creada en test E2E automatizado')

    // 3. Enviar el formulario
    await page.getByRole('button', { name: 'Crear comunidad' }).click()

    // 4. Debe redirigir a /communities sin error
    //    (antes del fix RLS, aquí aparecía el error 500 y no había redirect)
    await expect(page).toHaveURL(/\/communities(?!\/new)/, { timeout: 15_000 })

    // 5. La comunidad recién creada debe aparecer en la lista
    await expect(page.getByText(communityName)).toBeVisible({ timeout: 10_000 })
  })

  test('muestra error de validación con nombre demasiado corto', async ({ page }) => {
    await page.goto('/communities/new')
    await expect(page.getByRole('heading', { name: 'Crear comunidad' })).toBeVisible()

    await page.getByLabel('Nombre').fill('AB')
    await page.getByLabel('Descripción').fill('Descripción válida')
    await page.getByRole('button', { name: 'Crear comunidad' }).click()

    // Error de validación inline — NO redirige
    await expect(page.getByText('El nombre debe tener al menos 3 caracteres')).toBeVisible()
    await expect(page).toHaveURL(/\/communities\/new/)
  })

  test('muestra error de validación con descripción vacía', async ({ page }) => {
    await page.goto('/communities/new')

    await page.getByLabel('Nombre').fill('Comunidad válida')
    // No rellenar descripción
    await page.getByRole('button', { name: 'Crear comunidad' }).click()

    await expect(page.getByText('La descripción es obligatoria')).toBeVisible()
    await expect(page).toHaveURL(/\/communities\/new/)
  })

  test('la comunidad creada es visible desde la lista de comunidades', async ({ page }) => {
    // Crear comunidad
    const uniqueName = `Comunidad Visible ${Date.now()}`
    await page.goto('/communities/new')
    await page.getByLabel('Nombre').fill(uniqueName)
    await page.getByLabel('Descripción').fill('Verificando visibilidad post-creación')
    await page.getByRole('button', { name: 'Crear comunidad' }).click()
    await expect(page).toHaveURL(/\/communities(?!\/new)/, { timeout: 15_000 })

    // Recargar y verificar que persiste
    await page.reload()
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 10_000 })
  })
})
