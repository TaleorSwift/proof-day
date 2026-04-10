import { test, expect } from '@playwright/test'

/**
 * E2E tests — Story 8.7: Project Detail — Layout y contenido
 *
 * NOTA: Estos tests requieren sesión de usuario autenticado.
 * El proyecto usa Supabase Auth con PKCE. No hay fixtures de auth
 * automáticos configurados en este entorno de test — los tests
 * están marcados con test.skip hasta que se implemente el helper
 * de autenticación E2E (ej. usando storage state de Playwright).
 *
 * Para habilitarlos:
 * 1. Crear `tests/e2e/fixtures/auth.setup.ts` con login programático
 * 2. Configurar `storageState` en `playwright.config.ts`
 * 3. Reemplazar test.skip por test en los tests de abajo
 */

test.describe('ProjectDetail — Layout y contenido (Story 8.7)', () => {
  const COMMUNITY_SLUG = 'test-community'
  const PROJECT_ID = 'test-project-id'
  const PROJECT_DETAIL_URL = `/communities/${COMMUNITY_SLUG}/projects/${PROJECT_ID}`

  test.skip(
    'muestra BackButton con label "← Volver al feed" enlazando a la comunidad (AC-1)',
    async ({ page }) => {
      await page.goto(PROJECT_DETAIL_URL)

      const backButton = page.getByTestId('project-detail-back-button')
      await expect(backButton).toBeVisible()
      await expect(backButton).toContainText('Volver al feed')

      const href = await backButton.getAttribute('href')
      expect(href).toBe(`/communities/${COMMUNITY_SLUG}`)
    }
  )

  test.skip(
    'el header incluye h1 con título, StatusBadge y UserAvatar del autor (AC-2)',
    async ({ page }) => {
      await page.goto(PROJECT_DETAIL_URL)

      // h1 con el título
      const title = page.getByTestId('project-detail-title')
      await expect(title).toBeVisible()
      await expect(title).not.toBeEmpty()

      // StatusBadge
      const statusBadge = page.getByTestId('status-badge')
      await expect(statusBadge).toBeVisible()

      // UserAvatar del autor
      const authorAvatar = page.getByTestId('project-detail-author-avatar')
      await expect(authorAvatar).toBeVisible()
    }
  )

  test.skip(
    'muestra imagen destacada cuando el proyecto tiene image_urls (AC-3, AC-10)',
    async ({ page }) => {
      await page.goto(PROJECT_DETAIL_URL)

      const featuredImage = page.getByTestId('project-detail-featured-image')
      await expect(featuredImage).toBeVisible()

      // La imagen destacada es next/image — verificar que existe el elemento img
      const img = featuredImage.locator('img')
      await expect(img).toBeVisible()
    }
  )

  test.skip(
    'no muestra sección "Usuario objetivo" cuando target_user es null (AC-5)',
    async ({ page }) => {
      // Este test requiere un proyecto sin target_user en el seed de test
      await page.goto(PROJECT_DETAIL_URL)

      const targetUserSection = page.getByTestId('project-detail-section-target-user')
      await expect(targetUserSection).not.toBeVisible()
    }
  )

  test.skip(
    'muestra sección "Usuario objetivo" cuando target_user tiene valor (AC-5)',
    async ({ page }) => {
      // Este test requiere un proyecto con target_user en el seed de test
      await page.goto(PROJECT_DETAIL_URL)

      const targetUserSection = page.getByTestId('project-detail-section-target-user')
      await expect(targetUserSection).toBeVisible()
    }
  )

  test.skip(
    'no muestra sección "Ver demo" cuando demo_url es null (AC-6)',
    async ({ page }) => {
      await page.goto(PROJECT_DETAIL_URL)

      const demoSection = page.getByTestId('project-detail-section-demo')
      await expect(demoSection).not.toBeVisible()
    }
  )

  test.skip(
    'muestra sección "Ver demo" con enlace correcto cuando demo_url tiene valor (AC-6)',
    async ({ page }) => {
      await page.goto(PROJECT_DETAIL_URL)

      const demoSection = page.getByTestId('project-detail-section-demo')
      await expect(demoSection).toBeVisible()

      // El enlace debe mostrar "Ver demo", no la URL cruda
      const link = demoSection.locator('a')
      await expect(link).toHaveText('Ver demo')
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  )

  test.skip(
    'no muestra sección "Temas de feedback" cuando feedback_topics es vacío (AC-7)',
    async ({ page }) => {
      await page.goto(PROJECT_DETAIL_URL)

      const feedbackTopicsSection = page.getByTestId('project-detail-section-feedback-topics')
      await expect(feedbackTopicsSection).not.toBeVisible()
    }
  )

  test.skip(
    'muestra ContentTag por cada feedback_topic cuando el array tiene elementos (AC-7)',
    async ({ page }) => {
      await page.goto(PROJECT_DETAIL_URL)

      const feedbackTopicsSection = page.getByTestId('project-detail-section-feedback-topics')
      await expect(feedbackTopicsSection).toBeVisible()

      // Debe haber al menos un tag renderizado
      const tags = feedbackTopicsSection.locator('span')
      await expect(tags.first()).toBeVisible()
    }
  )
})
