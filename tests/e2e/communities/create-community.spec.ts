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

  test('muestra error inline bajo name al intentar crear comunidad con nombre duplicado', async ({ page }) => {
    // Crear primera comunidad con nombre único
    const duplicateName = `Comunidad Duplicada ${Date.now()}`
    await page.goto('/communities/new')
    await page.getByLabel('Nombre').fill(duplicateName)
    await page.getByLabel('Descripción').fill('Primera creación para test de duplicado')
    await page.getByRole('button', { name: 'Crear comunidad' }).click()
    await expect(page).toHaveURL(/\/communities(?!\/new)/, { timeout: 15_000 })

    // Volver a /communities/new e intentar crear la misma comunidad
    await page.goto('/communities/new')
    await page.getByLabel('Nombre').fill(duplicateName)
    await page.getByLabel('Descripción').fill('Segunda creación con nombre duplicado')
    await page.getByRole('button', { name: 'Crear comunidad' }).click()

    // Error inline bajo el campo name — NO redirige
    await expect(page.locator('#name-error')).toBeVisible({ timeout: 10_000 })
    await expect(page).toHaveURL(/\/communities\/new/)
  })

  test('crea comunidad con imageUrl válida y redirige fuera de /communities/new', async ({ page }) => {
    const nameWithImage = `Comunidad Imagen ${Date.now()}`
    await page.goto('/communities/new')
    await page.getByLabel('Nombre').fill(nameWithImage)
    await page.getByLabel('Descripción').fill('Comunidad con imagen de portada')
    await page.getByLabel('Imagen').fill('https://picsum.photos/200')
    await page.getByRole('button', { name: 'Crear comunidad' }).click()

    // Redirige — la URL ya no es /communities/new
    await expect(page).toHaveURL(/\/communities(?!\/new)/, { timeout: 15_000 })
  })

  test('muestra error inline bajo imageUrl con URL inválida', async ({ page }) => {
    await page.goto('/communities/new')
    await page.getByLabel('Nombre').fill('Comunidad URL Inválida')
    await page.getByLabel('Descripción').fill('Descripción válida para este test')
    await page.getByLabel('Imagen').fill('esto-no-es-una-url')
    await page.getByRole('button', { name: 'Crear comunidad' }).click()

    await expect(page.locator('#imageUrl-error')).toBeVisible()
    await expect(page).toHaveURL(/\/communities\/new/)
  })

  test('muestra error inline bajo name con nombre superior a 60 caracteres', async ({ page }) => {
    await page.goto('/communities/new')
    await page.getByLabel('Nombre').fill('A'.repeat(61))
    await page.getByLabel('Descripción').fill('Descripción válida para test de límite')
    await page.getByRole('button', { name: 'Crear comunidad' }).click()

    await expect(page.locator('#name-error')).toBeVisible()
    await expect(page.getByText('El nombre no puede superar 60 caracteres')).toBeVisible()
    await expect(page).toHaveURL(/\/communities\/new/)
  })

  test('muestra error inline bajo description con descripción superior a 500 caracteres', async ({ page }) => {
    await page.goto('/communities/new')
    await page.getByLabel('Nombre').fill('Nombre Válido')
    await page.getByLabel('Descripción').fill('A'.repeat(501))
    await page.getByRole('button', { name: 'Crear comunidad' }).click()

    await expect(page.locator('#description-error')).toBeVisible()
    await expect(page.getByText('La descripción no puede superar 500 caracteres')).toBeVisible()
    await expect(page).toHaveURL(/\/communities\/new/)
  })

  // Error 500 del servidor — requiere interceptar la red o un endpoint de test.
  // No se puede provocar un error 500 real sin modificar el servidor en tiempo de test.
  // Para cubrirlo: usar page.route() en Playwright para interceptar POST /api/communities y devolver 500.
  test.skip('muestra error global de servidor cuando el backend devuelve 500', () => {})
})
