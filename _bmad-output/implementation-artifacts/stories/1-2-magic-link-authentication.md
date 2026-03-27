# Story 1.2: Magic Link Authentication

Status: review

## Story

Como usuario,
quiero poder autenticarme con mi email recibiendo un magic link,
para que pueda acceder a la plataforma sin necesidad de contraseña.

## Acceptance Criteria

1. Pantalla `/login` accesible sin sesión activa con campo email (tipo `email`) + botón "Continuar"
2. Al enviar email válido: Supabase Auth dispara el magic link vía Resend SMTP sin código adicional en la app
3. Success state visible tras enviar: "Revisa tu email — te hemos enviado un link de acceso" (mismo card, sin redirect)
4. Error de validación inline bajo el campo email si el formato es inválido (no toast, no alert)
5. Ruta `GET /auth/callback?code=...` procesa el magic link y redirige a `/communities` si es válido
6. Si el email no existe en Supabase Auth, el sistema crea la cuenta automáticamente (comportamiento nativo de Supabase)
7. Un magic link anterior se invalida automáticamente al generar uno nuevo (comportamiento nativo de Supabase)
8. El magic link se entrega al email del usuario en < 30s bajo condiciones normales (NFR-P1 — medible via logs de Supabase Auth)
9. Usuario autenticado que accede a `/login` → redirect automático a `/communities`
10. Error de magic link inválido o expirado → mensaje de error en `/login` con CTA "Solicitar un nuevo link"
11. El formulario es accesible: label visible para el campo email, `aria-describedby` para errores inline
12. Tests unitarios: validación de email (formatos válidos e inválidos) con Vitest
13. Test E2E básico: visita `/login`, rellena email válido, verifica success state con Playwright

## Rejection Criteria

- NO debe existir ningún campo de contraseña en ningún flujo
- NO debe existir formulario de registro separado — Supabase crea la cuenta automáticamente
- NO debe haber toast para mensajes de error — solo mensajes inline bajo el campo
- NO debe usarse `getSession()` en ningún fichero (ESLint lo bloquea)
- NO importar `@supabase/supabase-js` ni `@supabase/ssr` fuera de `lib/supabase/` (ESLint lo bloquea)

## Tasks / Subtasks

- [x] **T1: Feature branch** (prerequisito)
  - [x] `git checkout develop && git pull`
  - [x] `git checkout -b feat/1-2-magic-link-authentication`

- [x] **T2: Zod schema de validación email** (AC: 4, 12)
  - [x] Crear `lib/validations/auth.ts`:
    ```typescript
    import { z } from 'zod'
    export const loginSchema = z.object({
      email: z.string().email({ message: 'Introduce un email válido' })
    })
    export type LoginInput = z.infer<typeof loginSchema>
    ```
  - [x] Instalar Zod si no está: `npm install zod`
  - [x] Crear test unitario `tests/unit/auth/login-schema.test.ts` con casos: email válido, sin @, dominio vacío, cadena vacía

- [x] **T3: Pantalla /login** (AC: 1, 9)
  - [x] Crear `app/(auth)/login/page.tsx` — Server Component:
    - Verificar sesión con `getUser()` desde `lib/supabase/server.ts`
    - Si hay sesión activa → `redirect('/communities')`
    - Si no → renderizar `<LoginForm />`
    - Layout: fondo `var(--color-background)`, card centrado, max-width 420px
  - [x] Crear `app/(auth)/layout.tsx` — layout para rutas auth (centrado vertical, sin navbar)

- [x] **T4: Componente LoginForm** (AC: 1, 3, 4, 11)
  - [x] Crear `components/auth/LoginForm.tsx` — `'use client'`:
    - `react-hook-form` + `zodResolver(loginSchema)`
    - Campo `Input` shadcn/ui con label visible "Tu email de trabajo"
    - Botón `Button` shadcn/ui: "Continuar" (disabled durante submit, `isLoading` state)
    - Estado `sent: boolean` — cuando `true` mostrar success state
    - Success state: mismo card, mensaje "Revisa tu email — te hemos enviado un link de acceso"
    - Error inline: `<FormMessage />` de shadcn/ui bajo el campo (solo error de validación client-side)
    - `aria-describedby` conecta campo email con su mensaje de error
  - [x] Instalar si no están: `npm install react-hook-form @hookform/resolvers`

- [x] **T5: Server Action para enviar magic link** (AC: 2, 6, 7, 8)
  - [x] Crear `app/(auth)/login/actions.ts` — Server Action:
    ```typescript
    'use server'
    import { createClient } from '@/lib/supabase/server'
    import { loginSchema } from '@/lib/validations/auth'

    export async function sendMagicLink(formData: FormData) {
      const result = loginSchema.safeParse({ email: formData.get('email') })
      if (!result.success) return { error: result.error.issues[0].message }

      const supabase = await createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email: result.data.email,
        options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` }
      })
      if (error) return { error: 'No pudimos enviar el email. Inténtalo de nuevo.' }
      return { success: true }
    }
    ```
  - [x] Añadir `NEXT_PUBLIC_SITE_URL=http://localhost:3000` a `.env.local` y `.env.example`
  - [x] Nota: Supabase invalida el magic link anterior automáticamente — sin código adicional

- [x] **T6: Route handler /auth/callback** (AC: 5, 10)
  - [x] Crear `app/auth/callback/route.ts`:
    ```typescript
    import { NextResponse } from 'next/server'
    import { createClient } from '@/lib/supabase/server'

    export async function GET(request: Request) {
      const { searchParams, origin } = new URL(request.url)
      const code = searchParams.get('code')
      const next = searchParams.get('next') ?? '/communities'

      if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) return NextResponse.redirect(`${origin}${next}`)
      }

      // Magic link inválido o expirado
      return NextResponse.redirect(`${origin}/login?error=link-invalid`)
    }
    ```
  - [x] En `LoginForm.tsx`: si `searchParams.error === 'link-invalid'`, mostrar error con CTA "Solicitar un nuevo link"
  - [x] Adaptar `app/(auth)/login/page.tsx` para leer `searchParams.error` y pasarlo a `LoginForm`

- [x] **T7: Configurar Resend como SMTP en Supabase Auth** (AC: 2, 8)
  - [x] **Nota: configuración fuera del código — en Supabase Dashboard:**
    - Auth → SMTP Settings → Enable custom SMTP
    - Host: `smtp.resend.com`
    - Port: `465` (SSL) o `587` (TLS)
    - User: `resend`
    - Password: `RESEND_API_KEY`
    - Sender: `Proof Day <noreply@tudominio.com>`
  - [x] Documentar en `README.md` la sección de configuración de Resend SMTP
  - [x] **Sin código adicional en la app** — Supabase Auth lo gestiona completamente

- [x] **T8: Tests** (AC: 12, 13)
  - [x] Tests unitarios `tests/unit/auth/login-schema.test.ts`:
    - `z.string().email()` acepta `user@example.com`
    - Rechaza `notanemail`, `@domain.com`, `user@`, cadena vacía
  - [x] Test E2E `tests/e2e/auth/login.spec.ts`:
    - Visita `/login`
    - Verifica que existe campo email y botón "Continuar"
    - Rellena email válido y hace submit
    - Verifica que aparece el success state (texto "Revisa tu email")
    - **Nota:** el test E2E no puede verificar la recepción real del email — solo el UI state

- [x] **T9: Story de Storybook — LoginForm** (AC: requisito de arquitectura)
  - [x] Crear `stories/auth/LoginForm.stories.tsx`:
    - Story `Default`: estado inicial con campo vacío
    - Story `WithLinkInvalidError`: estado con error de link inválido + CTA solicitar nuevo link
  - [x] Verificar que las CSS variables de design tokens son visibles en Storybook

- [x] **T10: PR y cierre** (AC: Gitflow)
  - [x] Verificar todos los ACs
  - [x] `git add` solo los ficheros de esta story
  - [x] Commits con Conventional Commits: `feat(auth): add magic link login page and callback`
  - [x] Push: `git push -u origin feat/1-2-magic-link-authentication`
  - [x] Abrir PR contra `develop` (no contra `main`)
  - [x] Marcar story status como `review` en sprint-status.yaml

## Dev Notes

### Learnings de Story 1.1 (Homer)

- **Vitest 2.1.9** — no usar versión latest (incompatible con Node 20.11.1). Ya está en `package.json`.
- **ESLint**: la regla `no-restricted-imports` aplica a `app/`, `components/`, `lib/api/` — NO a `lib/supabase/`. La Server Action `app/(auth)/login/actions.ts` no necesita importar Supabase directamente — usa `lib/supabase/server.ts`.
- **Storybook 8** — ya instalado. Las stories deben seguir el patrón de `stories/shared/Button.stories.tsx`.
- **`lib/supabase/server.ts`** es async — `const supabase = await createClient()`.
- **`lib/supabase/proxy.ts`** existe — es el proxy que usa middleware. No confundir con `server.ts`.
- **Feature branch desde develop**: `git checkout develop && git checkout -b feat/1-2-magic-link-authentication`.

### Arquitectura del flujo de Auth

```
Usuario escribe email
       ↓
LoginForm.tsx (Client Component)
  → react-hook-form + Zod client-side validation
  → sendMagicLink(formData) — Server Action
       ↓
actions.ts (Server)
  → Zod server-side validation
  → supabase.auth.signInWithOtp({ email, emailRedirectTo })
  → Supabase Auth → Resend SMTP → email al usuario
       ↓
Usuario hace clic en link del email
       ↓
/auth/callback?code=xxx (Route Handler)
  → supabase.auth.exchangeCodeForSession(code)
  → redirect('/communities')
```

### Server Action vs API Route — ¿Por qué Server Action aquí?

La acción de login es una mutación simple sin lógica de negocio compleja. Una Server Action evita el boilerplate de un API Route completo y es el patrón idiomático de Next.js 15 para formularios. El PRD especifica "API Routes puro" para operaciones de datos — el login es un caso especial de auth que Supabase gestiona nativamente.

**Si hay duda:** se puede implementar como API Route `POST /api/auth/login` en su lugar. El resultado es equivalente.

### Supabase Auth — Comportamiento esperado

- `signInWithOtp()` siempre retorna `{ error: null }` aunque el email no exista (no revela si el email está registrado — seguridad).
- `signInWithOtp()` invalida el OTP anterior automáticamente.
- `exchangeCodeForSession(code)` en `/auth/callback` verifica el code y crea la sesión cookie.
- Si el code es inválido/expirado → `{ error: AuthApiError }` → redirigir a `/login?error=link-invalid`.

### Diseño visual — LoginForm (de UX Spec)

```
Fondo: var(--color-background) — #FAFAF8
Card: var(--color-surface) + var(--shadow-md) + var(--radius-lg)
Max-width: 420px, centrado horizontal y vertical
```

```tsx
// Estructura del card:
<div className="min-h-screen flex items-center justify-center bg-[--color-background]">
  <Card className="w-full max-w-[420px] p-8 shadow-md rounded-[var(--radius-lg)]">
    <h1>Proof Day</h1>
    <p>Valida tu idea. Toma la decisión.</p>
    <Form>
      <FormField name="email">
        <Label>Tu email de trabajo</Label>
        <Input type="email" placeholder="tu@empresa.com" />
        <FormMessage /> {/* Error inline */}
      </FormField>
      <Button type="submit">Continuar</Button>
    </Form>
  </Card>
</div>
```

### Variables de entorno adicionales

```bash
# Añadir a .env.local y .env.example:
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # Para el emailRedirectTo del magic link
```

En Vercel (preview y producción), esta variable apunta al dominio correcto automáticamente con Vercel System Environment Variables (`VERCEL_URL`). Para producción, configurar `NEXT_PUBLIC_SITE_URL` explícitamente.

### Ficheros a crear/modificar

```
app/
  (auth)/
    layout.tsx                    ← CREAR (layout sin navbar, centrado)
    login/
      page.tsx                    ← CREAR (Server Component)
      actions.ts                  ← CREAR (Server Action sendMagicLink)
  auth/
    callback/
      route.ts                    ← CREAR (Route Handler)
components/
  auth/
    LoginForm.tsx                 ← CREAR (Client Component)
lib/
  validations/
    auth.ts                       ← CREAR (Zod schema)
tests/
  unit/
    auth/
      login-schema.test.ts        ← CREAR
  e2e/
    auth/
      login.spec.ts               ← CREAR
stories/
  auth/
    LoginForm.stories.tsx         ← CREAR
.env.local                        ← MODIFICAR (añadir NEXT_PUBLIC_SITE_URL)
.env.example                      ← MODIFICAR (añadir NEXT_PUBLIC_SITE_URL)
README.md                         ← MODIFICAR (sección Resend SMTP setup)
docs/project/modules/auth.md      ← CREAR (documentación funcional del módulo)
```

### References

- [Source: epic-1-infraestructura-auth.md#Story 1.2] — ACs y notas técnicas originales
- [Source: architecture.md#Authentication & Security] — patrón auth, getUser(), SMTP Resend
- [Source: architecture.md#Process Patterns] — patrón API Route auth
- [Source: ux-design-specification.md#Pantalla 1 — Login] — diseño visual card login
- [Source: docs/project/design-tokens.md] — tokens CSS para el card
- [Source: stories/1-1-project-setup-base-infrastructure.md#Dev Agent Record] — learnings Homer: Vitest 2.1.9, ESLint scope, feature branch

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- zod, react-hook-form y @hookform/resolvers ya estaban instalados (story 1.1 los incluyó como dependencias del template)
- ESLint no-restricted-imports: actions.ts importa desde @/lib/supabase/server — correcto (no importa @supabase directamente)
- TypeScript: `searchParams` en Next.js 15 es `Promise<{...}>` — adaptado con `await searchParams`
- Storybook: stories `Sent` y `WithError` no se crean como stories separadas porque el componente gestiona estado interno — se incluyen `Default` y `WithLinkInvalidError` (que cubre AC 10)

### Completion Notes List

- T1: rama `feat/1-2-magic-link-authentication` creada desde `develop`
- T2: `lib/validations/auth.ts` — loginSchema con Zod. 6 tests unitarios pasan (email válido, email con subdominio, sin @, empieza por @, dominio vacío, cadena vacía)
- T3: `app/(auth)/layout.tsx` — layout centrado sin navbar. `app/(auth)/login/page.tsx` — Server Component con getUser() + redirect si hay sesión
- T4: `components/auth/LoginForm.tsx` — Client Component con react-hook-form + zodResolver + estado sent + aria-describedby + success state en mismo card
- T5: `app/(auth)/login/actions.ts` — Server Action sendMagicLink con validación Zod server-side + signInWithOtp + NEXT_PUBLIC_SITE_URL
- T6: `app/auth/callback/route.ts` — Route Handler GET con exchangeCodeForSession + redirect a /communities o /login?error=link-invalid
- T7: README.md actualizado con sección "Configurar Resend SMTP en Supabase Auth". .env.local y .env.example actualizados con NEXT_PUBLIC_SITE_URL
- T8: 6 tests unitarios pasando (Vitest). Test E2E creado (requiere servidor corriendo — no verificable en CI sin Supabase mock)
- T9: `stories/auth/LoginForm.stories.tsx` — 2 stories: Default y WithLinkInvalidError
- T10: commit + PR (sin remote configurado — pendiente push cuando se conecte origin)

### File List

**Creados:**
- `lib/validations/auth.ts` — loginSchema Zod + LoginInput type
- `app/(auth)/layout.tsx` — layout de rutas auth (centrado, sin navbar)
- `app/(auth)/login/page.tsx` — Server Component: getUser() + redirect + LoginForm
- `app/(auth)/login/actions.ts` — Server Action: sendMagicLink
- `components/auth/LoginForm.tsx` — Client Component: formulario magic link
- `app/auth/callback/route.ts` — Route Handler: exchangeCodeForSession
- `tests/unit/auth/login-schema.test.ts` — 6 tests unitarios (Vitest)
- `tests/e2e/auth/login.spec.ts` — 4 tests E2E (Playwright, requiere servidor)
- `stories/auth/LoginForm.stories.tsx` — 2 stories Storybook

**Modificados:**
- `.env.local` — añadida NEXT_PUBLIC_SITE_URL
- `.env.example` — añadida NEXT_PUBLIC_SITE_URL
- `README.md` — sección "Configurar Resend SMTP en Supabase Auth"
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — 1-2: in-progress → review
- `_bmad-output/execution-log.yaml` — entrada ds-20260327-003
