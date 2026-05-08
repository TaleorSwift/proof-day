import { test, expect, type Page } from '@playwright/test'

// Épica 13 — AISuggestButton en el wizard (paso 2)
// El wizard vive dentro del LaunchIdeaModal — acceso vía btn-launch-idea en el feed.
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Nota: el test del badge intercepta la petición con page.route() porque Playwright Chromium
// no entrega el Promise de fetch para requests que tardan >5s sin bytes iniciales (interacción
// entre el Keep-Alive: timeout=5 del servidor y el comportamiento del browser controlado por CDP).
// El spinner test valida que el fetch se inicia con Ollama real; el badge test valida la lógica
// del componente ante una respuesta exitosa.

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

  test('click en botón IA muestra el spinner mientras genera la sugerencia', async ({ page }) => {
    await navegarAlPaso2(page)
    await page.getByTestId('wizard-field-title').fill('Mi proyecto de validación')
    await page.getByTestId('ai-suggest-problem').click()
    await expect(page.getByTestId('ai-suggest-spinner')).toBeVisible()
  })

  test('sugerencia IA muestra el badge ai-generated tras recibir respuesta', async ({ page }) => {
    // Intercepta la petición para evitar el problema de CDP+keep-alive en Playwright Chromium
    await page.route('**/api/ai/suggest-project-field', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ suggestion: 'Sugerencia de IA generada por mock en E2E.' }),
      })
    )
    await navegarAlPaso2(page)
    await page.getByTestId('wizard-field-title').fill('Mi proyecto de validación')
    await page.getByTestId('ai-suggest-problem').click()
    await expect(page.getByTestId('ai-generated-badge')).toBeVisible({ timeout: 10_000 })
  })
})
