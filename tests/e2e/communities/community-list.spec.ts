import { test, expect } from '@playwright/test'

// Banner no-access y cambio de comunidad vía CommunitySwitcher
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

test.describe('Banner no-access — usuario autenticado', () => {
  test('muestra el banner cuando la URL incluye error=no-access', async ({ page }) => {
    await page.goto('/communities?error=no-access')
    // Usar el texto exacto para evitar colisión con el route announcer de Next.js
    await expect(
      page.getByText('No tienes acceso a esta comunidad.')
    ).toBeVisible({ timeout: 10_000 })
  })

  test('no muestra el banner cuando se accede a /communities sin error', async ({ page }) => {
    await page.goto('/communities')
    await expect(page).toHaveURL(/\/communities(\/|\?|#|$)/, { timeout: 10_000 })
    await expect(
      page.getByText('No tienes acceso a esta comunidad.')
    ).not.toBeVisible()
  })
})

test.describe('CommunitySwitcher — cambio de comunidad', () => {
  // Requiere usuario e2e-community@proofday.local con ≥2 comunidades en el seed.
  // El seed de test incluye al menos "Producto Alpha" asignada al TEST_USER_ID.
  // Si el usuario solo tiene 1 comunidad, el switcher no aparece (AC-6) y el test falla.
  test.skip(
    true,
    'Requiere seed con ≥2 comunidades para el usuario e2e-community@proofday.local. ' +
    'Cuando el seed tenga múltiples comunidades, eliminar este skip y activar el test.'
  )

  test('abre el switcher y navega a otra comunidad', async ({ page }) => {
    // Navegar a una comunidad conocida del seed
    await page.goto('/communities')
    await expect(page).toHaveURL(/\/communities(\/|\?|#|$)/, { timeout: 10_000 })

    // El trigger del switcher muestra el nombre de la comunidad activa o "Mis comunidades"
    const trigger = page.getByRole('button', { name: /comunidades|alpha|beta/i })
    await expect(trigger).toBeVisible()
    await trigger.click()

    // Seleccionar el primer item del dropdown que no sea la comunidad activa
    const items = page.getByRole('menuitem')
    const count = await items.count()
    expect(count).toBeGreaterThan(0)

    // Click en el primer item disponible
    await items.first().click()

    // La URL debe cambiar a /communities/{slug}
    await expect(page).toHaveURL(/\/communities\//, { timeout: 10_000 })
  })
})

test.describe('Empty state — usuario sin comunidades', () => {
  // Requiere un usuario de test sin comunidades asignadas.
  // El usuario actual (e2e-community@proofday.local) tiene comunidades en el seed.
  // Para activar este test, crear un usuario separado sin membresías en auth.setup.ts.
  test.skip(
    true,
    'Requiere usuario de test sin comunidades. Crear fixture específico en auth.setup.ts.'
  )

  test('muestra el empty state cuando el usuario no tiene comunidades', async ({ page }) => {
    await page.goto('/communities')
    await expect(
      page.getByText('Aún no perteneces a ninguna comunidad')
    ).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('btn-create-community')).toBeVisible()
  })
})
