import { test, expect, type Page } from '@playwright/test'

// Épica 13 — AISuggestButton en el wizard (paso 2)
// El wizard vive dentro del LaunchIdeaModal — acceso vía btn-launch-idea en el feed.
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Los tests que hacen click y esperan respuesta de Ollama se marcan con test.skip
// ya que requieren Ollama corriendo localmente.

test.describe('WizardAISuggest — botón de sugerencia IA en paso 2', () => {
  const COMMUNITY_URL = '/communities/startup-madrid'

  // Navega desde el feed, abre el wizard y avanza al paso 2
  async function navegarAlPaso2(page: Page) {
    await page.goto(COMMUNITY_URL)
    await page.getByTestId('btn-launch-idea').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Paso 1 (templates): seleccionar primer template → click "Siguiente"
    const templateGrid = page.getByTestId('template-grid')
    await expect(templateGrid).toBeVisible()
    await templateGrid.getByRole('button').first().click()
    await page.getByRole('button', { name: /continuar/i }).click()

    await expect(page.getByTestId('wizard-step-2')).toBeVisible()
  }

  test('el botón de sugerencia IA es visible en el paso 2 y se activa al rellenar el título', async ({ page }) => {
    await navegarAlPaso2(page)

    // El botón está presente pero deshabilitado cuando no hay título
    await expect(page.getByTestId('ai-suggest-problem')).toBeVisible()
    await expect(page.getByTestId('ai-suggest-problem')).toBeDisabled()

    // Al rellenar el título, el botón se habilita
    await page.getByTestId('wizard-field-title').fill('Mi proyecto de validación')
    await expect(page.getByTestId('ai-suggest-problem')).toBeEnabled()
  })

  test.skip('click en botón IA muestra el spinner mientras genera la sugerencia', async ({ page }) => {
    // Requiere Ollama corriendo localmente en el entorno de test
    await navegarAlPaso2(page)
    await page.getByTestId('wizard-field-title').fill('Mi proyecto de validación')
    await page.getByTestId('ai-suggest-problem').click()
    await expect(page.getByTestId('ai-suggest-spinner')).toBeVisible()
  })

  test.skip('sugerencia IA muestra el badge ai-generated tras recibir respuesta', async ({ page }) => {
    // Requiere Ollama corriendo localmente en el entorno de test
    await navegarAlPaso2(page)
    await page.getByTestId('wizard-field-title').fill('Mi proyecto de validación')
    await page.getByTestId('ai-suggest-problem').click()
    await expect(page.getByTestId('ai-generated-badge')).toBeVisible({ timeout: 30_000 })
  })
})
