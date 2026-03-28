import { test, expect } from '@playwright/test'

test.describe('Landing page — visitante no autenticado', () => {
  test('/ devuelve 200 y no redirige a /login', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(400)
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('h1 principal es visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('CTA "Solicitar acceso" apunta a mailto', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByRole('link', { name: /solicitar acceso/i }).first()
    await expect(cta).toBeVisible()
    const href = await cta.getAttribute('href')
    expect(href).toMatch(/^mailto:/)
  })

  test('sección "Cómo funciona" visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /cómo funciona/i })).toBeVisible()
  })

  test('footer visible con email de contacto', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(
      page.getByRole('link', { name: /hola@proofday\.app/i })
    ).toBeVisible()
  })
})
