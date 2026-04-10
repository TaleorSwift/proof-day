import { test, expect } from '@playwright/test'

// Story 8.9 — TeamPerspectives (feedbacks públicos)
// Estos tests se activarán cuando el entorno E2E esté configurado con datos seed.
// Por ahora se marcan como test.skip siguiendo el contrato TDD Outside-In.

test.describe('TeamPerspectives — feedbacks públicos para miembros', () => {
  test.skip('sección "Perspectivas del equipo" es visible para miembro no-owner', async ({ page }) => {
    // Arrange: miembro autenticado que NO es el builder del proyecto
    // Navegar a un proyecto live con feedbacks existentes
    await page.goto('/communities/test-community/projects/test-project-id')

    // Act & Assert: la sección aparece visible sin condición isOwner
    await expect(
      page.getByRole('heading', { name: 'Perspectivas del equipo' })
    ).toBeVisible()
  })

  test.skip('cada FeedbackEntry muestra UserAvatar + nombre + texto del reviewer', async ({ page }) => {
    // Arrange: proyecto live con al menos un feedback registrado
    await page.goto('/communities/test-community/projects/test-project-id')

    // Act & Assert: se renderiza al menos una entrada con avatar y nombre
    const firstEntry = page.getByRole('article').first()
    await expect(firstEntry).toBeVisible()
    // El avatar se renderiza con role="img"
    await expect(firstEntry.getByRole('img')).toBeVisible()
    // El nombre del reviewer aparece como texto
    await expect(firstEntry.getByRole('heading', { level: 3 })).toBeVisible()
  })

  test.skip('muestra empty state cuando el proyecto no tiene feedbacks', async ({ page }) => {
    // Arrange: proyecto live sin ningún feedback registrado
    await page.goto('/communities/test-community/projects/empty-project-id')

    // Act & Assert: se muestra el mensaje de empty state
    await expect(
      page.getByText('Aún no hay perspectivas del equipo')
    ).toBeVisible()
    // No se renderiza ningún article de feedback
    await expect(page.getByRole('article')).toHaveCount(0)
  })
})
