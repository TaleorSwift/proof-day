import { test, expect } from '@playwright/test'

// E2E tests para Story 8.5 — ProjectFeed + Rediseño Homepage de Comunidad

test.describe('Community Homepage — ProjectFeed', () => {
  test('muestra sección En validación con proyectos live', async ({ page }) => {
    await page.goto('/communities/startup-madrid')
    await expect(page.getByRole('heading', { name: 'Ideas en validación' })).toBeVisible()
    await expect(page.getByTestId('project-card').first()).toBeVisible()
  })

  test('muestra sección Cerrados con proyectos inactive', async ({ page }) => {
    await page.goto('/communities/startup-madrid')
    await expect(page.getByRole('heading', { name: 'Cerrados' })).toBeVisible()
  })

  test('oculta sección si no hay proyectos live', async ({ page }) => {
    await page.goto('/communities/comunidad-sin-live')
    // La sección live usa un h2 propio — el h1 "Ideas en validación" es siempre visible (CommunityFeedHeader)
    await expect(page.getByRole('heading', { name: /Live.*aceptando feedback/i })).not.toBeVisible()
  })

  test('oculta sección si no hay proyectos inactive', async ({ page }) => {
    await page.goto('/communities/comunidad-sin-inactive')
    await expect(page.getByRole('heading', { name: 'Cerrados' })).not.toBeVisible()
  })

  test('muestra estado vacío global cuando no hay proyectos', async ({ page }) => {
    await page.goto('/communities/comunidad-vacia')
    await expect(page.getByTestId('empty-state')).toBeVisible()
  })

  test('no muestra el botón Nuevo proyecto en el feed', async ({ page }) => {
    await page.goto('/communities/startup-madrid')
    await expect(page.getByRole('link', { name: 'Nuevo proyecto' })).not.toBeVisible()
  })
})
