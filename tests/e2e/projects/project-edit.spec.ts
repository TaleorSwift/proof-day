import { test, expect } from '@playwright/test'

// Story — Project Edit: /communities/[slug]/projects/[projectSlug]/edit
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

test.describe('ProjectEdit — /edit page (flujo de edición)', () => {
  const COMMUNITY_SLUG = 'producto-alpha'
  // Proyecto draft owned by test user e2e00000 — ver supabase/seed.sql
  const EDIT_URL = `/communities/${COMMUNITY_SLUG}/projects/e2e-draft-project/edit`
  // Proyecto live owned by test user (para validar no-draft → notFound)
  const LIVE_PROJECT_EDIT_URL = `/communities/${COMMUNITY_SLUG}/projects/e2e-own-project/edit`
  // Proyecto live owned by otro usuario (para validar non-owner → redirect)
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
      await expect(problemField).toHaveValue('Un problema que estamos validando con el equipo.')

      const solutionField = page.getByLabel(/solución propuesta/i)
      await expect(solutionField).toBeVisible()
      await expect(solutionField).toHaveValue('Una solución basada en encuestas semanales.')

      const hypothesisField = page.getByRole('textbox', { name: /hipótesis/i })
      await expect(hypothesisField).toBeVisible()
      await expect(hypothesisField).toHaveValue('Si simplificamos el flujo, la tasa de respuesta superará el 80%.')
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

      // Esperar hidratación del formulario antes de interactuar
      const targetUserInput = page.getByLabel(/usuario objetivo/i)
      await expect(targetUserInput).toBeVisible()

      // Valor fijo — independiente del estado previo en DB para evitar test flaky
      const newValue = 'Engineering managers E2E'
      await targetUserInput.fill(newValue)

      await page.getByRole('button', { name: /guardar cambios/i }).click()

      // Esperar señal de éxito: el botón vuelve a estar habilitado (submit terminó)
      await expect(page.getByRole('button', { name: /guardar cambios/i })).not.toBeDisabled({ timeout: 5_000 })
      // Verificar que no hay alertas de validación del formulario (excluye el route announcer de Next.js)
      await expect(page.locator('p[role="alert"]')).not.toBeVisible()

      // Recargar para confirmar persistencia real (evita falsos positivos con cache stale de router.refresh)
      await page.reload()
      await expect(page.getByLabel(/usuario objetivo/i)).toHaveValue(newValue)
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
      // e2e-own-project tiene status live — notFound() en Next.js App Router NO cambia la URL,
      // renderiza el componente not-found.tsx (o la página 404 por defecto de Next.js) en la misma URL.
      await page.goto(LIVE_PROJECT_EDIT_URL)
      // notFound() no cambia la URL — verificar que se renderiza el not-found.tsx custom
      await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible({ timeout: 10_000 })
      await expect(page.getByRole('button', { name: /guardar cambios/i })).not.toBeVisible()
    }
  )

  test(
    'submit con título vacío muestra error de validación (AC-5)',
    async ({ page }) => {
      await page.goto(EDIT_URL)

      const titleInput = page.getByLabel(/título/i)
      // Verificar que el input está hidratado antes de interactuar
      await expect(titleInput).toHaveValue('E2E Draft Project')
      // Limpiar con teclado para asegurar que React Hook Form actualiza su estado interno
      await titleInput.click()
      await page.keyboard.press('ControlOrMeta+a')
      await page.keyboard.press('Delete')
      await expect(titleInput).toHaveValue('')

      await page.getByRole('button', { name: /guardar cambios/i }).click()

      // El error de validación del formulario debe ser visible (p[role="alert"] del ProjectForm)
      const alert = page.locator('p[role="alert"]').first()
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
