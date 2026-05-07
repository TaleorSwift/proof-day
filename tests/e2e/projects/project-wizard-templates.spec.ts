import { test, expect, type Page } from '@playwright/test'

// Épica 10 — Wizard con templates (Stories 10.2, 10.3, 10.4)
// El wizard vive dentro del LaunchIdeaModal — acceso vía btn-launch-idea en el feed.
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

test.describe('ProjectWizardTemplates — wizard multi-paso con templates', () => {
  const COMMUNITY_URL = '/communities/startup-madrid'

  async function openWizard(page: Page) {
    await page.goto(COMMUNITY_URL)
    await page.getByTestId('btn-launch-idea').click()
    await expect(page.getByRole('dialog')).toBeVisible()
  }

  test('muestra el grid de templates en el paso 1 del wizard', async ({ page }) => {
    await openWizard(page)

    await expect(page.getByTestId('wizard-step-1')).toBeVisible()
    await expect(page.getByTestId('template-grid')).toBeVisible()
  })

  test('muestra el indicador de progreso del wizard', async ({ page }) => {
    await openWizard(page)

    await expect(page.getByTestId('wizard-progress')).toBeVisible()
  })

  test('seleccionar un template activa el botón Siguiente', async ({ page }) => {
    await openWizard(page)

    // Cada template se renderiza como button dentro del grid
    const templateGrid = page.getByTestId('template-grid')
    await expect(templateGrid).toBeVisible()
    await templateGrid.getByRole('button').first().click()

    await expect(page.getByRole('button', { name: /continuar/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /continuar/i })).toBeEnabled()
  })

  test('paso 5 muestra la vista previa antes de publicar', async ({ page }) => {
    await openWizard(page)

    // Paso 1 (templates): click en primer template → click "Siguiente"
    const templateGrid = page.getByTestId('template-grid')
    await expect(templateGrid).toBeVisible()
    await templateGrid.getByRole('button').first().click()
    await page.getByRole('button', { name: /continuar/i }).click()

    // Paso 2 (description): rellenar campos requeridos → click "Siguiente"
    await expect(page.getByTestId('wizard-step-2')).toBeVisible()
    await page.getByTestId('wizard-field-title').fill('Proyecto E2E Test Preview')
    await page.getByTestId('wizard-field-tagline').fill('Tagline de prueba E2E')
    await page.getByTestId('wizard-field-problem').fill('Problema de prueba E2E para paso 5')
    await page.getByTestId('wizard-field-solution').fill('Solución de prueba E2E para paso 5')
    await page.getByRole('button', { name: /continuar/i }).click()

    // Paso 3 (details): campos opcionales → click "Siguiente"
    await expect(page.getByTestId('wizard-step-3')).toBeVisible()
    await page.getByRole('button', { name: /continuar/i }).click()

    // Paso 4 (hypothesis): campo opcional → rellenar y click "Siguiente"
    await expect(page.getByTestId('wizard-step-4')).toBeVisible()
    await page.getByTestId('wizard-field-hypothesis').fill('Si esta hipótesis se valida, el 70% de usuarios adoptará la solución.')
    await page.getByRole('button', { name: /continuar/i }).click()

    // Paso 5: verificar vista previa y botones de acción
    await expect(page.getByTestId('wizard-step-5')).toBeVisible()
    await expect(page.getByRole('button', { name: /publicar/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /editar/i })).toBeVisible()
  })
})
