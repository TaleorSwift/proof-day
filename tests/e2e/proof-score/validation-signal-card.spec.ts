import { test, expect } from '@playwright/test'

// Story 8.8 — ValidationSignalCard + Storybook
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Nota: ValidationSignalCard se renderiza en la sidebar para usuarios no-owner.
// ProofScoreSidebar es solo para owners — no se usa como contenedor aquí.

test.describe('ValidationSignalCard (Story 8.8)', () => {
  const COMMUNITY_SLUG = 'producto-alpha'
  const PROJECT_SLUG = 'pulse-check'
  const PROJECT_DETAIL_URL = `/communities/${COMMUNITY_SLUG}/projects/${PROJECT_SLUG}`

  test(
    'renderiza SignalIndicator con nivel Promising cuando el score es alto',
    async ({ page }) => {
      await page.goto(PROJECT_DETAIL_URL)

      // ValidationSignalCard se muestra directamente en la sidebar para no-owners
      const signalIndicator = page.getByTestId('signal-indicator')
      await expect(signalIndicator).toBeVisible()
      await expect(signalIndicator).toHaveText(/Promising/i)
    }
  )

  test(
    'renderiza ProgressBar con porcentaje del score medio',
    async ({ page }) => {
      await page.goto(PROJECT_DETAIL_URL)

      const progressbar = page.getByRole('progressbar').first()
      await expect(progressbar).toBeVisible()

      // El progressbar debe tener aria-valuenow con el porcentaje
      const valuenow = await progressbar.getAttribute('aria-valuenow')
      expect(Number(valuenow)).toBeGreaterThanOrEqual(0)
      expect(Number(valuenow)).toBeLessThanOrEqual(100)
    }
  )

  test(
    'renderiza disclaimer con feedbackCount interpolado',
    async ({ page }) => {
      await page.goto(PROJECT_DETAIL_URL)

      const disclaimer = page.getByText(/Basado en \d+ feedbacks/)
      await expect(disclaimer).toBeVisible()
    }
  )
})
