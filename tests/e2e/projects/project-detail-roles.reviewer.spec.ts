import { test, expect } from '@playwright/test'

// Story 9.7 — Project Detail: vista reviewer (non-owner)
// Auth setup: tests/e2e/auth.setup.ts — proyecto chromium-reviewer usa reviewer.json
// El usuario e2e-reviewer@proofday.local (e2e00000-...097) es member de producto-alpha
// y NO es builder de ningún proyecto del seed.
// pulse-check: builder_id = a0000000-...001 → reviewer no es owner → OK
// retro-replay: builder_id = a0000000-...004 → reviewer no es owner → OK

test.describe('ProjectDetail — Reviewer no-owner (Story 9.7)', () => {
  const COMMUNITY_SLUG = 'producto-alpha'
  // pulse-check: builder_id = a0000000-...001 (Alex Rivera), status live
  const PROJECT_LIVE_URL = `/communities/${COMMUNITY_SLUG}/projects/pulse-check`
  // retro-replay: builder_id = a0000000-...004 (Ava Chen), status inactive
  const PROJECT_INACTIVE_URL = `/communities/${COMMUNITY_SLUG}/projects/retro-replay`

  test(
    'reviewer NO ve "Marcar como inactivo" ni "Publicar" en proyecto live',
    async ({ page }) => {
      await page.goto(PROJECT_LIVE_URL)

      // Esperar a que el título del proyecto sea visible (confirma que la página cargó)
      await expect(page.getByRole('heading', { name: /pulse check/i })).toBeVisible({ timeout: 10_000 })

      const deactivateButton = page.getByRole('button', { name: /marcar como inactivo/i })
      await expect(deactivateButton).not.toBeVisible()

      const publishButton = page.getByRole('button', { name: /publicar/i })
      await expect(publishButton).not.toBeVisible()
    }
  )

  test(
    'reviewer SÍ ve FeedbackFormInline en la sidebar en proyecto live',
    async ({ page }) => {
      await page.goto(PROJECT_LIVE_URL)

      // FeedbackFormInline muestra el botón de envío
      const submitButton = page.getByRole('button', { name: /compartir insight/i })
      await expect(submitButton).toBeVisible()
    }
  )

  test(
    'reviewer ve mensaje "Esta idea ya no acepta feedback" en proyecto inactive',
    async ({ page }) => {
      await page.goto(PROJECT_INACTIVE_URL)

      const closedMessage = page.getByText('Esta idea ya no acepta feedback.')
      await expect(closedMessage).toBeVisible()
    }
  )

  test(
    'reviewer NO ve FeedbackFormInline en proyecto inactive',
    async ({ page }) => {
      await page.goto(PROJECT_INACTIVE_URL)

      const submitButton = page.getByRole('button', { name: /compartir insight/i })
      await expect(submitButton).not.toBeVisible()
    }
  )
})
