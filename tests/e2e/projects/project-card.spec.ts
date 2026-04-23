import { test, expect } from '@playwright/test'

// Story 8.4 — ProjectCard rediseño horizontal
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

test.describe('ProjectCard — diseño horizontal (Story 8.4)', () => {
  // Comunidad y proyecto de prueba (deben existir en la BD de test)
  const COMMUNITY_SLUG = 'test-community'
  const COMMUNITY_FEED_URL = `/communities/${COMMUNITY_SLUG}`

  test(
    'muestra tarjetas horizontales en el feed de la comunidad',
    async ({ page }) => {
      // Dado: el usuario está autenticado y visita el feed de una comunidad con proyectos
      await page.goto(COMMUNITY_FEED_URL)

      // Entonces: ve al menos una tarjeta de proyecto
      const cards = page.getByTestId('project-card')
      await expect(cards.first()).toBeVisible()
    }
  )

  test(
    'cada tarjeta muestra thumbnail, título, StatusBadge, autor y feedback count',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)

      const firstCard = page.getByTestId('project-card').first()

      // Thumbnail (imagen o placeholder)
      const thumbnail = firstCard.getByTestId('project-card-thumbnail')
      await expect(thumbnail).toBeVisible()

      // Título del proyecto
      const title = firstCard.getByTestId('project-card-title')
      await expect(title).toBeVisible()
      await expect(title).not.toBeEmpty()

      // StatusBadge
      const statusBadge = firstCard.getByTestId('project-card-status')
      await expect(statusBadge).toBeVisible()

      // UserAvatar del autor
      const avatar = firstCard.getByRole('img', { name: /Avatar de/i })
      await expect(avatar).toBeVisible()

      // Feedback count
      const feedbackCount = firstCard.getByTestId('project-card-feedback-count')
      await expect(feedbackCount).toBeVisible()
    }
  )

  test(
    'muestra HeartButton con contador de likes',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)

      const firstCard = page.getByTestId('project-card').first()
      const heartButton = firstCard.getByRole('button', { name: /Me gusta/i })
      await expect(heartButton).toBeVisible()
    }
  )

  test(
    'click en la tarjeta navega a la página de detalle del proyecto',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)

      const firstCard = page.getByTestId('project-card').first()

      // Obtener el href del enlace
      const link = firstCard.locator('a').first()
      const href = await link.getAttribute('href')
      expect(href).toMatch(new RegExp(`/communities/${COMMUNITY_SLUG}/projects/`))

      // Click navega a la página de detalle
      await link.click()
      await expect(page).toHaveURL(new RegExp(`/communities/${COMMUNITY_SLUG}/projects/`))
    }
  )

  test(
    'HeartButton incrementa el contador de likes al hacer click (optimistic UI)',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)

      const firstCard = page.getByTestId('project-card').first()
      const heartButton = firstCard.getByRole('button', { name: /Me gusta/i })

      // Leer contador antes
      const countBefore = await firstCard
        .getByTestId('project-card-like-count')
        .textContent()
      const numBefore = parseInt(countBefore ?? '0', 10)

      // Click en HeartButton
      await heartButton.click()

      // El contador debe incrementar en 1 (optimistic)
      const countAfter = await firstCard
        .getByTestId('project-card-like-count')
        .textContent()
      const numAfter = parseInt(countAfter ?? '0', 10)

      expect(numAfter).toBe(numBefore + 1)
    }
  )

  test(
    'tarjeta sin imagen muestra placeholder con iniciales del proyecto',
    async ({ page }) => {
      // Requiere al menos una tarjeta sin image_urls en el seed de test
      await page.goto(COMMUNITY_FEED_URL)
      await expect(page.getByTestId('project-card-placeholder').first()).toBeVisible()
    }
  )
})
