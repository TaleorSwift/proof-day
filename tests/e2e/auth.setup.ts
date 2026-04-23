/**
 * Playwright auth setup — proyecto "setup"
 *
 * Crea (o reutiliza) un usuario de test en Supabase local usando el
 * service role key, obtiene la sesión via password auth, e inyecta
 * directamente la cookie de sesión de Supabase SSR en el contexto
 * del browser sin tocar el código de la app.
 *
 * Cookie usada por @supabase/ssr:
 *   nombre : sb-{hostname[0]}-auth-token  → "sb-127-auth-token" en local
 *   valor  : "base64-" + btoa(JSON.stringify(session))
 */
import { test as setup, expect } from '@playwright/test'
import path from 'path'

export const AUTH_STATE_PATH = path.join(__dirname, '.auth', 'user.json')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
export const TEST_EMAIL = 'e2e-community@proofday.local'
const TEST_PASSWORD = 'E2eTest_Pass_123!'
// UUID fijo para que el seed pueda referenciar al usuario de test en community_members
export const TEST_USER_ID = 'e2e00000-0000-4000-8000-000000000099'

const ADMIN_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${SERVICE_KEY}`,
  apikey: SERVICE_KEY,
}

async function ensureTestUser(): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: ADMIN_HEADERS,
    body: JSON.stringify({
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    }),
  })
  // 422 = "User already registered" → OK
  if (!res.ok && res.status !== 422) {
    throw new Error(`No se pudo crear el usuario de test: ${res.status} ${await res.text()}`)
  }
}

async function signInWithPassword(): Promise<Record<string, unknown>> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  })
  if (!res.ok) {
    throw new Error(`Sign-in fallido: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

/** Construye el valor de cookie que espera @supabase/ssr */
function buildSupabaseCookieValue(session: Record<string, unknown>): string {
  return 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64')
}

setup('autenticar usuario de test y guardar estado', async ({ page }) => {
  await ensureTestUser()
  const session = await signInWithPassword()

  // Inyectar la cookie de sesión directamente en el contexto del browser
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

  await page.context().storageState({ path: AUTH_STATE_PATH })
})
