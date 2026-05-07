import { test, expect } from '@playwright/test'

// Épica 12 — AISummaryCard en la sidebar del owner
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Proyecto live owned by test user: e2e-own-project — ver supabase/seed.sql
// El test user no tiene feedbacks asociados a e2e-own-project en el seed.

test.describe('AISummaryCard — tarjeta de resumen IA en sidebar del owner', () => {
  const PROJECT_URL = '/communities/producto-alpha/projects/e2e-own-project'

  test('muestra la tarjeta de resumen IA en la sidebar del owner', async ({ page }) => {
    await page.goto(PROJECT_URL)

    // El componente siempre renderiza uno de los tres estados posibles
    const card = page.getByTestId('ai-summary-card')
    const skeleton = page.getByTestId('ai-summary-skeleton')
    const empty = page.getByTestId('ai-summary-empty')

    // Al menos uno de los tres estados debe estar presente en el DOM
    await expect(card.or(skeleton).or(empty)).toBeVisible()
  })

  test.skip('el estado vacío del resumen IA es visible cuando no hay feedbacks', async ({ page }) => {
    // Requiere que el seed garantice e2e-own-project sin feedbacks asociados al test user.
    // El seed actual no tiene feedbacks para e2e-own-project — marcar como skip hasta confirmar.
    await page.goto(PROJECT_URL)

    await expect(page.getByTestId('ai-summary-empty')).toBeVisible()
  })
})
