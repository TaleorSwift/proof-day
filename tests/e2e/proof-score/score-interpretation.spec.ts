import { test, expect } from '@playwright/test'

// Épica 13 — Interpretación del Proof Score en la sidebar del owner
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Proyecto live owned by test user: e2e-own-project — ver supabase/seed.sql
// Nota: proof-score-sidebar solo se renderiza cuando score !== null (≥3 feedbacks).
// Sin feedbacks, se muestra ProofScoreWaiting (skeleton/progress) en su lugar.

test.describe('ScoreInterpretation — sidebar del Proof Score (Épica 13)', () => {
  const PROJECT_URL = '/communities/producto-alpha/projects/e2e-own-project'

  test('muestra el bloque "Feedback recibido" en la sidebar del owner', async ({ page }) => {
    await page.goto(PROJECT_URL)

    // El heading "Feedback recibido" está siempre presente para el owner independientemente del score
    await expect(page.getByRole('heading', { name: /feedback recibido/i })).toBeVisible()
  })

  test.skip('muestra el sidebar del Proof Score cuando hay suficientes feedbacks', async ({ page }) => {
    // Requiere ≥3 feedbacks en el seed para e2e-own-project.
    // El seed actual no garantiza ese volumen — marcar como skip hasta ampliar el seed.
    await page.goto(PROJECT_URL)

    await expect(page.getByTestId('proof-score-sidebar')).toBeVisible()
  })

  test.skip('la sección de interpretación está en estado loading o con contenido', async ({ page }) => {
    // Requiere ≥3 feedbacks en el seed para e2e-own-project.
    await page.goto(PROJECT_URL)

    const loading = page.getByTestId('score-interpretation-loading')
    const content = page.getByTestId('score-interpretation')

    await expect(loading.or(content)).toBeVisible()
  })
})
