# Story 9.4: Landing / — welcome screen

Status: review

## Story

Como usuario que llega a la raíz de la app,
quiero ver la welcome screen del prototipo (logo + titular + CTA),
para tener una primera impresión coherente con la identidad visual del producto.

## Acceptance Criteria

1. **[AC-1]** Dado que navego a `/` sin sesión activa, cuando la página carga, entonces veo:
   - Logo `/public/logo.png` centrado, ~128px
   - H1: "Bienvenido a Proof Day"
   - Subtítulo: "Valida ideas. Aprende más rápido. Construye lo que importa." (muted)
   - Botón naranja full-width: "Continuar con email" → href="/login"
   - Texto legal: "Al continuar, aceptas compartir feedback constructivo y ayudar a tu equipo a aprender."
   - Fondo `var(--color-background)` (crema)
   - Sin ningún elemento del antiguo marketing (nav, hero, "Cómo funciona", "Por qué Proof Day", footer)

2. **[AC-2]** Dado que navego a `/` con sesión activa, cuando la página carga, entonces soy redirigido a `/communities`.

3. **[AC-3]** Dado que ejecuto la suite de tests, cuando todos pasan, entonces `npm run lint`, `npx tsc --noEmit` y `npx vitest run tests/unit/` son verdes.

4. **[AC-4]** La story en Storybook `pages/LandingPage` (o similar) existe con el estado Default.

## Tasks / Subtasks

- [x] **T1** — Reescribir `app/page.tsx` eliminando todo el marketing
  - [x] T1.1 Mantener `getUser()` + redirect a `/communities` si autenticado
  - [x] T1.2 Layout: `min-h-screen flex items-center justify-center bg-[var(--color-background)]`
  - [x] T1.3 Contenedor centrado (mismo CONTAINER_STYLE que LoginForm: flex col, max-w-[380px])
  - [x] T1.4 `<Image src="/logo.png" alt="Proof Day" width={128} height={128} priority />`
  - [x] T1.5 H1 "Bienvenido a Proof Day"
  - [x] T1.6 Subtítulo "Valida ideas. Aprende más rápido. Construye lo que importa."
  - [x] T1.7 Botón `<Link href="/login">Continuar con email</Link>` — estilo naranja full-width
  - [x] T1.8 Texto legal text-xs muted

- [x] **T2** — Tests unitarios `tests/unit/landing/landingPage.test.tsx`
  - [x] T2.1 Renderiza logo `alt="Proof Day"`
  - [x] T2.2 H1 "Bienvenido a Proof Day"
  - [x] T2.3 Subtítulo motivador
  - [x] T2.4 Link a /login con texto "Continuar con email"
  - [x] T2.5 Texto legal presente
  - [x] T2.6 No contiene elemento de marketing (Cómo funciona / Por qué Proof Day)

- [x] **T3** — Story Storybook `stories/landing/LandingPage.stories.tsx`
  - [x] T3.1 Story Default (sin sesión)

- [x] **T4** — Actualizar metadata SEO del `app/page.tsx` para la welcome screen

- [x] **T5** — Verificación
  - [x] T5.1 `npm run lint` — verde
  - [x] T5.2 `npx tsc --noEmit` — verde
  - [x] T5.3 `npx vitest run tests/unit/` — verde (351/351)

## Dev Notes

### Estado actual de `app/page.tsx`

Contiene landing de marketing completa: nav + hero + "Cómo funciona" + "Por qué Proof Day" + CTA final + footer.
La sesión ya se comprueba correctamente con `supabase.auth.getUser()` + redirect. Mantener esa lógica.

### Layout objetivo

Visualmente idéntico a `LoginForm` (Story 9.2) pero con Link en vez de formulario:

```tsx
// app/page.tsx (Server Component — no 'use client')
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/communities')

  return (
    <main className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-background)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 'var(--space-6)', width: '100%', maxWidth: '380px', textAlign: 'center',
                    padding: '0 var(--space-4)' }}>
        <Image src="/logo.png" alt="Proof Day" width={128} height={128} priority />
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
          Bienvenido a Proof Day
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Valida ideas. Aprende más rápido. Construye lo que importa.
        </p>
        <Link href="/login" style={{ width: '100%', display: 'block', backgroundColor: 'var(--color-primary)',
                                      color: 'var(--color-surface)', padding: 'var(--space-3) var(--space-4)',
                                      borderRadius: 'var(--radius-md)', textDecoration: 'none',
                                      fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-base)' }}>
          Continuar con email
        </Link>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
          Al continuar, aceptas compartir feedback constructivo y ayudar a tu equipo a aprender.
        </p>
      </div>
    </main>
  )
}
```

### Tests — mocks necesarios

- `next/image` → mismo mock que en loginForm.test.tsx
- `@/lib/supabase/server` → mock `createClient` con `auth.getUser` retornando `{ data: { user: null } }`
- `next/navigation` → mock `redirect`

### Storybook

`app/page.tsx` es Server Component con redirect — no se puede usar directamente en Storybook.
Crear un componente `WelcomePage` (o inline en la story con un wrapper) que reciba `isAuthenticated?: boolean` para controlar el redirect en Storybook.

O más simple: story que renderiza el contenido visual (sin lógica de auth) directamente.

### Dependencias

- `public/logo.png` — ya existe (Story 9.2)
- No hay dependencias bloqueantes

### Flow recomendado

Quick Flow (Bart)

## Senior Developer Review

**Agente**: Homer (Dev)
**Fecha**: 2026-04-11
**Veredicto**: APPROVED

### Checklist de verificación

| Item | Estado | Evidencia |
|------|--------|-----------|
| AC-1: Logo 128px + H1 + subtítulo + Link /login + texto legal | PASS | `WelcomeScreen.tsx` — Image width/height=128, h1, Link href="/login", texto legal presentes |
| AC-1: Fondo `var(--color-background)` | PASS | `style={{ backgroundColor: 'var(--color-background)' }}` en `<main>` |
| AC-1: Sin elementos de marketing | PASS | grep 0 matches para "Cómo funciona", "Por qué Proof Day", "Solicitar acceso", "hola@proofday.app" |
| AC-2: redirect('/communities') con sesión activa | PASS | `if (user) redirect('/communities')` en `app/page.tsx` |
| AC-3: lint verde | PASS | `npm run lint` — sin errores |
| AC-3: tsc verde | PASS | `npx tsc --noEmit` — sin errores |
| AC-3: tests verdes 351/351 | PASS | `npx vitest run tests/unit/` — 351 passed (32 test files) |
| AC-4: Storybook `pages/LandingPage > Default` | PASS | `stories/landing/LandingPage.stories.tsx` — title: 'pages/LandingPage', export Default |
| WelcomeScreen puro (sin auth) | PASS | grep 0 matches para supabase/createClient/getUser en `WelcomeScreen.tsx` |
| app/page.tsx solo auth+redirect+render | PASS | 26 líneas — metadata, createClient, getUser, redirect, return `<WelcomeScreen />` |
| Design tokens — sin valores hardcodeados | PASS | Todos los estilos usan `var(--*)` |
| Tests cubren 6 ACs de T2 | PASS | 7 tests: logo, H1, subtítulo, link /login, texto legal, sin "Cómo funciona", sin "Por qué Proof Day" |

### Observaciones

- Warning `Received 'true' for a non-boolean attribute 'priority'` en tests: cosmético y esperado. El mock de `next/image` renderiza un `<img>` nativo que no entiende el atributo booleano `priority` de Next.js. No afecta al comportamiento ni a la cobertura.
- La separación `WelcomeScreen` (visual puro) / `app/page.tsx` (auth+redirect) es correcta y facilita tanto el testing sin mocks de Supabase como el uso en Storybook.
- El módulo `docs/project/modules/landing.md` documenta correctamente las reglas, textos canónicos y design tokens. Bien.

### Resultado

PR#56 aprobado. Ready para merge a `main`.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Bart — Quick Flow)

### File List

- `app/page.tsx` (MODIFICAR — reescribir)
- `tests/unit/landing/landingPage.test.tsx` (NUEVO)
- `stories/landing/LandingPage.stories.tsx` (NUEVO)
