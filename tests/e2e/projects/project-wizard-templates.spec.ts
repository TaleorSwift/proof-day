import { test, expect } from '@playwright/test'

// Épica 10 — Wizard con templates: selección de plantilla en paso 1 y vista previa en paso 5
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

test.describe('ProjectWizardTemplates — paso 1 y paso 5 del wizard', () => {
  const NEW_URL = '/communities/producto-alpha/projects/new'

  test('muestra el grid de templates en el paso 1 del wizard', async ({ page }) => {
    await page.goto(NEW_URL)

    await expect(page.getByTestId('wizard-step-1')).toBeVisible()
    await expect(page.getByTestId('template-grid')).toBeVisible()
  })

  test('muestra el indicador de progreso del wizard', async ({ page }) => {
    await page.goto(NEW_URL)

    await expect(page.getByTestId('wizard-progress')).toBeVisible()
  })

  test('seleccionar un template activa el botón Siguiente', async ({ page }) => {
    await page.goto(NEW_URL)

    // Seleccionar el primer template del grid
    const templateGrid = page.getByTestId('template-grid')
    await expect(templateGrid).toBeVisible()
    // Cada template se renderiza como button dentro del grid
    await templateGrid.getByRole('button').first().click()

    await expect(page.getByRole('button', { name: /siguiente/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /siguiente/i })).toBeEnabled()
  })

  test('paso 5 muestra la vista previa antes de publicar', async ({ page }) => {
    await page.goto(NEW_URL)

    // Paso 1 (templates): click en primer template → click "Siguiente"
    const templateGrid = page.getByTestId('template-grid')
    await expect(templateGrid).toBeVisible()
    await templateGrid.getByRole('button').first().click()
    await page.getByRole('button', { name: /siguiente/i }).click()

    // Paso 2 (description): rellenar campos requeridos → click "Siguiente"
    await expect(page.getByTestId('wizard-step-2')).toBeVisible()
    await page.getByTestId('wizard-field-title').fill('Proyecto E2E Test Preview')
    await page.getByTestId('wizard-field-tagline').fill('Tagline de prueba E2E')
    await page.getByTestId('wizard-field-problem').fill('Problema de prueba E2E para paso 5')
    await page.getByTestId('wizard-field-solution').fill('Solución de prueba E2E para paso 5')
    await page.getByRole('button', { name: /siguiente/i }).click()

    // Paso 3 (details): campos opcionales → click "Siguiente"
    await expect(page.getByTestId('wizard-step-3')).toBeVisible()
    await page.getByRole('button', { name: /siguiente/i }).click()

    // Paso 4 (hypothesis): campo opcional → rellenar y click "Siguiente"
    await expect(page.getByTestId('wizard-step-4')).toBeVisible()
    await page.getByTestId('wizard-field-hypothesis').fill('Si esta hipótesis se valida, el 70% de usuarios adoptará la solución.')
    await page.getByRole('button', { name: /siguiente/i }).click()

    // Paso 5: verificar vista previa y botones de acción
    await expect(page.getByTestId('wizard-step-5')).toBeVisible()
    await expect(page.getByRole('button', { name: /publicar/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /editar/i })).toBeVisible()
  })
})
