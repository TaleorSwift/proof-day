import { test, expect } from '@playwright/test'

// Story 9.8 — Modal "Lanzar una nueva idea"
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Requiere comunidad con slug 'startup-madrid' y el e2e test user como miembro en el seed

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const ADMIN_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${SERVICE_KEY}`,
  apikey: SERVICE_KEY,
}

test.describe('LaunchIdeaModal — flujo modal lanzar idea (Story 9.8)', () => {
  const COMMUNITY_FEED_URL = '/communities/startup-madrid'
  const testTitle = `Idea de test E2E ${Date.now()}`

  test.afterAll(async () => {
    await fetch(
      `${SUPABASE_URL}/rest/v1/projects?slug=ilike.idea-de-test-e2e-*`,
      { method: 'DELETE', headers: ADMIN_HEADERS, signal: AbortSignal.timeout(5000) }
    )
  })

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

      await page.getByTestId('modal-field-title').fill(testTitle)
      await page.getByTestId('modal-field-tagline').fill('Tagline de la idea de test')
      await page.getByTestId('modal-field-problem').fill('El problema es que los tests de e2e no cubren el modal')
      await page.getByTestId('modal-field-solution').fill('La solución es añadir un spec de e2e completo')
      await page.getByTestId('modal-field-hypothesis').fill('Si añado tests e2e, el modal queda cubierto')

      await page.getByRole('button', { name: '+ Lanzar proyecto' }).click()

      await expect(page.getByText('¡Idea lanzada! Ya está recibiendo feedback.')).toBeVisible({ timeout: 10_000 })

      // Verificar que el proyecto aparece en el feed tras submit
      await expect(page.getByText(testTitle)).toBeVisible({ timeout: 10_000 })
    }
  )

  test(
    'submit vacío muestra errores de validación para los campos requeridos',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)
      await page.getByTestId('btn-launch-idea').click()
      await expect(page.getByRole('dialog')).toBeVisible()

      await page.getByRole('button', { name: '+ Lanzar proyecto' }).click()

      // Verificar los 5 campos requeridos: title, tagline, problem, solution, hypothesis
      await expect(page.getByRole('alert')).toHaveCount(5)
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
