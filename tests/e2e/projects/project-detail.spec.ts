import { test, expect } from '@playwright/test'

// Story 8.7 — Project Detail: Layout y contenido
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

test.describe('ProjectDetail — Layout y contenido (Story 8.7)', () => {
  const COMMUNITY_SLUG = 'producto-alpha'
  // Proyecto CON target_user, demo_url y feedback_topics (para ACs que esperan datos presentes)
  const PROJECT_WITH_DATA_URL = `/communities/${COMMUNITY_SLUG}/projects/pulse-check`
  // Proyecto SIN target_user, demo_url ni feedback_topics (para ACs que esperan ausencia)
  const PROJECT_WITHOUT_OPTIONAL_URL = `/communities/${COMMUNITY_SLUG}/projects/minimal-project`

  test(
    'muestra BackButton con label "← Volver al feed" enlazando a la comunidad (AC-1)',
    async ({ page }) => {
      await page.goto(PROJECT_WITH_DATA_URL)

      const backButton = page.getByTestId('project-detail-back-button')
      await expect(backButton).toBeVisible()
      await expect(backButton).toContainText('Volver al feed')

      const href = await backButton.locator('a').getAttribute('href')
      expect(href).toBe(`/communities/${COMMUNITY_SLUG}`)
    }
  )

  test(
    'el header incluye h1 con título, StatusBadge y UserAvatar del autor (AC-2)',
    async ({ page }) => {
      await page.goto(PROJECT_WITH_DATA_URL)

      const title = page.getByTestId('project-detail-title')
      await expect(title).toBeVisible()
      await expect(title).not.toBeEmpty()

      const statusBadge = page.getByTestId('status-badge')
      await expect(statusBadge).toBeVisible()

      const authorAvatar = page.getByTestId('project-detail-author-avatar')
      await expect(authorAvatar).toBeVisible()
    }
  )

  test(
    'muestra imagen destacada cuando el proyecto tiene image_urls (AC-3, AC-10)',
    async ({ page }) => {
      await page.goto(PROJECT_WITH_DATA_URL)

      const featuredImage = page.getByTestId('project-detail-featured-image')
      await expect(featuredImage).toBeVisible()

      const img = featuredImage.locator('img')
      await expect(img).toBeVisible()
    }
  )

  test(
    'no muestra sección "Usuario objetivo" cuando target_user es null (AC-5)',
    async ({ page }) => {
      // Requiere proyecto sin target_user en el seed (minimal-project)
      await page.goto(PROJECT_WITHOUT_OPTIONAL_URL)

      const targetUserSection = page.getByTestId('project-detail-section-target-user')
      await expect(targetUserSection).not.toBeVisible()
    }
  )

  test(
    'muestra sección "Usuario objetivo" cuando target_user tiene valor (AC-5)',
    async ({ page }) => {
      // Requiere proyecto con target_user en el seed (pulse-check)
      await page.goto(PROJECT_WITH_DATA_URL)

      const targetUserSection = page.getByTestId('project-detail-section-target-user')
      await expect(targetUserSection).toBeVisible()
    }
  )

  test(
    'no muestra sección "Ver demo" cuando demo_url es null (AC-6)',
    async ({ page }) => {
      // Requiere proyecto sin demo_url en el seed (minimal-project)
      await page.goto(PROJECT_WITHOUT_OPTIONAL_URL)

      const demoSection = page.getByTestId('project-detail-section-demo')
      await expect(demoSection).not.toBeVisible()
    }
  )

  test(
    'muestra sección "Ver demo" con enlace correcto cuando demo_url tiene valor (AC-6)',
    async ({ page }) => {
      await page.goto(PROJECT_WITH_DATA_URL)

      const demoSection = page.getByTestId('project-detail-section-demo')
      await expect(demoSection).toBeVisible()

      const link = demoSection.locator('a')
      await expect(link).toHaveText('Ver demo')
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  )

  test(
    'no muestra sección "Temas de feedback" cuando feedback_topics es vacío (AC-7)',
    async ({ page }) => {
      // Requiere proyecto sin feedback_topics en el seed (minimal-project)
      await page.goto(PROJECT_WITHOUT_OPTIONAL_URL)

      const feedbackTopicsSection = page.getByTestId('project-detail-section-feedback-topics')
      await expect(feedbackTopicsSection).not.toBeVisible()
    }
  )

  test(
    'muestra ContentTag por cada feedback_topic cuando el array tiene elementos (AC-7)',
    async ({ page }) => {
      await page.goto(PROJECT_WITH_DATA_URL)

      const feedbackTopicsSection = page.getByTestId('project-detail-section-feedback-topics')
      await expect(feedbackTopicsSection).toBeVisible()

      const tags = feedbackTopicsSection.locator('span')
      await expect(tags.first()).toBeVisible()
    }
  )
})
