# Story 9.5: Navbar — logo, nombre de usuario e icono logout

Status: review

## Story

Como miembro autenticado,
quiero ver el logo del producto y mi nombre en el navbar,
para confirmar que estoy en la sesión correcta y salir fácilmente.

## Acceptance Criteria

1. **[AC-1]** Dado que estoy autenticado y navego a cualquier página del área `/communities`, cuando el navbar se renderiza, entonces:
   - A la izquierda: imagen logo `/public/logo.png` (32×32px, border-radius redondeado) + texto "Proof Day" (semibold)
   - A la derecha: nombre del usuario (`profile.name` o prefijo del email como fallback) + icono de logout con `aria-label="Cerrar sesión"` (sin texto visible)

2. **[AC-2]** Dado que hago clic en el icono de logout, cuando la acción se completa, entonces soy redirigido a `/login` con la sesión cerrada.

3. **[AC-3]** Dado que ejecuto `npm run storybook`, cuando navego a "layout/Navbar", entonces existe story para estado autenticado mostrando logo + nombre + icono logout.

4. **[AC-4]** Dado que ejecuto la suite de tests, cuando todos pasan, entonces lint/tsc/tests son verdes.

## Tasks / Subtasks

- [x] **T1** — `components/layout/Navbar.tsx`
  - [x] T1.1 Añadir prop `userName?: string`
  - [x] T1.2 Reemplazar el SVG placeholder (ícono bombilla) por `<Image src="/logo.png" width={32} height={32} style={{ borderRadius: 'var(--radius-full)' }} />`
  - [x] T1.3 A la derecha: mostrar `<span>{userName}</span>` si existe, antes del botón de logout
  - [x] T1.4 Botón logout: cambiar texto "Cerrar sesión" por un SVG icono `→` (log-out) con `aria-label="Cerrar sesión"` y `title="Cerrar sesión"`

- [x] **T2** — `components/layout/NavbarClient.tsx`
  - [x] T2.1 Añadir prop `userName?: string` y pasarla a `<Navbar>`

- [x] **T3** — `app/(app)/communities/layout.tsx`
  - [x] T3.1 Tras auth check, consultar `profiles` por `user.id` para obtener `name`
  - [x] T3.2 Calcular `userName = profile?.name ?? user.email?.split('@')[0] ?? ''`
  - [x] T3.3 Pasar `userName` a `<NavbarClient>`

- [x] **T4** — `stories/layout/Navbar.stories.tsx`
  - [x] T4.1 Añadir prop `userName` a argTypes
  - [x] T4.2 Story `Authenticated`: `args: { isAuthenticated: true, userName: 'Ana García' }`
  - [x] T4.3 Story `Unauthenticated`: sin cambios

- [x] **T5** — Tests `tests/unit/layout/navbar.test.tsx`
  - [x] T5.1 Renderiza logo img con alt="" (aria-hidden, decorativa) — verificado por querySelector
  - [x] T5.2 Muestra el nombre cuando se pasa `userName`
  - [x] T5.3 Botón logout tiene `aria-label="Cerrar sesión"` y NO tiene texto visible "Cerrar sesión"
  - [x] T5.4 Sin username: renderiza sin crash

- [x] **T6** — Verificación
  - [x] T6.1 `npm run lint` — verde
  - [x] T6.2 `npx tsc --noEmit` — verde
  - [x] T6.3 `npx vitest run tests/unit/` — 357/357 verde

## Dev Notes

### Arquitectura actual

```
CommunitiesLayout (Server Component async)
  └── NavbarClient (Client Component) — maneja logout
        └── Navbar (presentational) — recibe isAuthenticated + onLogout
```

Para pasar `userName`:
```
CommunitiesLayout — fetches profile.name → pasa userName a NavbarClient
NavbarClient — pasa userName a Navbar
Navbar — renderiza nombre + icono logout
```

### Logo en Navbar

```tsx
// Navbar.tsx — reemplazar el <div aria-hidden> con SVG por:
import Image from 'next/image'
// ...
<Image
  src="/logo.png"
  alt=""
  width={32}
  height={32}
  aria-hidden
  style={{ borderRadius: 'var(--radius-full)', flexShrink: 0 }}
/>
```

El `alt=""` porque el texto "Proof Day" ya describe el enlace.

### Consulta de profile en CommunitiesLayout

```tsx
// Después del auth check:
const { data: profile } = await supabase
  .from('profiles')
  .select('name')
  .eq('id', authData.user.id)
  .single()
const userName = profile?.name ?? authData.user.email?.split('@')[0] ?? ''
```

### Icono logout (SVG)

```tsx
// SVG de log-out (→ con flecha):
<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
     aria-hidden="true">
  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
  <polyline points="16 17 21 12 16 7" />
  <line x1="21" y1="12" x2="9" y2="12" />
</svg>
```

### Lado derecho del navbar

```tsx
{isAuthenticated && (
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
    {userName && (
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)',
                     fontWeight: 'var(--font-medium)' }}>
        {userName}
      </span>
    )}
    <button
      onClick={onLogout}
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
      style={{ background: 'transparent', border: 'none', cursor: 'pointer',
               color: 'var(--color-text-secondary)', padding: 'var(--space-1)',
               display: 'flex', alignItems: 'center' }}
    >
      {/* SVG log-out */}
    </button>
  </div>
)}
```

### Flow recomendado

Quick Flow (Bart)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Bart — Quick Flow)

### File List

- `components/layout/Navbar.tsx` (MODIFICAR)
- `components/layout/NavbarClient.tsx` (MODIFICAR)
- `app/(app)/communities/layout.tsx` (MODIFICAR)
- `stories/layout/Navbar.stories.tsx` (MODIFICAR)
- `tests/unit/layout/navbar.test.tsx` (NUEVO)

## Senior Developer Review

**Revisor:** Homer (Dev) — claude-sonnet-4-6
**Fecha:** 2026-04-11
**PR:** https://github.com/TaleorSwift/proof-day/pull/57
**Branch:** feat/9.5-navbar-logo-nombre-icono-logout

### Veredicto: APPROVED

Todos los ACs verificados. Lint/tsc limpios. 357/357 tests verdes.

### ACs verificados

| AC | Criterio | Resultado |
|---|---|---|
| AC-1 logo | `<Image src="/logo.png" alt="" width={32} height={32} aria-hidden style={{ borderRadius: 'var(--radius-full)' }}/>` en `Navbar.tsx` | PASS |
| AC-1 userName | Fallback `profile?.name ?? email?.split('@')[0] ?? ''` — fluye CommunitiesLayout → NavbarClient → Navbar | PASS |
| AC-1 logout | SVG icono con `aria-label="Cerrar sesión"`, sin texto visible | PASS |
| AC-2 | `NavbarClient.handleLogout`: `supabase.auth.signOut()` + `router.push('/login')` | PASS |
| AC-3 | Story `Authenticated` con `userName: 'Ana García'` en `Navbar.stories.tsx` | PASS |
| AC-4 | lint limpio / tsc limpio / 357/357 verdes | PASS |

### Observaciones (no bloquean)

1. **Test de logo usa `document.querySelector`** — correcto dado que `aria-hidden` excluye la imagen del árbol de accesibilidad. El comentario en el test lo documenta.
2. **`logo.png` pesa 1.7 MB** — recomendable optimizar el asset antes de ir a producción (fuera del alcance de esta story).
3. **Query a `profiles` sin manejo explícito de error** — aceptable; si la query falla, el fallback de email garantiza que `userName` nunca es undefined ni lanza crash.
