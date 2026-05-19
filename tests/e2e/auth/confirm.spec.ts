import { test, expect } from '@playwright/test'

// auth/confirm — página intermedia anti-scanner de magic link

test.describe('ConfirmPage — /auth/confirm', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  test('muestra el botón de acceso cuando los params son válidos', async ({ page }) => {
    await page.goto('/auth/confirm?token=abc123&type=magiclink')

    await expect(page.getByRole('button', { name: /acceder a proof day/i })).toBeVisible()
  })

  test('redirige a login con error cuando no hay parámetros', async ({ page }) => {
    await page.goto('/auth/confirm')

    await expect(page).toHaveURL(/\/login.*error=link-invalid/)
  })

  test('redirige a login con error cuando type es inválido', async ({ page }) => {
    await page.goto('/auth/confirm?token=abc123&type=notavalidtype')

    await expect(page).toHaveURL(/\/login.*error=link-invalid/)
  })
})
