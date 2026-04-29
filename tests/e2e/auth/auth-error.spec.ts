import { test, expect } from '@playwright/test'

// /auth/error — página de error de autenticación (pública, sin sesión)

test.describe('AuthError — /auth/error', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  test('renderiza el heading de error con código desconocido', async ({ page }) => {
    await page.goto('/auth/error?error=invalid_code')

    // CardTitle renderiza como <div> sin rol heading — usar getByText
    await expect(page.getByText(/sorry.*went wrong/i)).toBeVisible()
  })

  test('renderiza el mensaje específico para confirmation_failed', async ({ page }) => {
    await page.goto('/auth/error?error=confirmation_failed')

    await expect(page.getByText('No hemos podido confirmar tu cuenta')).toBeVisible()
  })

  test('renderiza el mensaje genérico sin parámetro de error', async ({ page }) => {
    await page.goto('/auth/error')

    await expect(page.getByText('Ha ocurrido un error inesperado')).toBeVisible()
  })
})
