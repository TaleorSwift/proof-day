import { test, expect } from '@playwright/test'

// Story — Project Edit: /communities/[slug]/projects/[projectSlug]/edit
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

test.describe('ProjectEdit — /edit page (flujo de edición)', () => {
  const COMMUNITY_SLUG = 'producto-alpha'
  // Proyecto draft owned by test user e2e00000 — ver supabase/seed.sql
  const EDIT_URL = `/communities/${COMMUNITY_SLUG}/projects/e2e-draft-project/edit`
  // Proyecto live owned by test user (para validar no-draft → notFound)
  const LIVE_PROJECT_EDIT_URL = `/communities/${COMMUNITY_SLUG}/projects/e2e-own-project/edit`
  // Proyecto draft owned by otro usuario (para validar non-owner → redirect)
  // idea-sketch pertenece a a0000000-0000-4000-8000-000000000001 (Alex), no al test user
  const OTHER_USER_DRAFT_EDIT_URL = `/communities/${COMMUNITY_SLUG}/projects/idea-sketch/edit`

  test(
    'carga la página /edit y muestra los valores por defecto del proyecto seed (AC-1)',
    async ({ page }) => {
      await page.goto(EDIT_URL)

      // El título del proyecto draft debe estar en el campo input
      const titleInput = page.getByLabel(/título/i)
      await expect(titleInput).toBeVisible()
      await expect(titleInput).toHaveValue('E2E Draft Project')
    }
  )

  test(
    'muestra los campos de problema, solución e hipótesis pre-rellenados (AC-1)',
    async ({ page }) => {
      await page.goto(EDIT_URL)

      const problemField = page.getByLabel(/descripción del problema/i)
      await expect(problemField).toBeVisible()
      await expect(problemField).not.toBeEmpty()

      const solutionField = page.getByLabel(/solución propuesta/i)
      await expect(solutionField).toBeVisible()
      await expect(solutionField).not.toBeEmpty()

      const hypothesisField = page.getByLabel(/hipótesis/i)
      await expect(hypothesisField).toBeVisible()
      await expect(hypothesisField).not.toBeEmpty()
    }
  )

  test(
    'muestra el botón "Guardar cambios" en modo editar (AC-1)',
    async ({ page }) => {
      await page.goto(EDIT_URL)
      await expect(page.getByRole('button', { name: /guardar cambios/i })).toBeVisible()
    }
  )

  test(
    'guardar cambios válidos actualiza el proyecto sin error visible (AC-2)',
    async ({ page }) => {
      await page.goto(EDIT_URL)

      // Añadimos un espacio al campo targetUser (campo opcional — no altera datos core del proyecto)
      // para tener algo que guardar sin modificar el título ni campos requeridos
      const targetUserInput = page.getByLabel(/usuario objetivo/i)
      const originalValue = await targetUserInput.inputValue()
      await targetUserInput.fill(originalValue.trim() + ' v2')

      await page.getByRole('button', { name: /guardar cambios/i }).click()

      // Tras guardar no debe haber mensaje de error — el botón vuelve a estar enabled
      await expect(page.getByRole('button', { name: /guardar cambios/i })).toBeVisible()
      await expect(page.getByRole('alert')).not.toBeVisible()
    }
  )

  test(
    'non-owner que intenta acceder a /edit es redirigido a la página del proyecto (AC-3)',
    async ({ page }) => {
      // idea-sketch pertenece a Alex (a0000000), no al test user (e2e00000)
      await page.goto(OTHER_USER_DRAFT_EDIT_URL)

      // Debe redirigir a la página del proyecto (no a /edit)
      await expect(page).not.toHaveURL(/\/edit/)
      await expect(page).toHaveURL(/\/communities\/.+\/projects\/idea-sketch/)
    }
  )

  test(
    'proyecto en estado live devuelve error al intentar acceder a /edit (AC-4)',
    async ({ page }) => {
      // e2e-own-project tiene status live — la página debe redirigir a la página de error de Next.js
      // notFound() en Next.js App Router renderiza la página not-found.tsx (status 404 en producción,
      // puede variar en desarrollo local — verificamos que NO se queda en /edit)
      await page.goto(LIVE_PROJECT_EDIT_URL)
      await expect(page).not.toHaveURL(/\/edit/)
    }
  )

  test(
    'submit con título vacío muestra error de validación (AC-5)',
    async ({ page }) => {
      await page.goto(EDIT_URL)

      const titleInput = page.getByLabel(/título/i)
      await titleInput.fill('')

      await page.getByRole('button', { name: /guardar cambios/i }).click()

      // El error de validación debe ser visible
      const alert = page.getByRole('alert').first()
      await expect(alert).toBeVisible()
    }
  )

  test(
    'usuario no autenticado es redirigido a /login al intentar acceder a /edit (AC-6)',
    async ({ page }) => {
      // Limpiamos las cookies para simular sesión no iniciada
      await page.context().clearCookies()
      await page.goto(EDIT_URL)

      await expect(page).toHaveURL(/\/login/)
    }
  )
})
