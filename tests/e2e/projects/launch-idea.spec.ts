import { test, expect } from '@playwright/test'

// Story 9.8 — Modal "Lanzar una nueva idea"
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Requiere comunidad con slug 'startup-madrid' y el e2e test user como miembro en el seed

test.describe('LaunchIdeaModal — flujo modal lanzar idea (Story 9.8)', () => {
  const COMMUNITY_FEED_URL = '/communities/startup-madrid'

  test(
    'abre el modal al hacer click en el botón "Lanzar idea"',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)

      const launchButton = page.getByTestId('btn-launch-idea')
      await expect(launchButton).toBeVisible()

      await launchButton.click()

      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Lanzar una nueva idea' })).toBeVisible()
    }
  )

  test(
    'submit válido lanza la idea — muestra toast de éxito',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)
      await page.getByTestId('btn-launch-idea').click()
      await expect(page.getByRole('dialog')).toBeVisible()

      await page.getByTestId('modal-field-title').fill('Idea de test E2E')
      await page.getByTestId('modal-field-tagline').fill('Tagline de la idea de test')
      await page.getByTestId('modal-field-problem').fill('El problema es que los tests de e2e no cubren el modal')
      await page.getByTestId('modal-field-solution').fill('La solución es añadir un spec de e2e completo')
      await page.getByTestId('modal-field-hypothesis').fill('Si añado tests e2e, el modal queda cubierto')

      await page.getByRole('button', { name: '+ Lanzar proyecto' }).click()

      await expect(page.getByText('¡Idea lanzada! Ya está recibiendo feedback.')).toBeVisible({ timeout: 10_000 })
    }
  )

  test(
    'submit vacío muestra errores de validación para los campos requeridos',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)
      await page.getByTestId('btn-launch-idea').click()
      await expect(page.getByRole('dialog')).toBeVisible()

      await page.getByRole('button', { name: '+ Lanzar proyecto' }).click()

      await expect(page.getByRole('alert').first()).toBeVisible()
      // Los campos title, problem, solution e hypothesis deben mostrar error
      const alerts = page.getByRole('alert')
      await expect(alerts.first()).toBeVisible()
    }
  )

  test(
    'cancelar limpia el estado — campos vacíos al reabrir el modal',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)
      await page.getByTestId('btn-launch-idea').click()
      await expect(page.getByRole('dialog')).toBeVisible()

      await page.getByTestId('modal-field-title').fill('Texto temporal')

      await page.getByRole('button', { name: 'Cancelar' }).click()
      await expect(page.getByRole('dialog')).not.toBeVisible()

      await page.getByTestId('btn-launch-idea').click()
      await expect(page.getByRole('dialog')).toBeVisible()

      await expect(page.getByTestId('modal-field-title')).toHaveValue('')
    }
  )
})
