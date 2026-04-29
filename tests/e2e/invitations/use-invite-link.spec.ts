import { test, expect } from '@playwright/test'
import { TEST_USER_ID } from '../test-users'

// story 2.2 — flujo link de invitación
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const ADMIN_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${SERVICE_KEY}`,
  apikey: SERVICE_KEY,
}

// startup-lab (b0000000-...002): el e2e user NO es miembro — válido para happy path
const HAPPY_PATH_COMMUNITY_ID = 'b0000000-0000-4000-8000-000000000002'
// Token sin usar para startup-lab — insertado en seed (seed.sql)
const HAPPY_PATH_TOKEN = 'invite-token-lab-e2e-happy'

async function removeE2eMembershipFromStartupLab(): Promise<void> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_members?community_id=eq.${HAPPY_PATH_COMMUNITY_ID}&user_id=eq.${TEST_USER_ID}`,
    { method: 'DELETE', headers: ADMIN_HEADERS }
  )
  if (!res.ok) {
    // ignorar errores de cleanup — el miembro puede no existir si el test falló antes de unirse
    console.error(`cleanup membership: ${res.status}`)
  }
}

async function resetInviteToken(): Promise<void> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/invitation_links?token=eq.${HAPPY_PATH_TOKEN}`,
    {
      method: 'PATCH',
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ used_at: null, used_by: null }),
    }
  )
  if (!res.ok) {
    console.error(`reset invite token: ${res.status}`)
  }
}

test.describe('Invite link — sin autenticación', () => {
  // Limpiar auth cookies: verifica comportamiento sin sesión activa
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  test('visitar /invite/{token} sin sesión redirige a /login con next param', async ({ page }) => {
    await page.goto('/invite/cualquier-token-123')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('la URL de redirect incluye next=/invite/{token}', async ({ page }) => {
    await page.goto('/invite/mi-token-abc')
    await expect(page).toHaveURL(/next=%2Finvite%2Fmi-token-abc/, { timeout: 10_000 })
  })
})

test.describe('Invite link — token ya usado', () => {
  // invite-token-lab-xyz789 tiene used_at = '2026-03-05T14:30:00Z' en el seed
  test('visitar /invite/{token_ya_usado} muestra la página de error', async ({ page }) => {
    await page.goto('/invite/invite-token-lab-xyz789')
    await expect(page.getByRole('heading', { name: 'Link inválido' })).toBeVisible({ timeout: 10_000 })
    await expect(
      page.getByText('Este link ya no es válido')
    ).toBeVisible()
  })

  test('la página de error muestra el texto de solicitar nuevo link', async ({ page }) => {
    await page.goto('/invite/invite-token-lab-xyz789')
    await expect(
      page.getByText('Solicita un nuevo link de invitación al administrador de la comunidad.')
    ).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Invite link — ya eres miembro', () => {
  // invite-token-alpha-abc123 apunta a producto-alpha (b0000000-...001).
  // El e2e user YA es miembro de producto-alpha → muestra InviteAlreadyMemberState.
  test(
    'visitar /invite/{token} siendo miembro muestra "Ya eres miembro de esta comunidad"',
    async ({ page }) => {
      await page.goto('/invite/invite-token-alpha-abc123')
      await expect(
        page.getByRole('heading', { name: 'Ya eres miembro de esta comunidad' })
      ).toBeVisible({ timeout: 10_000 })
    }
  )
})

test.describe('Invite link — happy path (join completo)', () => {
  // invite-token-lab-e2e-happy apunta a startup-lab (b0000000-...002).
  // El e2e user NO es miembro de startup-lab → join exitoso → redirect a /communities.
  // afterEach limpia la membresía y resetea el token para idempotencia.

  test.afterEach(async () => {
    await removeE2eMembershipFromStartupLab()
    await resetInviteToken()
  })

  test('visitar /invite/{token_valido} redirige a /communities tras join exitoso', async ({ page }) => {
    await page.goto(`/invite/${HAPPY_PATH_TOKEN}`)
    await expect(page).toHaveURL(/\/communities(\/|\?|#|$)/, { timeout: 15_000 })
  })
})
