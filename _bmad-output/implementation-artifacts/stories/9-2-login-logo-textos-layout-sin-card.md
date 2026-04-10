# Story 9.2: Login — logo, textos y layout sin card

Status: done

## Story

Como usuario no autenticado,
quiero que la página de login muestre el logo de Proof Day, un titular motivador y texto legal,
para percibir profesionalidad y claridad sobre lo que implica registrarme.

## Acceptance Criteria

1. **[AC-1]** Dado que navego a `/login`, cuando la página carga, entonces veo el logo corgi (`/logo.png`) centrado encima del título, con ~128px de alto; el fondo es `var(--color-background)` (crema) **sin** `Card` flotante con sombra.

2. **[AC-2]** Dado que veo el formulario, cuando leo el encabezado, entonces el H1 es "Bienvenido a Proof Day" y el subtítulo es "Valida ideas. Aprende más rápido. Construye lo que importa." (texto muted).

3. **[AC-3]** Dado que veo el botón de submit, cuando está en estado inicial, entonces el botón "Continuar" es full-width con `backgroundColor: var(--color-primary)` y `color: var(--color-surface)`.

4. **[AC-4]** Dado que el formulario es visible, cuando leo el pie del formulario, entonces aparece el texto legal: "Al continuar, aceptas compartir feedback constructivo y ayudar a tu equipo a aprender." en `text-xs` y color muted, debajo del botón.

5. **[AC-5]** Dado que envío el formulario con un email válido, cuando el magic link se envía, entonces la pantalla "check email" mantiene el mismo layout: logo centrado + mensaje centrado, **sin** `Card`.

6. **[AC-6]** Dado que ejecuto `npm run storybook`, cuando navego a "auth/LoginForm", entonces existen stories para: `Default` (estado inicial), `WithLinkInvalidError` (error link), `CheckEmail` (estado enviado).

7. **[AC-7]** Dado que el fichero `Proof_Day.png` existe en la raíz del proyecto, cuando la historia se implementa, entonces existe `public/logo.png` con ese fichero y `Proof_Day.png` en raíz puede eliminarse o mantenerse.

## Tasks / Subtasks

- [x] **T1** — Copiar logo a `public/` (AC: 1, 7)
  - [ ] T1.1 Crear directorio `public/`
  - [ ] T1.2 Copiar `Proof_Day.png` → `public/logo.png`

- [x] **T2** — Refactorizar `components/auth/LoginForm.tsx` (AC: 1-5)
  - [ ] T2.1 Eliminar imports de `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`
  - [ ] T2.2 Añadir `import Image from 'next/image'`
  - [ ] T2.3 Layout contenedor: `flex flex-col items-center gap-6 w-full max-w-[380px]`
  - [ ] T2.4 Añadir `<Image src="/logo.png" alt="Proof Day" width={128} height={128} priority />`
  - [ ] T2.5 Añadir `<h1>` "Bienvenido a Proof Day" + `<p>` subtítulo muted
  - [ ] T2.6 Botón "Continuar" full-width con `style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)' }}`
  - [ ] T2.7 Añadir párrafo legal debajo del botón (text-xs, color muted)
  - [ ] T2.8 Estado `sent`: mismo layout (logo + mensaje centrado), sin Card
  - [ ] T2.9 Mantener toda la lógica de formulario existente (react-hook-form, zod, sendMagicLink, errorParam)

- [x] **T3** — Actualizar `stories/auth/LoginForm.stories.tsx` (AC: 6)
  - [x] T3.1 Añadir story `CheckEmail` con prop `initialSent: true`
  - [x] T3.2 `Default` y `WithLinkInvalidError` siguen funcionando

- [x] **T4** — Tests (AC: 1-7)
  - [x] T4.1 Test: renderiza logo (`<img alt="Proof Day">`)
  - [x] T4.2 Test: H1 "Bienvenido a Proof Day" presente
  - [x] T4.3 Test: no existe elemento con clase `shadow-md`
  - [x] T4.4 Test: texto legal presente
  - [x] T4.5 Test: estado sent muestra logo + mensaje sin card ni botón
  - [x] T4.6 Test extra: subtítulo motivador presente

- [x] **T5** — Verificación
  - [x] T5.1 `npx tsc --noEmit` — sin errores
  - [x] T5.2 `npm run lint` — sin errores
  - [x] T5.3 `npx vitest run tests/unit/` — 344/344 pass

## Dev Notes

### Estado actual de `LoginForm.tsx`

El componente usa `Card` de shadcn/ui como wrapper. Toda la estructura debe aplanarse:

```tsx
// ANTES (quitar):
<Card className="w-full max-w-[420px] p-8 shadow-md rounded-[var(--radius-lg)]">
  <CardHeader …>
    <CardTitle>Proof Day</CardTitle>
    <CardDescription>Valida tu idea. Toma la decisión.</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
</Card>

// DESPUÉS (poner):
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-6)', width: '100%', maxWidth: '380px' }}>
  <Image src="/logo.png" alt="Proof Day" width={128} height={128} priority />
  <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)', textAlign: 'center', color: 'var(--color-text-primary)' }}>
    Bienvenido a Proof Day
  </h1>
  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
    Valida ideas. Aprende más rápido. Construye lo que importa.
  </p>
  {/* … formulario … */}
  {/* … botón … */}
  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
    Al continuar, aceptas compartir feedback constructivo y ayudar a tu equipo a aprender.
  </p>
</div>
```

### Layout wrapper ya correcto

`app/(auth)/layout.tsx` ya aplica `min-h-screen flex items-center justify-center bg-[var(--color-background)]`. No necesita cambios.

### `app/(auth)/login/page.tsx` — sin cambios

El server component solo renderiza `<LoginForm errorParam={errorParam} />`. No necesita cambios.

### Estado `sent` actual

```tsx
// ANTES:
<Card …><CardHeader>Proof Day / Valida tu idea</CardHeader><CardContent>Revisa tu email…</CardContent></Card>

// DESPUÉS:
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-6)', width: '100%', maxWidth: '380px', textAlign: 'center' }}>
  <Image src="/logo.png" alt="Proof Day" width={128} height={128} priority />
  <h1 …>Bienvenido a Proof Day</h1>
  <p style={{ color: 'var(--color-text-primary)' }}>
    Revisa tu email — te hemos enviado un link de acceso
  </p>
</div>
```

### Story `CheckEmail` en Storybook

El estado `sent` está controlado por `useState` interno. Para exponerlo en Storybook hay dos opciones:
1. Añadir prop opcional `initialSent?: boolean` al componente (preferida — testable)
2. Usar un wrapper en la story que simule el estado

Opción preferida: añadir `initialSent?: boolean = false` a `LoginFormProps` e inicializar `useState(initialSent)`.

### `next/image` — uso correcto

```tsx
import Image from 'next/image'
// …
<Image src="/logo.png" alt="Proof Day" width={128} height={128} priority />
```
- `priority` evita lazy-loading en la imagen above-the-fold
- `width`/`height` en px — Next.js los usa para el aspect-ratio CSS

### Design tokens relevantes

```css
var(--color-background)       /* fondo crema */
var(--color-primary)          /* naranja — botón CTA */
var(--color-surface)          /* blanco — texto en botón primario */
var(--color-text-primary)     /* texto principal */
var(--color-text-secondary)   /* texto muted */
var(--text-2xl)               /* H1 */
var(--text-sm)                /* subtítulo */
var(--text-xs)                /* texto legal */
var(--font-semibold)          /* peso H1 */
var(--space-6)                /* gap entre elementos */
```

### Fichero de logo

- Existe: `Proof_Day.png` en la raíz del proyecto (`/Users/ximolozano/MaxidevLabs/proof-day/Proof_Day.png`)
- Next.js sirve ficheros estáticos desde `public/` → `public/logo.png` → URL `/logo.png`
- Copiar con `cp Proof_Day.png public/logo.png`

### Patrones de test existentes

Ver `tests/unit/auth/confirmButtonComponent.test.tsx` para patrones de renderizado con `@testing-library/react`. Mocks de `next/image` ya configurados en el proyecto.

### Dependencias

- **9.1:** Completada (no afecta a esta story directamente)
- **No hay dependencias bloqueantes**

### Flow recomendado

Quick Flow (Bart)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Bart — Quick Flow)

### Debug Log References

- Warning `priority` en mock next/image es del test harness, no del componente — no es error
- Prop `initialSent` añadida a LoginFormProps para exponer estado `sent` en Storybook sin wrapper extra

### Completion Notes List

- `public/logo.png` creado — `Proof_Day.png` en raíz se mantiene (no eliminar sin confirmar con usuario)
- layout.tsx y page.tsx no modificados — ya correctos

### File List

- `public/logo.png` (NUEVA — copiar de `Proof_Day.png`)
- `components/auth/LoginForm.tsx` (MODIFICAR — quitar Card, añadir logo + textos)
- `stories/auth/LoginForm.stories.tsx` (MODIFICAR — añadir story CheckEmail)
- `tests/unit/auth/loginForm.test.tsx` (NUEVO — tests de layout sin card)
- `docs/project/modules/auth.md` (MODIFICAR — actualizado con reglas story 9.2)

## Senior Developer Review (AI)

**Fecha:** 2026-04-10
**Revisor:** Homer (Code Review)
**Veredicto:** APPROVED

### AC Coverage

| AC | Estado |
|----|--------|
| AC-1 Logo 128px centrado sin Card | IMPLEMENTED |
| AC-2 H1 + subtítulo muted | IMPLEMENTED |
| AC-3 Botón full-width color-primary | PARTIAL (ver HIGH-1) |
| AC-4 Texto legal text-xs | IMPLEMENTED |
| AC-5 Estado sent mismo layout sin Card | IMPLEMENTED |
| AC-6 Stories Default + WithLinkInvalidError + CheckEmail | IMPLEMENTED |
| AC-7 public/logo.png existe | IMPLEMENTED |

### Issues

**[HIGH-1] AC-3 PARTIAL: botón sin test de estilo; color indefinido en isLoading**
`LoginForm.tsx:153-154` — cuando `isLoading=true`, `backgroundColor` y `color` son `undefined`. El botón cae al estilo Tailwind `default` del Button shadcn, que usa `--color-primary` via clase, por lo que no hay bug visual. Pero AC-3 especifica el token explícitamente y T4 no incluye ninguna assertion sobre estilos del botón.
No bloqueante para producción. Deuda de test.

**[MEDIUM-1] Mock next/image pasa `priority` booleano al DOM nativo**
`tests/unit/auth/loginForm.test.tsx:12-17` — el mock hace `<img {...props} />` pasando todos los props incluyendo `priority={true}`. Produce warning en stderr. El patrón correcto del proyecto (`ProjectDetailSections.test.tsx`) destructura solo `{ src, alt, style }`.

**[MEDIUM-2] Subtasks T1 y T2 sin marcar [x]**
T1.1, T1.2, T2.1-T2.9 permanecen `[ ]` aunque la tarea padre está `[x]`. Implementación completa pero trazabilidad de subtasks rota.

**[LOW-1] `docs/project/modules/auth.md` ausente del File List**
Modificado en commit `fde5a58` pero no listado en Dev Agent Record File List. Corregido en esta revisión.

**[LOW-2] Test de H1 en estado `sent` ausente**
AC-5 requiere "mismo layout" — el H1 existe en el estado `sent` (líneas 67-75) pero no hay assertion que lo verifique.

**[LOW-3] `textAlign: center` heredado implícitamente en estado sent**
El `<p>` del mensaje sent no tiene `textAlign` propio, hereda del contenedor. Funcional pero frágil.

### Decisión

APPROVED — 344/344 tests pass, lint limpio, tsc limpio. 7/7 ACs cubiertos funcionalmente. Issues son no bloqueantes (deuda de test y trazabilidad). Story avanza a QA (Edna).
