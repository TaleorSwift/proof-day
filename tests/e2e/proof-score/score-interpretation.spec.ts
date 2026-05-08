import { test, expect } from '@playwright/test'

// Épica 13 — Interpretación del Proof Score en la sidebar del owner
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)
// Proyecto live owned by test user: e2e-own-project — ver supabase/seed.sql
// Nota: proof-score-sidebar solo se renderiza cuando score !== null (≥3 feedbacks).
// Sin feedbacks, se muestra ProofScoreWaiting (skeleton/progress) en su lugar.
// beforeAll inserta 3 feedbacks de reviewers seed en e2e-own-project; afterAll los limpia.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const ADMIN_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${SERVICE_KEY}`,
  apikey: SERVICE_KEY,
}

test.describe.configure({ mode: 'serial' })

test.describe('ScoreInterpretation — sidebar del Proof Score (Épica 13)', () => {
  const PROJECT_URL = '/communities/producto-alpha/projects/e2e-own-project'
  const PROJECT_ID = 'c0000000-0000-4000-8000-000000000011'
  const COMMUNITY_ID = 'b0000000-0000-4000-8000-000000000001'

  // UUIDs fijos para que beforeAll sea idempotente entre runs
  const SEED_FEEDBACK_IDS = [
    'f0000000-5c0e-0000-8000-000000000001',
    'f0000000-5c0e-0000-8000-000000000002',
    'f0000000-5c0e-0000-8000-000000000003',
  ]

  test.beforeAll(async () => {
    // Insertar 3 feedbacks de reviewers seed en e2e-own-project para alcanzar MIN_FEEDBACKS=3
    // y que calculateProofScore devuelva un resultado no-null.
    // Reviewers: a0000000-...002, a0000000-...003 (seed), e2e-reviewer (e2e-...097)
    await fetch(`${SUPABASE_URL}/rest/v1/feedbacks`, {
      method: 'POST',
      headers: { ...ADMIN_HEADERS, Prefer: 'resolution=ignore-duplicates' },
      body: JSON.stringify([
        { id: SEED_FEEDBACK_IDS[0], project_id: PROJECT_ID, community_id: COMMUNITY_ID, reviewer_id: 'a0000000-0000-4000-8000-000000000002', scores: { p1: 3, p2: 3, p3: 3 }, text_responses: { p4: '' } },
        { id: SEED_FEEDBACK_IDS[1], project_id: PROJECT_ID, community_id: COMMUNITY_ID, reviewer_id: 'a0000000-0000-4000-8000-000000000003', scores: { p1: 3, p2: 3, p3: 2 }, text_responses: { p4: '' } },
        { id: SEED_FEEDBACK_IDS[2], project_id: PROJECT_ID, community_id: COMMUNITY_ID, reviewer_id: 'e2e00000-0000-4000-8000-000000000097', scores: { p1: 3, p2: 2, p3: 3 }, text_responses: { p4: '' } },
      ]),
    })
  })

  test.afterAll(async () => {
    await fetch(
      `${SUPABASE_URL}/rest/v1/feedbacks?id=in.(${SEED_FEEDBACK_IDS.join(',')})`,
      { method: 'DELETE', headers: ADMIN_HEADERS, signal: AbortSignal.timeout(5000) }
    )
  })

  test('muestra el bloque "Feedback recibido" en la sidebar del owner', async ({ page }) => {
    await page.goto(PROJECT_URL)

    await expect(page.getByRole('heading', { name: /feedback recibido/i })).toBeVisible()
  })

  test('muestra el sidebar del Proof Score cuando hay suficientes feedbacks', async ({ page }) => {
    await page.goto(PROJECT_URL)

    await expect(page.getByTestId('proof-score-sidebar')).toBeVisible({ timeout: 10_000 })
  })

  test('la sección de interpretación está en estado loading o con contenido', async ({ page }) => {
    await page.goto(PROJECT_URL)

    await expect(page.getByTestId('proof-score-sidebar')).toBeVisible({ timeout: 10_000 })

    const loading = page.getByTestId('score-interpretation-loading')
    const content = page.getByTestId('score-interpretation')
    await expect(loading.or(content)).toBeVisible()
  })
})
