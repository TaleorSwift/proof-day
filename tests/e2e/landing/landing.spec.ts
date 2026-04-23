import { test, expect } from '@playwright/test'

test.describe('Landing page — visitante no autenticado', () => {
  // Limpiar auth cookies: la landing redirige a /communities si hay sesión activa
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  test('/ devuelve 200 y no redirige a /login', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(400)
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('h1 "Bienvenido a Proof Day" es visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Bienvenido a Proof Day' })).toBeVisible()
  })

  test('CTA "Continuar con email" enlaza a /login', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByRole('link', { name: 'Continuar con email' })
    await expect(cta).toBeVisible()
    const href = await cta.getAttribute('href')
    expect(href).toBe('/login')
  })
})
