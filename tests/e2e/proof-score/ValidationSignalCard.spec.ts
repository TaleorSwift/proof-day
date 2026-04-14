import { test, expect } from '@playwright/test'

/**
 * E2E tests — Story 8.8: ValidationSignalCard + Storybook
 *
 * NOTA: Estos tests requieren sesión de usuario autenticado con proyectos
 * que tengan score calculado. Están marcados con test.skip hasta que se
 * configure el helper de autenticación E2E y datos seed de proof score.
 *
 * Para habilitarlos:
 * 1. Crear `tests/e2e/fixtures/auth.setup.ts` con login programático
 * 2. Configurar `storageState` en `playwright.config.ts`
 * 3. Asegurarse de que el proyecto seed tenga feedbackCount >= 3
 * 4. Reemplazar test.skip por test en los tests de abajo
 */

test.describe('ValidationSignalCard (Story 8.8)', () => {
  const COMMUNITY_SLUG = 'producto-alpha'
  const PROJECT_SLUG = 'pulse-check'
  const PROJECT_DETAIL_URL = `/communities/${COMMUNITY_SLUG}/projects/${PROJECT_SLUG}`

  test.skip(
    'renderiza SignalIndicator con nivel Promising cuando el score es alto',
    async ({ page }) => {
      await page.goto(PROJECT_DETAIL_URL)

      // ProofScoreSidebar debe contener ValidationSignalCard
      const sidebar = page.getByTestId('proof-score-sidebar')
      await expect(sidebar).toBeVisible()

      // SignalIndicator con nivel promising
      const signalIndicator = sidebar.getByTestId('signal-indicator')
      await expect(signalIndicator).toBeVisible()
      await expect(signalIndicator).toHaveText(/Promising/i)
    }
  )

  test.skip(
    'renderiza ProgressBar con porcentaje del score medio',
    async ({ page }) => {
      await page.goto(PROJECT_DETAIL_URL)

      const sidebar = page.getByTestId('proof-score-sidebar')
      const progressbar = sidebar.getByRole('progressbar')
      await expect(progressbar).toBeVisible()

      // El progressbar debe tener aria-valuenow con el porcentaje
      const valuenow = await progressbar.getAttribute('aria-valuenow')
      expect(Number(valuenow)).toBeGreaterThanOrEqual(0)
      expect(Number(valuenow)).toBeLessThanOrEqual(100)
    }
  )

  test.skip(
    'renderiza disclaimer con feedbackCount interpolado',
    async ({ page }) => {
      await page.goto(PROJECT_DETAIL_URL)

      const sidebar = page.getByTestId('proof-score-sidebar')
      const disclaimer = sidebar.getByText(/Basado en \d+ respuestas/)
      await expect(disclaimer).toBeVisible()
    }
  )
})
