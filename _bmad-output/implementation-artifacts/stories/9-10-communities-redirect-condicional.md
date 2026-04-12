# Story 9.10: Communities — redirect condicional según número de comunidades

Status: ready-for-dev

## Story

Como usuario autenticado,
quiero que la página `/communities` me lleve directamente al feed si solo pertenezco a una comunidad, o me muestre un estado vacío claro si no tengo ninguna,
para no tener que navegar por una lista intermedia cuando no es necesario.

## Acceptance Criteria

1. **[AC-1]** Dado que el usuario autenticado pertenece a exactamente 1 comunidad, cuando accede a `app/(app)/communities/page.tsx`, entonces:
   - Se ejecuta un redirect server-side a `/communities/[slug]` de esa comunidad.
   - No se renderiza ningún contenido de lista — el redirect ocurre antes del render.
   - El redirect es permanente (status 308) para que el navegador lo cachee.

2. **[AC-2]** Dado que el usuario autenticado no pertenece a ninguna comunidad, cuando accede a `/communities`, entonces:
   - Se renderiza un estado vacío con: ilustración o icono, texto `"Aún no perteneces a ninguna comunidad"` (`data-testid="communities-empty-state"`), y un botón o enlace CTA `"Crear comunidad"` (`data-testid="btn-create-community"`).
   - El CTA navega a la página de creación de comunidad (ruta existente en el proyecto).

3. **[AC-3]** Dado que el usuario autenticado pertenece a 2 o más comunidades, cuando accede a `/communities`, entonces:
   - Se muestra la lista de comunidades actual (comportamiento existente sin cambios).
   - No se altera ninguna lógica de la lista actual.

4. **[AC-4]** Dado que ejecuto la suite de tests, cuando todos pasan, entonces lint/tsc/tests son verdes (≥384 tests pasando, en paralelo o posterior a Stories 9.8 y 9.9).

## Tasks / Subtasks

- [ ] **T1** — Modificar `app/(app)/communities/page.tsx`
  - [ ] T1.1 Obtener las comunidades del usuario autenticado (query existente o nueva según el código actual)
  - [ ] T1.2 Añadir rama: si `communities.length === 1` → `redirect('/communities/' + communities[0].slug)`
  - [ ] T1.3 Añadir rama: si `communities.length === 0` → renderizar estado vacío (ver T2)
  - [ ] T1.4 Mantener el render de lista para `communities.length >= 2` sin cambios

- [ ] **T2** — Crear componente `components/communities/CommunitiesEmptyState.tsx`
  - [ ] T2.1 Contenedor centrado con padding generoso
  - [ ] T2.2 Icono o ilustración (puede usar un emoji o SVG simple — sin dependencia de librería de ilustraciones)
  - [ ] T2.3 Texto `"Aún no perteneces a ninguna comunidad"` (`data-testid="communities-empty-state"`)
  - [ ] T2.4 Botón/enlace `"Crear comunidad"` (`data-testid="btn-create-community"`) apuntando a la ruta de creación del proyecto

- [ ] **T3** — Tests
  - [ ] T3.1 `tests/unit/communities/CommunitiesPage.test.tsx` — mock de query, verificar: redirect cuando 1 comunidad, empty state cuando 0, lista cuando ≥2
  - [ ] T3.2 `tests/unit/communities/CommunitiesEmptyState.test.tsx` — render básico, texto correcto, CTA visible

- [ ] **T4** — Verificación final
  - [ ] T4.1 `npm run lint` — verde
  - [ ] T4.2 `npx tsc --noEmit` — verde
  - [ ] T4.3 `npx vitest run tests/unit/` — verde (≥384 tests)

## Dev Notes

### Arquitectura actual relevante

```
app/(app)/communities/page.tsx  (Server Component async)
  └── Actualmente: lista todas las comunidades del usuario
      Probablemente: supabase query a community_members JOIN communities

lib/repositories/communities.repository.ts  (si existe)
  └── findByMember(userId) o similar
```

Antes de implementar, leer el fichero actual `app/(app)/communities/page.tsx` para entender la query existente y no duplicar lógica.

### Implementación del redirect en Next.js App Router

```typescript
// app/(app)/communities/page.tsx
import { redirect } from 'next/navigation'

export default async function CommunitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('community_members')
    .select('communities(id, slug, name)')
    .eq('user_id', user.id)

  const communities = (memberships ?? [])
    .map((m) => m.communities)
    .filter(Boolean)

  // Redirect condicional
  if (communities.length === 1) {
    redirect(`/communities/${communities[0]!.slug}`)
  }

  if (communities.length === 0) {
    return <CommunitiesEmptyState />
  }

  // Lista existente para ≥2 comunidades
  return <CommunitiesList communities={communities} />
}
```

> Adaptar nombres de tabla/columnas y estructura del select al esquema real del proyecto. Leer el fichero actual antes de implementar.

### Ruta de creación de comunidad

Localizar la ruta actual de creación de comunidad en el proyecto (probablemente `/communities/new` o similar) para que el CTA del estado vacío apunte a la URL correcta. Usar `grep -r "create.*community\|nueva.*comunidad\|communities/new" app/` para encontrarla si no es obvia.

### Design tokens en uso

- `var(--color-text-primary)` — texto principal del empty state
- `var(--color-text-muted)` — texto descriptivo secundario
- `var(--color-accent)` — botón CTA naranja
- `var(--space-4)`, `var(--space-6)`, `var(--space-8)` — padding y gap del empty state
- `var(--text-lg)`, `var(--text-sm)` — tamaños de texto del empty state
- `var(--radius-md)` — border-radius del botón CTA

### Dependencias

- **No depende de Stories 9.8 ni 9.9** — lógica de routing completamente independiente.
- **No requiere cambios de DB** — la query a `community_members` ya existe en el proyecto.

### Git context

```
19ac310 feat(project-detail): tagline, sidebar universal y feedback inline — Story 9.7 (#59)
d7e473d feat(feed): secciones Live/Cerrados, ProjectCard horizontal y fix bug autor — Story 9.6 (#58)
```

### Rama sugerida

`feat/9-10-communities-redirect-condicional`

### Flow

Quick Flow (Bart) — complejidad baja: lógica condicional en un Server Component existente + componente de estado vacío. Sin cambios de DB.

## Dev Agent Record

_A rellenar por Bart al implementar._

### Agent Model Used

claude-sonnet-4-6 (Bart — Quick Flow)

### File List

- `components/communities/EmptyCommunitiesState.tsx` — añadidos data-testid, texto corregido
- `tests/unit/communities/CommunitiesEmptyState.test.tsx` — nuevo (5 tests)
- `tests/unit/communities/CommunitiesPage.test.tsx` — nuevo (9 tests)

### Implementation Notes

La lógica de redirect condicional (AC-1: 1 comunidad → redirect, AC-3: ≥2 → lista) ya estaba
implementada en `app/(app)/communities/page.tsx` usando `getUserCommunities`. AC-2 requería
añadir `data-testid="communities-empty-state"` y `data-testid="btn-create-community"` al
componente existente `EmptyCommunitiesState`, más corregir el texto a "Aún no perteneces
a ninguna comunidad". Tests TDD Outside-In con mocks de getUserCommunities y next/navigation.

### Completion Notes

- 397 tests pasando (14 nuevos)
- lint verde, build verde
- PR #60: https://github.com/TaleorSwift/proof-day/pull/60
