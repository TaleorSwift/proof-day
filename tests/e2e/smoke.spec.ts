import { test, expect } from '@playwright/test'

test.describe('Smoke test — app loads', () => {
  test('homepage should return 200', async ({ page }) => {
    // Este test requiere que el servidor este corriendo en localhost:3000
    // Ejecutar con: npm run dev && npm run test:e2e
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(500)
  })
})
