import { test, expect } from '@playwright/test'

// Story 9.7 — Project Detail: diferenciación owner vs reviewer
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// SKIP: estos tests requieren un segundo storageState de usuario non-owner.
// Solo hay un storageState (user.json) — el usuario de test es el owner de los proyectos seed.
// Para habilitarlos, crear un segundo usuario de test y su auth/user2.json correspondiente.

test.describe('ProjectDetail — Roles owner vs reviewer (Story 9.7)', () => {
  const COMMUNITY_SLUG = 'producto-alpha'
  const PROJECT_LIVE_URL = `/communities/${COMMUNITY_SLUG}/projects/pulse-check`
  const PROJECT_INACTIVE_URL = `/communities/${COMMUNITY_SLUG}/projects/retro-replay`

  // ---------------------------------------------------------------------------
  // Owner — verificar que ve sus controles de gestión
  // ---------------------------------------------------------------------------

  // Requiere proyecto 'pulse-check' con builder_id === usuario de test (e2e@proofday.local) en el seed
  test.describe('Owner', () => {
    test(
      've el botón "Publicar" o "Marcar como inactivo" (ProjectStateActions) en un proyecto propio',
      async ({ page }) => {
        // Requiere proyecto pulse-check cuyo builder_id coincide con el usuario de test
        await page.goto(PROJECT_LIVE_URL)

        // Owner en proyecto live → ve ProjectStateActions (botón "Marcar como inactivo")
        const deactivateButton = page.getByRole('button', { name: /marcar como inactivo/i })
        await expect(deactivateButton).toBeVisible()
      }
    )

    test(
      'NO ve FeedbackFormInline en la sidebar cuando es el owner',
      async ({ page }) => {
        // Requiere proyecto pulse-check cuyo builder_id coincide con el usuario de test
        await page.goto(PROJECT_LIVE_URL)

        // El formulario de feedback es para reviewers, no owners
        const feedbackForm = page.getByRole('button', { name: /compartir insight/i })
        await expect(feedbackForm).not.toBeVisible()
      }
    )
  })

  // ---------------------------------------------------------------------------
  // Reviewer (non-owner) — requieren segundo storageState
  // ---------------------------------------------------------------------------

  test.describe('Reviewer (non-owner)', () => {
    test.skip(
      true,
      'Requiere segundo storageState de usuario non-owner (tests/e2e/.auth/user2.json no existe).'
    )

    test(
      'reviewer NO ve "Marcar como inactivo" ni "Publicar" en proyecto live',
      async ({ page }) => {
        // Requiere proyecto cuyo builder_id NO coincide con el segundo usuario de test
        await page.goto(PROJECT_LIVE_URL)

        const deactivateButton = page.getByRole('button', { name: /marcar como inactivo/i })
        await expect(deactivateButton).not.toBeVisible()

        const publishButton = page.getByRole('button', { name: /publicar/i })
        await expect(publishButton).not.toBeVisible()
      }
    )

    test(
      'reviewer SÍ ve FeedbackFormInline en la sidebar en proyecto live',
      async ({ page }) => {
        // Requiere proyecto live cuyo builder_id NO coincide con el segundo usuario de test
        await page.goto(PROJECT_LIVE_URL)

        // FeedbackFormInline muestra el botón de envío
        const submitButton = page.getByRole('button', { name: /compartir insight/i })
        await expect(submitButton).toBeVisible()
      }
    )

    test(
      'reviewer ve mensaje "Esta idea ya no acepta feedback" en proyecto inactive',
      async ({ page }) => {
        // Requiere proyecto retro-replay con status inactive
        await page.goto(PROJECT_INACTIVE_URL)

        const closedMessage = page.getByText('Esta idea ya no acepta feedback.')
        await expect(closedMessage).toBeVisible()
      }
    )

    test(
      'reviewer NO ve FeedbackFormInline en proyecto inactive',
      async ({ page }) => {
        // Requiere proyecto inactive cuyo builder_id NO coincide con el segundo usuario
        await page.goto(PROJECT_INACTIVE_URL)

        const submitButton = page.getByRole('button', { name: /compartir insight/i })
        await expect(submitButton).not.toBeVisible()
      }
    )
  })
})
