import { test, expect } from '@playwright/test'

// Story 9.7 — Project Detail: diferenciación owner vs reviewer
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Owner tests usan el usuario principal (e2e-community@proofday.local).
// Reviewer tests están en project-detail-roles.reviewer.spec.ts (proyecto chromium-reviewer).

test.describe('ProjectDetail — Owner (Story 9.7)', () => {
  const COMMUNITY_SLUG = 'producto-alpha'
  // e2e-own-project: builder_id = e2e00000-...099 (usuario de test principal), status live
  const PROJECT_LIVE_URL = `/communities/${COMMUNITY_SLUG}/projects/e2e-own-project`

  test(
    've el botón "Marcar como inactivo" en un proyecto propio live',
    async ({ page }) => {
      await page.goto(PROJECT_LIVE_URL)

      // Owner en proyecto live → ve ProjectStateActions (botón "Marcar como inactivo")
      const deactivateButton = page.getByRole('button', { name: /marcar como inactivo/i })
      await expect(deactivateButton).toBeVisible()
    }
  )

  test(
    'NO ve FeedbackFormInline en la sidebar cuando es el owner',
    async ({ page }) => {
      await page.goto(PROJECT_LIVE_URL)

      // El formulario de feedback es para reviewers, no owners
      const feedbackForm = page.getByRole('button', { name: /compartir insight/i })
      await expect(feedbackForm).not.toBeVisible()
    }
  )

  test('owner ve botón de reactivación en proyecto inactive propio', async ({ page }) => {
    await page.goto(`/communities/producto-alpha/projects/e2e-inactive-project`)
    // Owner en proyecto inactive → ve ProjectStateActions con "Publicar" o equivalente
    const publishButton = page.getByRole('button', { name: /publicar/i })
    await expect(publishButton).toBeVisible()
  })
})
