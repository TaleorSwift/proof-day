/**
 * Playwright auth setup — proyectos "setup", "setup-admin", "setup-reviewer"
 *
 * Crea (o reutiliza) usuarios de test en Supabase local usando el
 * service role key, obtiene la sesión via password auth, e inyecta
 * directamente la cookie de sesión de Supabase SSR en el contexto
 * del browser sin tocar el código de la app.
 *
 * Cookie usada por @supabase/ssr:
 *   nombre : sb-{hostname[0]}-auth-token  → "sb-127-auth-token" en local
 *   valor  : "base64-" + Buffer.from(JSON.stringify(session)).toString('base64')
 *
 * Storage states generados:
 *   tests/e2e/.auth/user.json     ← usuario principal (member)
 *   tests/e2e/.auth/admin.json    ← usuario admin (admin de startup-madrid)
 *   tests/e2e/.auth/reviewer.json ← usuario reviewer (member de producto-alpha + startup-madrid)
 *   tests/e2e/.auth/isolated.json ← usuario sin comunidades (empty state de /communities)
 */
import { test as setup, expect } from '@playwright/test'
import path from 'path'
import {
  TEST_USER_ID,
  TEST_EMAIL,
  ADMIN_USER_ID,
  ADMIN_EMAIL,
  REVIEWER_USER_ID,
  REVIEWER_EMAIL,
  ISOLATED_USER_ID,
  ISOLATED_EMAIL,
} from './test-users'

export {
  TEST_USER_ID, TEST_EMAIL,
  ADMIN_USER_ID, ADMIN_EMAIL,
  REVIEWER_USER_ID, REVIEWER_EMAIL,
  ISOLATED_USER_ID, ISOLATED_EMAIL,
}

export const AUTH_STATE_PATH = path.join(__dirname, '.auth', 'user.json')
export const ADMIN_AUTH_STATE_PATH = path.join(__dirname, '.auth', 'admin.json')
export const REVIEWER_AUTH_STATE_PATH = path.join(__dirname, '.auth', 'reviewer.json')
export const ISOLATED_AUTH_STATE_PATH = path.join(__dirname, '.auth', 'isolated.json')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const TEST_PASSWORD = 'E2eTest_Pass_123!'

const ADMIN_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${SERVICE_KEY}`,
  apikey: SERVICE_KEY,
}

interface AuthUserParams {
  id: string
  email: string
}

async function ensureUser({ id, email }: AuthUserParams): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: ADMIN_HEADERS,
    body: JSON.stringify({
      id,
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
    }),
  })
  // 422 = "User already registered" → OK
  if (!res.ok && res.status !== 422) {
    throw new Error(`No se pudo crear el usuario de test (${email}): ${res.status} ${await res.text()}`)
  }
}

async function signInWithPassword(email: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
    body: JSON.stringify({ email, password: TEST_PASSWORD }),
  })
  if (!res.ok) {
    throw new Error(`Sign-in fallido (${email}): ${res.status} ${await res.text()}`)
  }
  return res.json()
}

/** Construye el valor de cookie que espera @supabase/ssr */
function buildSupabaseCookieValue(session: Record<string, unknown>): string {
  return 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64')
}

interface CreateAuthStateParams {
  id: string
  email: string
  statePath: string
}

async function createAuthState(
  { id, email, statePath }: CreateAuthStateParams,
  page: import('@playwright/test').Page
): Promise<void> {
  await ensureUser({ id, email })
  const session = await signInWithPassword(email)

  await page.context().addCookies([
    {
      name: 'sb-127-auth-token',
      value: buildSupabaseCookieValue(session),
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ])

  // Verificar que el middleware reconoce la sesión
  await page.goto('/communities')
  await expect(page).toHaveURL(/\/communities/, { timeout: 10_000 })

  await page.context().storageState({ path: statePath })
}

setup('autenticar usuario de test y guardar estado', async ({ page }) => {
  await createAuthState(
    { id: TEST_USER_ID, email: TEST_EMAIL, statePath: AUTH_STATE_PATH },
    page
  )
})

setup('autenticar usuario admin y guardar estado', async ({ page }) => {
  await createAuthState(
    { id: ADMIN_USER_ID, email: ADMIN_EMAIL, statePath: ADMIN_AUTH_STATE_PATH },
    page
  )
})

setup('autenticar usuario reviewer y guardar estado', async ({ page }) => {
  await createAuthState(
    { id: REVIEWER_USER_ID, email: REVIEWER_EMAIL, statePath: REVIEWER_AUTH_STATE_PATH },
    page
  )
})

setup('autenticar usuario isolated y guardar estado', async ({ page }) => {
  await createAuthState(
    { id: ISOLATED_USER_ID, email: ISOLATED_EMAIL, statePath: ISOLATED_AUTH_STATE_PATH },
    page
  )
})
