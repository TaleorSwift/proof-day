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
  // CommunitySwitcherClient existe pero no está montado en ninguna ruta del app actual.
  // Activar cuando el componente se integre en el layout o navbar.
  test.skip(true, 'CommunitySwitcher no está montado en ninguna ruta — pendiente de integración en layout.')

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

// Empty state (usuario sin comunidades) → community-list.isolated.spec.ts (chromium-isolated)
