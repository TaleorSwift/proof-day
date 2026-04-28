import { test, expect } from '@playwright/test'

// story 2.2 — flujo link de invitación
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

test.describe('Invite link — sin autenticación', () => {
  // Limpiar auth cookies: verifica comportamiento sin sesión activa
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  test('visitar /invite/{token} sin sesión redirige a /login con next param', async ({ page }) => {
    await page.goto('/invite/cualquier-token-123')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('la URL de redirect incluye next=/invite/{token}', async ({ page }) => {
    await page.goto('/invite/mi-token-abc')
    await expect(page).toHaveURL(/next=%2Finvite%2Fmi-token-abc/, { timeout: 10_000 })
  })
})

test.describe('Invite link — token ya usado', () => {
  // Requiere usuario autenticado (storageState de auth.setup.ts)
  // Requiere token ya usado en el seed: un invitation_link con used_at no nulo.
  // Si no hay token usado en el seed, marcar como skip.
  test.skip(
    true,
    'Requiere un token con used_at no nulo en el seed de Supabase local. ' +
    'Cuando el seed incluya un token ya usado, eliminar este skip.'
  )

  test('visitar /invite/{token_ya_usado} muestra la página de error', async ({ page }) => {
    // Sustituir 'used-token-from-seed' por el token real del seed
    await page.goto('/invite/used-token-from-seed')
    await expect(page.getByText('Link inválido')).toBeVisible({ timeout: 10_000 })
    await expect(
      page.getByText('Este link ya no es válido')
    ).toBeVisible()
  })

  test('la página de error muestra el texto de solicitar nuevo link', async ({ page }) => {
    await page.goto('/invite/used-token-from-seed')
    await expect(
      page.getByText('Solicita un nuevo link de invitación al administrador de la comunidad.')
    ).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Invite link — happy path (join completo)', () => {
  // Requiere: usuario autenticado + token válido (no usado) para una comunidad del seed.
  // El token debe generarse en el seed de Supabase vía SQL INSERT en invitation_links.
  // Ejemplo de seed SQL:
  //   INSERT INTO invitation_links (token, community_id, created_by)
  //   VALUES ('e2e-happy-token-001', '<community_id_del_seed>', '<admin_user_id>');
  test.skip(
    true,
    'Requiere token válido insertado en el seed de Supabase local. ' +
    'Setup: INSERT en invitation_links con token conocido + community_id del seed. ' +
    'Cuando el seed soporte esto, eliminar este skip y actualizar el token.'
  )

  test('visitar /invite/{token_valido} redirige a /communities tras join exitoso', async ({ page }) => {
    // Sustituir 'e2e-happy-token-001' por el token real del seed
    await page.goto('/invite/e2e-happy-token-001')
    await expect(page).toHaveURL(/\/communities(\/|\?|#|$)/, { timeout: 15_000 })
  })
})
