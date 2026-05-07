import { test, expect } from '@playwright/test'

// Épica 13 — Interpretación del Proof Score en la sidebar del owner
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Proyecto live owned by test user: e2e-own-project — ver supabase/seed.sql

test.describe('ScoreInterpretation — interpretación del Proof Score (Épica 13)', () => {
  const PROJECT_URL = '/communities/producto-alpha/projects/e2e-own-project'

  test('muestra el sidebar del Proof Score para el owner', async ({ page }) => {
    await page.goto(PROJECT_URL)

    await expect(page.getByTestId('proof-score-sidebar')).toBeVisible()
  })

  test.skip('la sección de interpretación está en estado loading o con contenido', async ({ page }) => {
    // Requiere ≥3 feedbacks en el seed para e2e-own-project.
    // El seed actual no garantiza ese volumen de feedbacks para el test user.
    await page.goto(PROJECT_URL)

    // El componente renderiza score-interpretation-loading mientras calcula
    // o score-interpretation cuando el cálculo está disponible
    const loading = page.getByTestId('score-interpretation-loading')
    const content = page.getByTestId('score-interpretation')

    await expect(loading.or(content)).toBeVisible()
  })
})
