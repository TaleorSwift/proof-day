import { test, expect } from '@playwright/test'

// Story 9.8 — Modal "Lanzar una nueva idea" (actualizado Epic 10.3: refactorizado a wizard multi-paso)
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Usa comunidad 'producto-alpha': test user es miembro (seed) y tiene proyectos suficientes para el gate de reciprocidad.
// beforeAll inserta 3 feedbacks del test user para superar reciprocity_threshold=3; afterAll los limpia.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const ADMIN_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${SERVICE_KEY}`,
  apikey: SERVICE_KEY,
}

test.describe.configure({ mode: 'serial' })

test.describe('LaunchIdeaModal — flujo modal lanzar idea (Story 9.8)', () => {
  // producto-alpha: test user es miembro (seed) y tiene suficientes proyectos para el gate de reciprocidad
  const COMMUNITY_FEED_URL = '/communities/producto-alpha'
  const COMMUNITY_ID = 'b0000000-0000-4000-8000-000000000001'
  const TEST_USER_ID = 'e2e00000-0000-4000-8000-000000000099'
  const testTitle = `Idea de test E2E ${Date.now()}`

  // IDs fijos para que beforeAll sea idempotente entre runs
  const SEED_FEEDBACK_IDS = [
    'f0000000-4e2e-0000-8000-000000000001',
    'f0000000-4e2e-0000-8000-000000000002',
    'f0000000-4e2e-0000-8000-000000000003',
  ]

  test.beforeAll(async () => {
    // Crear 3 feedbacks del test user en producto-alpha para superar el reciprocity gate (threshold=3).
    // Se usan proyectos de otros builders: pulse-check, docbridge, carbon-ledger.
    await fetch(`${SUPABASE_URL}/rest/v1/feedbacks`, {
      method: 'POST',
      headers: { ...ADMIN_HEADERS, Prefer: 'resolution=ignore-duplicates' },
      body: JSON.stringify([
        // pulse-check (001), docbridge (002), idea-sketch (005) — sin usar carbon-ledger (003) que tiene test de empty state
        { id: SEED_FEEDBACK_IDS[0], project_id: 'c0000000-0000-4000-8000-000000000001', community_id: COMMUNITY_ID, reviewer_id: TEST_USER_ID, scores: { p1: 3, p2: 3 }, text_responses: {} },
        { id: SEED_FEEDBACK_IDS[1], project_id: 'c0000000-0000-4000-8000-000000000002', community_id: COMMUNITY_ID, reviewer_id: TEST_USER_ID, scores: { p1: 3, p2: 3 }, text_responses: {} },
        { id: SEED_FEEDBACK_IDS[2], project_id: 'c0000000-0000-4000-8000-000000000005', community_id: COMMUNITY_ID, reviewer_id: TEST_USER_ID, scores: { p1: 3, p2: 3 }, text_responses: {} },
      ]),
    })
  })

  test.afterAll(async () => {
    const deleteFeedbacks = fetch(
      `${SUPABASE_URL}/rest/v1/feedbacks?id=in.(${SEED_FEEDBACK_IDS.join(',')})`,
      { method: 'DELETE', headers: ADMIN_HEADERS, signal: AbortSignal.timeout(5000) }
    )
    const deleteProjects = fetch(
      `${SUPABASE_URL}/rest/v1/projects?slug=ilike.idea-de-test-e2e-*`,
      { method: 'DELETE', headers: ADMIN_HEADERS, signal: AbortSignal.timeout(5000) }
    )
    const [feedbacksRes, projectsRes] = await Promise.all([deleteFeedbacks, deleteProjects])
    if (!feedbacksRes.ok) console.warn(`[afterAll] Cleanup feedbacks e2e falló (${feedbacksRes.status}).`)
    if (!projectsRes.ok) console.warn(`[afterAll] Cleanup proyectos e2e falló (${projectsRes.status}).`)
  })

  test(
    'abre el modal al hacer click en el botón "Lanzar idea"',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)

      const launchButton = page.getByTestId('btn-launch-idea')
      await expect(launchButton).toBeVisible()

      await launchButton.click()

      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Lanzar una nueva idea' })).toBeVisible()
    }
  )

  test(
    'submit válido lanza la idea — muestra toast de éxito',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)
      await page.getByTestId('btn-launch-idea').click()
      await expect(page.getByRole('dialog')).toBeVisible()

      // Paso 1 (templates): seleccionar primer template → Continuar
      const templateGrid = page.getByTestId('template-grid')
      await expect(templateGrid).toBeVisible()
      await templateGrid.getByRole('button').first().click()
      await page.getByRole('button', { name: /continuar/i }).click()

      // Paso 2 (descripción): rellenar campos requeridos → Continuar
      await expect(page.getByTestId('wizard-step-2')).toBeVisible()
      await page.getByTestId('wizard-field-title').fill(testTitle)
      await page.getByTestId('wizard-field-tagline').fill('Tagline de la idea de test')
      await page.getByTestId('wizard-field-problem').fill('El problema es que los tests de e2e no cubren el modal')
      await page.getByTestId('wizard-field-solution').fill('La solución es añadir un spec de e2e completo')
      await page.getByRole('button', { name: /continuar/i }).click()

      // Paso 3 (detalles): opcional → Continuar
      await expect(page.getByTestId('wizard-step-3')).toBeVisible()
      await page.getByRole('button', { name: /continuar/i }).click()

      // Paso 4 (hipótesis): opcional → Continuar
      await expect(page.getByTestId('wizard-step-4')).toBeVisible()
      await page.getByRole('button', { name: /continuar/i }).click()

      // Paso 5 (preview): publicar
      await expect(page.getByTestId('wizard-step-5')).toBeVisible()
      await page.getByRole('button', { name: /publicar/i }).click()

      await expect(page.getByText('¡Idea lanzada! Ya está recibiendo feedback.')).toBeVisible({ timeout: 10_000 })

      // Verificar que el proyecto aparece en el feed tras submit (scoped al card title para evitar falsos positivos)
      await expect(page.getByTestId('project-card-title').filter({ hasText: testTitle })).toBeVisible({ timeout: 10_000 })
    }
  )

  test(
    'el botón Continuar está deshabilitado en paso 2 cuando los campos requeridos están vacíos',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)
      await page.getByTestId('btn-launch-idea').click()
      await expect(page.getByRole('dialog')).toBeVisible()

      // Paso 1 (templates): avanzar sin seleccionar template — siempre válido
      await page.getByRole('button', { name: /continuar/i }).click()

      // Paso 2: sin rellenar campos, Continuar debe estar deshabilitado
      await expect(page.getByTestId('wizard-step-2')).toBeVisible()
      await expect(page.getByRole('button', { name: /continuar/i })).toBeDisabled()
    }
  )

  test(
    'cancelar limpia el estado — el wizard vuelve al paso 1 al reabrir el modal',
    async ({ page }) => {
      await page.goto(COMMUNITY_FEED_URL)
      await page.getByTestId('btn-launch-idea').click()
      await expect(page.getByRole('dialog')).toBeVisible()

      // Avanzar al paso 2 y rellenar el título
      const templateGrid = page.getByTestId('template-grid')
      await expect(templateGrid).toBeVisible()
      await templateGrid.getByRole('button').first().click()
      await page.getByRole('button', { name: /continuar/i }).click()
      await expect(page.getByTestId('wizard-step-2')).toBeVisible()
      await page.getByTestId('wizard-field-title').fill('Texto temporal')

      // Cancelar cierra el modal
      await page.getByRole('button', { name: 'Cancelar' }).click()
      await expect(page.getByRole('dialog')).not.toBeVisible()

      // Al reabrir, el wizard debe estar en el paso 1 (estado reseteado)
      await page.getByTestId('btn-launch-idea').click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByTestId('wizard-step-1')).toBeVisible()
    }
  )
})
