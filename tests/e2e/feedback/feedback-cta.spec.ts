import { test, expect } from '@playwright/test'

// Story 8.10 — FeedbackCTA contextual
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

test.describe('FeedbackCTA — call-to-action contextual en página de proyecto', () => {
  test('muestra "Ayuda a mejorar esta idea" para miembro autenticado no-owner', async ({ page }) => {
    // Arrange: usuario autenticado que NO es el builder del proyecto
    // Navegar a un proyecto live — pulse-check es de Alex, test user es miembro de producto-alpha
    await page.goto('/communities/producto-alpha/projects/pulse-check')

    // Act & Assert: FeedbackFormInline aparece en la sidebar con el heading correcto
    // (para no-owners en proyectos live se usa FeedbackFormInline, no FeedbackCTA)
    await expect(
      page.getByRole('heading', { name: 'Ayuda a mejorar esta idea' })
    ).toBeVisible()

    // El botón de submit del formulario inline está presente
    await expect(
      page.getByTestId('feedback-form-inline-submit')
    ).toBeVisible()
  })

  test('oculta el CTA cuando el usuario autenticado es el owner del proyecto', async ({ page }) => {
    // Arrange: usuario autenticado que ES el builder del proyecto
    // e2e-own-project es propiedad del test user en producto-alpha
    await page.goto('/communities/producto-alpha/projects/e2e-own-project')

    // Act & Assert: el CTA no existe en el DOM (variant owner devuelve null)
    await expect(
      page.getByTestId('feedback-cta')
    ).not.toBeAttached()

    // Tampoco aparece el heading
    await expect(
      page.getByRole('heading', { name: 'Ayuda a mejorar esta idea' })
    ).not.toBeAttached()
  })

  test.skip('muestra prompt de sign-in para usuario no autenticado', async ({ page }) => {
    // Arrange: usuario no autenticado accede a una ruta pública de proyecto
    // Nota: actualmente page.tsx redirige a /auth/login si no hay sesión.
    // Este test cubre la variante unauthenticated para cuando se habiliten rutas públicas.
    await page.goto('/communities/producto-alpha/projects/pulse-check')

    // Act & Assert: se muestra el CTA con link de sign-in
    await expect(
      page.getByTestId('feedback-cta-signin-link')
    ).toBeVisible()

    await expect(
      page.getByRole('link', { name: 'Inicia sesión para dar feedback' })
    ).toBeVisible()

    // No aparece el botón de feedback autenticado
    await expect(
      page.getByTestId('feedback-cta-button-wrapper')
    ).not.toBeAttached()
  })
})
