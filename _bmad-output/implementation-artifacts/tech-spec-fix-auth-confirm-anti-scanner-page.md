---
title: 'Fix auth/confirm — Restore anti-scanner intermediate page'
slug: 'fix-auth-confirm-anti-scanner-page'
created: '2026-05-19'
status: 'completed'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Next.js 16.2.6', '@supabase/ssr 0.10.3', '@supabase/supabase-js 2.106.0', 'Vitest', 'Playwright', 'Storybook nextjs-vite', 'TypeScript']
files_to_modify:
  - 'app/auth/confirm/route.ts (DELETE)'
  - 'tests/unit/auth/confirmRoute.test.ts (DELETE — reemplazar por confirmPage.test.tsx)'
  - 'app/auth/confirm/page.tsx (CREATE)'
  - 'tests/unit/auth/confirmPage.test.tsx (CREATE)'
  - 'tests/e2e/auth/confirm.spec.ts (CREATE)'
  - 'stories/auth/ConfirmPage.stories.tsx (CREATE)'
  - 'docs/project/modules/auth.md (UPDATE)'
code_patterns:
  - 'Server Component async con searchParams Promise — ver login/page.tsx:9-21'
  - 'Layout centering inline (app/auth/ no usa route group (auth)) — ver app/auth/error/page.tsx'
  - 'redirect() from next/navigation para invalid params'
  - 'ConfirmButton: client component, verifyOtp en onClick NO en GET'
test_patterns:
  - 'Unit: vi.mock(next/navigation, redirect throws REDIRECT:url) — ver confirmRoute.test.ts:8-15'
  - 'Unit: vi.hoisted + vi.mock antes de imports — ver confirmRoute.test.ts:17-29'
  - 'E2E: test.describe + clearCookies beforeEach para rutas públicas — ver auth-error.spec.ts'
  - 'Storybook: @storybook/nextjs-vite, parameters.nextjs.navigation.push: fn() — ver ConfirmButton.stories.tsx:18-24'
---

# Tech-Spec: Fix auth/confirm — Restore anti-scanner intermediate page

**Created:** 2026-05-19

## Overview

### Problem Statement

El commit `e3b3266 "fix(auth): remove conflicting page.tsx — auth/confirm uses route.ts handler"` introdujo una regresión: eliminó la página intermedia con botón de `/auth/confirm` reemplazándola con un `route.ts` que llama a `verifyOtp` directamente en el GET. Los escáneres anti-phishing de proveedores de email (Gmail Safe Browsing, Outlook ATP) hacen GET automático al enlace del email para verificar que no es phishing, consumiendo el OTP one-time antes que el usuario humano. Resultado en producción: 403 `otp_expired` cuando el usuario hace clic.

Confirmado en logs de Supabase Auth: `POST /verify` desde IPs AWS (54.167.115.187, 100.53.45.182) ~1 minuto antes del clic real del usuario desde IP 159.26.107.51. Ratio de fallo ~70% en `/verify`.

### Solution

Borrar `app/auth/confirm/route.ts` (la regresión). Crear `app/auth/confirm/page.tsx` — Server Component que valida los searchParams y renderiza `<ConfirmButton>`. El `ConfirmButton` ejecuta `verifyOtp` solo al `onClick` del usuario humano — los bots hacen GET pero no pulsan botones, por lo que el token sobrevive hasta que el usuario llega.

Todo el código necesario ya existe en el repo (huérfano tras el commit erróneo): `components/auth/ConfirmButton.tsx` y `lib/auth/confirm.ts`.

### Scope

**In Scope:**
- Borrar `app/auth/confirm/route.ts`
- Crear `app/auth/confirm/page.tsx` (reutiliza código existente)
- Tests unit: `tests/unit/auth/confirmPage.test.tsx`
- Tests E2E: `tests/e2e/auth/confirm.spec.ts`
- Storybook: story `auth/ConfirmPage` (variantes `Default` + `MissingParams`)
- Actualizar `docs/project/modules/auth.md` (líneas 23-27)

**Out of Scope:**
- Cambios en `components/auth/ConfirmButton.tsx` — ya funciona
- Cambios en `lib/auth/confirm.ts` — ya funciona
- Cambios en `app/auth/callback/route.ts` — sin tocar
- Config Supabase Dashboard / Vercel — pasos manuales documentados fuera de este spec

## Context for Development

### Codebase Patterns

- **Server Component con searchParams async** (`login/page.tsx:9-21`): `async function Page({ searchParams }: { searchParams: Promise<...> })` → `const params = await searchParams`.
- **Layout en `app/auth/`**: Las rutas dentro de `app/auth/` NO están en el route group `(auth)` → no heredan `app/(auth)/layout.tsx`. Cada página centra el contenido inline (ver `app/auth/error/page.tsx:26` con `flex min-h-svh items-center justify-center`).
- **Redirect para parámetros inválidos**: `redirect('/login?error=link-invalid')` de `next/navigation` — mismo destino que usa `app/auth/callback/route.ts:15`.
- **Anti-scanner pattern**: la defensa reside en que `verifyOtp` se ejecute en el `onClick` del `ConfirmButton` (client component), nunca en el GET de la página. Los bots siguen el enlace pero no hacen click.
- **`validateConfirmSearchParams`** (`lib/auth/confirm.ts:79-99`): recibe `{ token, type, redirect_to }` y devuelve `{ valid: true, token, type, redirectTo }` o `{ valid: false }`. El campo se llama `token` (no `token_hash`) — importante para el template de email y los searchParams de la página.
- **`BrandHeader`** (`components/shared/BrandHeader.tsx`): props `subtitle?: string`, usa design tokens CSS vars, no necesita wrapper.
- **`ConfirmButton`** (`components/auth/ConfirmButton.tsx`): props `{ token: string, type?: string, redirectTo?: string }`. Usa `createClient` (browser) + `useRouter`. NO se toca.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `app/auth/confirm/route.ts` | Fichero a ELIMINAR (la regresión) |
| `app/auth/callback/route.ts` | Maneja PKCE `?code=` — no tocar, sigue funcionando |
| `components/auth/ConfirmButton.tsx` | Reutilizar tal cual — `verifyOtp` en `onClick` |
| `lib/auth/confirm.ts:79-99` | `validateConfirmSearchParams` — reutilizar sin cambios |
| `components/shared/BrandHeader.tsx` | Reutilizar — logo + H1 + subtítulo |
| `app/(auth)/login/page.tsx` | Referencia del patrón Server Component con searchParams |
| `app/auth/error/page.tsx` | Referencia del layout inline para rutas en `app/auth/` |
| `tests/unit/auth/confirmRoute.test.ts` | ELIMINAR — testeaba el route.ts que desaparece |
| `stories/auth/ConfirmButton.stories.tsx` | Referencia del patrón Storybook para auth |
| `stories/auth/LoginForm.stories.tsx` | Referencia adicional del patrón Storybook |

### Technical Decisions

- **Borrar `route.ts` antes de crear `page.tsx`**: Next.js App Router no permite coexistencia de `route.ts` y `page.tsx` en la misma carpeta. El borrado es paso previo obligatorio.
- **Borrar `confirmRoute.test.ts`**: Testeaba el handler GET que desaparece. Sus ACs son reemplazados por `confirmPage.test.tsx` (redirect con params inválidos) y los tests existentes de `confirmButton.test.ts` (lógica OTP).
- **No crear componente wrapper** para el story: la story de `ConfirmPage` compone `BrandHeader` + `ConfirmButton` directamente en el fichero, igual que el patrón de `LoginForm.stories.tsx`. No se añade un componente `ConfirmView` intermedio.
- **Centering layout inline**: `app/auth/confirm/page.tsx` usa `div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6"` (no hereda layout del route group `(auth)`).
- **Parámetro `token` (no `token_hash`)**: `validateConfirmSearchParams` y `ConfirmButton` usan `token`. El template de email en Supabase Dashboard debe usar `{{ .TokenHash }}` como valor del parámetro `token=` en la URL.

## Implementation Plan

### Tasks

Orden TDD Outside-In: eliminar regresión → tests E2E (outer) → tests unit (inner) → implementar → story → docs.

- [x] **Task 1: Eliminar ficheros de la regresión**
  - Archivo: `app/auth/confirm/route.ts`
  - Acción: **Borrar el fichero completo.** Es la regresión introducida en commit `e3b3266`. Next.js no permite coexistencia de `route.ts` y `page.tsx` en la misma carpeta — este borrado es prerrequisito de todo lo demás.
  - Archivo: `tests/unit/auth/confirmRoute.test.ts`
  - Acción: **Borrar el fichero completo.** Testea el handler GET que desaparece. Reemplazado por `confirmPage.test.tsx` en Task 3.

- [x] **Task 2: Crear test E2E (outer ring)**
  - Archivo: `tests/e2e/auth/confirm.spec.ts` (crear nuevo)
  - Acción: Crear spec con `test.describe` + `clearCookies` en `beforeEach`. Casos:
    1. `GET /auth/confirm?token=abc&type=magiclink` → página renderiza un botón con texto "Acceder a Proof Day".
    2. `GET /auth/confirm` (sin params) → redirige a `/login` con `error=link-invalid` visible.
    3. `GET /auth/confirm?token=abc&type=hackedtype` (type inválido) → redirige a `/login` con `error=link-invalid`.
  - Notas: Usar `getByRole('button', { name: /acceder/i })` para el botón. Para las redirecciones, `expect(page).toHaveURL(/login.*error=link-invalid/)`. No llamar a Supabase real — solo verificar UI/redirect. Seguir reglas `tests/e2e/`: `test.beforeEach clearCookies`, nombres en español, comillas simples.

- [x] **Task 3: Crear test unitario del page (inner ring)**
  - Archivo: `tests/unit/auth/confirmPage.test.tsx` (crear nuevo)
  - Acción: Testear el Server Component `ConfirmPage`. Patrón idéntico a `confirmRoute.test.ts`: `vi.mock('next/navigation', () => ({ redirect: (url) => { redirectMock(url); throw new Error('REDIRECT:' + url) } }))`. Casos:
    1. `token` presente + `type` válido → NO se llama a `redirect`, el componente retorna contenido (verificar que no lanza `REDIRECT:`).
    2. Sin `token` → `redirect('/login?error=link-invalid')` llamado.
    3. Sin `type` → `redirect('/login?error=link-invalid')` llamado.
    4. `type='notavalidtype'` (no en EmailOtpType) → `redirect('/login?error=link-invalid')` llamado.
    5. `redirect_to='https://evil.com'` (open redirect) + token + type válidos → NO redirige a login (acepta, pero `redirectTo` se normaliza a `/communities` — garantizado por `validateConfirmSearchParams`).
  - Notas: `searchParams` es `Promise<...>` en Next.js 16 — pasar `searchParams: Promise.resolve({ token: 'abc', type: 'magiclink' })`. Para verificar render en caso válido, puede renderizarse con `renderToString` de `react-dom/server` o simplemente verificar que la llamada no lanza `REDIRECT:`.

- [x] **Task 4: Implementar `app/auth/confirm/page.tsx`**
  - Archivo: `app/auth/confirm/page.tsx` (crear nuevo)
  - Acción: Server Component async. Implementación exacta:
    ```tsx
    import { redirect } from 'next/navigation'
    import { validateConfirmSearchParams } from '@/lib/auth/confirm'
    import { ConfirmButton } from '@/components/auth/ConfirmButton'
    import { BrandHeader } from '@/components/shared/BrandHeader'

    interface ConfirmPageProps {
      searchParams: Promise<{ token?: string; type?: string; redirect_to?: string }>
    }

    export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
      const params = await searchParams
      const result = validateConfirmSearchParams({
        token: params.token,
        type: params.type,
        redirect_to: params.redirect_to,
      })

      if (!result.valid) {
        redirect('/login?error=link-invalid')
      }

      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
          <BrandHeader subtitle="Un último paso para acceder." />
          <ConfirmButton
            token={result.token}
            type={result.type}
            redirectTo={result.redirectTo}
          />
        </div>
      )
    }
    ```
  - Notas: No importar Supabase — la página no hace llamadas de red. Layout inline (no hereda `(auth)` route group). `validateConfirmSearchParams` devuelve `ValidConfirmResult` cuando `valid: true` — TypeScript ya garantiza que `result.token/type/redirectTo` existen en esa rama.

- [x] **Task 5: Crear story Storybook**
  - Archivo: `stories/auth/ConfirmPage.stories.tsx` (crear nuevo)
  - Acción: Story con `title: 'Auth/ConfirmPage'`, `layout: 'fullscreen'`, `parameters.nextjs.navigation.push: fn()`. Componer `BrandHeader` + `ConfirmButton` directamente (la story no puede renderizar un Server Component — componer la UI resultante). Variante `Default` (token válido, type magiclink). Seguir patrón de `LoginForm.stories.tsx`.
  - Notas: Como `ConfirmPage` es Server Component, la story define un componente wrapper local que replica el JSX del caso válido (`BrandHeader` + `ConfirmButton`). No importar la `page.tsx` directamente.

- [x] **Task 6: Actualizar documentación funcional**
  - Archivo: `docs/project/modules/auth.md`
  - Acción: En línea 27, reemplazar `"ver PR #34 para instrucciones"` con el HTML exacto del template de Supabase Dashboard:
    ```
    Template Magic Link en Supabase Dashboard:
    Subject: Tu enlace de acceso a Proof Day
    URL del enlace: {{ .SiteURL }}/auth/confirm?token={{ .TokenHash }}&type=magiclink&redirect_to={{ .RedirectTo }}
    ```
  - Añadir línea tras la regla de confirmación: `"Doble opt-in (Confirm email) desactivado en Supabase Dashboard — signInWithOtp envía únicamente el email 'Magic Link'."` (bug fix 2026-05-19)
  - Actualizar línea de "Ficheros clave": cambiar `app/auth/confirm/page.tsx` (ya estaba documentado pero con referencia a `route.ts` en el código).
  - Actualizar sección "Última actualización" con la rama y fecha actuales.

- [x] **Task 7: Verificación final**
  - Acción: `npm run lint && npm test && npm run build` — todos verdes antes de commit. Si hay error de TypeScript en `result.token/type/redirectTo` (acceso en rama `valid: true`), añadir type guard explícito o usar `as ValidConfirmResult`.

### Acceptance Criteria

- [ ] **AC1:** Dado `GET /auth/confirm?token=abc123&type=magiclink`, cuando la página carga, entonces renderiza un botón con texto "Acceder a Proof Day" y NO llama a `supabase.auth.verifyOtp` en el GET.
- [ ] **AC2:** Dado `GET /auth/confirm` sin parámetros, cuando la página carga, entonces redirige a `/login?error=link-invalid`.
- [ ] **AC3:** Dado `GET /auth/confirm?token=abc123` sin `type`, cuando la página carga, entonces redirige a `/login?error=link-invalid`.
- [ ] **AC4:** Dado `GET /auth/confirm?type=magiclink` sin `token`, cuando la página carga, entonces redirige a `/login?error=link-invalid`.
- [ ] **AC5:** Dado `GET /auth/confirm?token=abc&type=notavalidtype`, cuando la página carga, entonces redirige a `/login?error=link-invalid` (type inválido rechazado por `validateConfirmSearchParams`).
- [ ] **AC6:** Dado params válidos con `redirect_to=/my-path`, cuando el usuario hace click en el botón, entonces `verifyOtp` se llama con el token/type correctos y en caso de éxito redirige a `/my-path`.
- [ ] **AC7:** Dado params válidos sin `redirect_to`, cuando el usuario hace click en el botón, entonces en caso de éxito redirige a `/communities`.
- [ ] **AC8:** Dado `redirect_to=https://evil.com` (open redirect), cuando la página carga (token + type válidos), entonces renderiza el botón con `redirectTo=/communities` como fallback — NO redirige a dominio externo.
- [ ] **AC9:** `app/auth/confirm/route.ts` no existe en el repo — `npm run build` no lanza error de `route.ts` + `page.tsx` en conflicto.
- [ ] **AC10:** `tests/unit/auth/confirmRoute.test.ts` no existe — el test runner no intenta importar `@/app/auth/confirm/route` (que ya no existe).
- [ ] **AC11:** Suite completa (`npm test`) verde sin regresiones.

## Additional Context

### Dependencies

- Sin dependencias externas nuevas — todas las librerías usadas ya están en `package.json`.
- `lib/auth/confirm.ts::validateConfirmSearchParams` y `::buildConfirmParams` sin cambios.
- `components/auth/ConfirmButton.tsx` sin cambios.
- `components/shared/BrandHeader.tsx` sin cambios.
- Pasos manuales en Supabase Dashboard y Vercel (fuera de este spec — documentados en el plan de investigación) deben aplicarse para que el fix sea efectivo en producción. Los pasos de código solos no son suficientes.

### Testing Strategy

**Unit (Vitest):**
- `tests/unit/auth/confirmPage.test.tsx` — Server Component: mocks de `next/navigation` (redirect lanza), `lib/auth/confirm` (validateConfirmSearchParams mockeable) o llamada directa con params reales. Cubre 5 casos: válido (no lanza REDIRECT), sin token, sin type, type inválido, open redirect (acepta con fallback).
- `tests/unit/auth/confirmButton.test.ts` — ya existente, cubre `validateConfirmSearchParams` y `buildConfirmParams`. NO TOCAR.

**E2E (Playwright):**
- `tests/e2e/auth/confirm.spec.ts` — 3 casos: renderiza botón con params válidos, redirige sin params, redirige con type inválido. Sin auth real.

**Manual (post-merge en producción):**
- Esperar 30s antes de pulsar el enlace del email para dar tiempo al escáner de Gmail.
- Verificar en Supabase Auth Logs que `POST /verify` desde IPs bot no aparece antes del clic.

## Review Notes

- Adversarial review completado — 12 findings, 5 fixed (auto), 7 skipped/noise/out-of-scope
- Findings fixed: A1 (doc mock), A2 (guard token vacío en ConfirmButton), A5 (console.error logging), A9 (edge case tests whitespace + protocol-relative), A11 (exportar DEFAULT_REDIRECT)
- Findings noise: A3 (disabled={isLoading} ya protege), A4 (tipos ya compatibles), A7 (E2E mock token correcto)
- Findings skipped/design: A6 (redirect homogéneo = seguridad por diseño), A8 (timeout out of scope), A10 (CSRF comentado en código), A12 (story sync manual)
- Tests: 35 passed (0 failed) — confirmPage.test.tsx (11), confirmButtonComponent.test.tsx (9), confirmButton.test.ts (15)
- Lint: 0 errors, 13 warnings pre-existentes
- Build: verde, /auth/confirm compila como ƒ (dynamic Server Component)

### Notes

- **Riesgo: TypeScript en rama `valid: true`** — `validateConfirmSearchParams` devuelve `ConfirmValidationResult` (union type). En la rama `if (!result.valid) redirect(...)`, TypeScript debería inferir el tipo `ValidConfirmResult` para el `return`. Si no, usar `const valid = result as ValidConfirmResult` o `if (result.valid) { /* render */ }`.
- **Los pasos manuales en Supabase Dashboard son el fix real del bug en producción.** El código solo no es suficiente. Si los templates siguen apuntando a `{{ .ConfirmationURL }}`, el bug persiste independientemente de este PR.
- **`confirmButton.test.ts` tiene un naming inconsistente**: el fichero se llama `confirmButton.test.ts` pero testea `validateConfirmSearchParams` y `buildConfirmParams` (funciones de `lib/auth/confirm.ts`). No se renombra en este fix para evitar scope creep.
- **Worktrees de Claude**: hay varios `.claude/worktrees/` con stories de `ConfirmButton`. Son artefactos de runs previos, no afectan al proyecto.
- **Commit convention**: `fix(auth): restore anti-scanner intermediate page for /auth/confirm` — tipo `fix`, scope `auth`.
