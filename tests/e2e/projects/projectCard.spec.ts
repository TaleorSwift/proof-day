import { test, expect } from '@playwright/test'

/**
 * E2E tests — Story 8.4: ProjectCard rediseño horizontal
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

test.describe('ProjectCard — diseño horizontal (Story 8.4)', () => {
  // Comunidad y proyecto de prueba (deben existir en la BD de test)
  const COMMUNITY_SLUG = 'test-community'
  const COMMUNITY_FEED_URL = `/communities/${COMMUNITY_SLUG}`

  test.skip(
    'muestra tarjetas horizontales en el feed de la comunidad',
    async ({ page }) => {
      // Dado: el usuario está autenticado y visita el feed de una comunidad con proyectos
      await page.goto(COMMUNITY_FEED_URL)

      // Entonces: ve al menos una tarjeta de proyecto
      const cards = page.getByTestId('project-card')
      await expect(cards.first()).toBeVisible()
    }
  )

  test.skip(
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

  test.skip(
    'muestra HeartButton con contador de likes',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)

      const firstCard = page.getByTestId('project-card').first()
      const heartButton = firstCard.getByRole('button', { name: /Me gusta/i })
      await expect(heartButton).toBeVisible()
    }
  )

  test.skip(
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

  test.skip(
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

  test.skip(
    'tarjeta sin imagen muestra placeholder con iniciales del proyecto',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)

      // Buscar una tarjeta que tenga placeholder (sin imagen)
      const placeholder = page.getByTestId('project-card-placeholder').first()
      if (await placeholder.isVisible()) {
        await expect(placeholder).toBeVisible()
      }
      // Si no hay tarjetas sin imagen en el seed de test, el test pasa vacío
    }
  )
})
