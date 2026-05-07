import { test, expect } from '@playwright/test'

// Épica 12 — NotificationBell en la navegación principal
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Nota: el badge solo aparece si hay notificaciones — no se testea el conteo directamente.

test.describe('NotificationBell — campanilla de notificaciones en nav', () => {
  const COMMUNITY_URL = '/communities/producto-alpha'

  test('muestra el botón de notificaciones en la navegación', async ({ page }) => {
    await page.goto(COMMUNITY_URL)

    await expect(page.getByTestId('notification-bell')).toBeVisible()
  })

  test('hacer click en la campanilla mantiene el botón visible con el panel abierto', async ({ page }) => {
    await page.goto(COMMUNITY_URL)

    await page.getByTestId('notification-bell').click()

    // Tras abrir el panel, la campanilla sigue visible (anclaje del popover)
    await expect(page.getByTestId('notification-bell')).toBeVisible()
  })
})
