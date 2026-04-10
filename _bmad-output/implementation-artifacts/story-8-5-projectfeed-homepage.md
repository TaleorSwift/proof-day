# Story 8.5: ProjectFeed + Rediseño Homepage de Comunidad

Status: ready-for-dev

## Story

Como miembro de una comunidad,
quiero ver los proyectos organizados en secciones "En validación" y "Cerrados",
para distinguir de un vistazo qué proyectos están activos y cuáles han concluido.

---

## Acceptance Criteria

### AC1 — Sección "En validación" (proyectos live)

**WHEN** la homepage de comunidad carga con proyectos de estado `live`
**THEN** estos se muestran bajo el heading "Ideas en validación"
**AND** el heading tiene un subtítulo descriptivo
**AND** los proyectos aparecen en lista vertical usando `ProjectCard`

### AC2 — Sección "Cerrados" (proyectos inactive)

**WHEN** existen proyectos con estado `inactive`
**THEN** se muestran en una sección separada bajo el heading "Cerrados"
**AND** la sección "En validación" aparece siempre arriba
**AND** la sección "Cerrados" aparece debajo

### AC3 — Proyectos draft no visibles en el feed

**WHEN** existen proyectos con estado `draft`
**THEN** NO se muestran en ninguna sección del feed
**AND** solo el builder puede verlos (RLS ya garantiza esto en la query existente — no requiere filtro adicional en el componente)

### AC4 — Estado vacío por sección

**WHEN** no hay proyectos `live`
**THEN** la sección "En validación" no se renderiza (sección entera oculta)
**WHEN** no hay proyectos `inactive`
**THEN** la sección "Cerrados" no se renderiza

### AC5 — Estado vacío global

**WHEN** no hay ningún proyecto en la comunidad (ni live ni inactive)
**THEN** se muestra `ProjectsEmptyState` (componente existente)

### AC6 — Botón "Nuevo proyecto" eliminado del feed

**WHEN** el usuario navega a la homepage de comunidad
**THEN** el botón "Nuevo proyecto" ya no aparece en la columna de proyectos
**AND** el acceso para crear un proyecto queda reservado a otro punto de entrada (fuera del scope de esta story)

### AC7 — Componente `ProjectFeed` documentado en Storybook

**WHEN** el componente `ProjectFeed` existe
**THEN** existe una Storybook story en `stories/projects/ProjectFeed.stories.tsx`
**AND** cubre los escenarios: solo live, solo cerrados, mixto, vacío global

### AC8 — `ProjectGrid` reemplazado en la homepage

**WHEN** la homepage de comunidad carga
**THEN** usa `ProjectFeed` en lugar de `ProjectGrid`
**AND** `ProjectGrid` puede mantenerse en el codebase (no se elimina — sigue siendo usado si se referencia en otro sitio)

---

## Tasks / Subtasks

### Tarea 1 — Test E2E (Playwright, `test.skip`) (AC: 1, 2, 4, 5, 6)

- [ ] Crear `tests/e2e/community-projectfeed.spec.ts`
  - [ ] `test.skip` — "muestra sección En validación con proyectos live"
  - [ ] `test.skip` — "muestra sección Cerrados con proyectos inactive"
  - [ ] `test.skip` — "oculta sección si no hay proyectos live"
  - [ ] `test.skip` — "oculta sección si no hay proyectos inactive"
  - [ ] `test.skip` — "muestra estado vacío global cuando no hay proyectos"
  - [ ] `test.skip` — "no muestra el botón Nuevo proyecto en el feed"

### Tarea 2 — Tests unitarios de `ProjectFeed` (AC: 1, 2, 3, 4, 5, 6)

- [ ] Crear `tests/unit/projects/ProjectFeed.test.tsx`
  - [ ] Setup: `// @vitest-environment jsdom`, imports de vitest + testing-library + jest-dom
  - [ ] Mock de `ProjectCard` como componente stub con `data-testid="project-card"`
  - [ ] Test: renderiza heading "Ideas en validación" cuando hay proyectos live
  - [ ] Test: renderiza heading "Cerrados" cuando hay proyectos inactive
  - [ ] Test: no renderiza sección "En validación" cuando `liveProjects` es vacío
  - [ ] Test: no renderiza sección "Cerrados" cuando `closedProjects` es vacío
  - [ ] Test: renderiza `ProjectsEmptyState` cuando no hay ni live ni inactive
  - [ ] Test: no renderiza proyectos draft (filtra status !== live y !== inactive)
  - [ ] Test: proyectos live aparecen antes que los closed en el DOM
  - [ ] Test: muestra subtítulo bajo el heading "Ideas en validación"

### Tarea 3 — Implementación de `ProjectFeed` (AC: 1, 2, 3, 4, 5, 6, 8)

- [ ] Crear `components/projects/ProjectFeed.tsx`
  - [ ] Interfaz `ProjectFeedProps`: `projects: ProjectListItem[], communitySlug: string`
  - [ ] Filtrar internamente: `liveProjects` = status `live`, `closedProjects` = status `inactive`
  - [ ] Si ambas listas vacías → devolver `<ProjectsEmptyState communitySlug={communitySlug} canCreate={false} />`
  - [ ] Sección "En validación": heading + subtítulo + lista de `ProjectCard` (solo si hay live)
  - [ ] Sección "Cerrados": heading + lista de `ProjectCard` (solo si hay inactive)
  - [ ] NO incluir botón "Nuevo proyecto"
  - [ ] Usar SOLO design tokens CSS: `var(--color-*)`, `var(--space-*)`, `var(--text-*)`, `var(--font-*)`, `var(--radius-*)`
  - [ ] No usar `'use client'` — `ProjectFeed` es Server Component (no usa hooks propios)
  - [ ] Verificar: `ProjectCard` ya es `'use client'` — puede renderizarse dentro de un Server Component

### Tarea 4 — Storybook story de `ProjectFeed` (AC: 7)

- [ ] Crear `stories/projects/ProjectFeed.stories.tsx`
  - [ ] Meta: `title: 'Projects/ProjectFeed'`, `component: ProjectFeed`, `tags: ['autodocs']`
  - [ ] Story `SoloEnValidacion`: solo proyectos live
  - [ ] Story `SoloCerrados`: solo proyectos inactive
  - [ ] Story `Mixto`: proyectos live + inactive mezclados en el array de entrada
  - [ ] Story `VacioGlobal`: array vacío → muestra empty state
  - [ ] Usar `communitySlug: 'startup-madrid'` como valor fijo en todas las stories

### Tarea 5 — Actualizar homepage de comunidad (AC: 6, 8)

- [ ] Editar `app/(app)/communities/[slug]/page.tsx`
  - [ ] Añadir import `ProjectFeed` desde `@/components/projects/ProjectFeed`
  - [ ] Eliminar import `ProjectGrid`
  - [ ] Eliminar el bloque `<div>` con heading "Proyectos" + botón "Nuevo proyecto" + `<ProjectGrid />`
  - [ ] Reemplazar por `<ProjectFeed projects={projects} communitySlug={slug} />`
  - [ ] Añadir heading "Ideas en validación" y subtítulo en la página, o delegar al componente (preferir que el componente lo gestione internamente)
  - [ ] Mantener la query de Supabase existente sin cambios (ya filtra por `community_id`)

### Tarea 6 — Validación final

- [ ] Ejecutar `npm run test` — todos los unit tests deben pasar
- [ ] Ejecutar `npm run build` — sin errores de compilación TypeScript
- [ ] Arrancar Storybook y verificar los 4 stories de `ProjectFeed`
- [ ] Verificar en browser que la homepage muestra secciones correctas
- [ ] Confirmar que el botón "Nuevo proyecto" ya no aparece en la columna de feed

---

## Dev Notes

### Contexto de stories anteriores del Epic 8

- **8.1** (done): Migración DB — añadidos campos `target_user`, `demo_url`, `feedback_topics` a `projects`. No afecta a esta story directamente.
- **8.2** (done): Componentes atómicos base — `UserAvatar`, `HeartButton`, `StatusBadge`, `ContentTag`, `SignalIndicator`, `ProgressBar`, `ContributorBadge`, `BackButton` en Storybook. Ya disponibles para uso.
- **8.3** (done): Navbar reutilizable en Storybook.
- **8.4** (done/PR mergeado): `ProjectCard` rediseñado — layout horizontal con thumbnail 120×90, título+StatusBadge, descripción (problem), UserAvatar + feedbackCount, HeartButton. Es el componente que `ProjectFeed` debe usar.

### Relación con `ProjectCard` (Story 8.4)

`ProjectCard` está en `components/projects/ProjectCard.tsx` y es `'use client'` (usa `useState` para el like). `ProjectFeed` puede ser Server Component puro — no necesita `'use client'`. React permite anidar Client Components dentro de Server Components sin problemas.

Props de `ProjectCard` que `ProjectFeed` debe pasar:

```ts
// Mínimo requerido (feedbackCount e initialLikeCount son opcionales con default 0)
{
  project: ProjectListItem,  // directamente el item del array
  communitySlug: string,
}
```

### `ProjectListItem` — tipo existente

```ts
// lib/api/projects.ts — línea 122
export interface ProjectListItem {
  id: string
  title: string
  imageUrls: string[]
  status: 'draft' | 'live' | 'inactive'
  builderId: string
  createdAt: string
  problem?: string
  // TODO(story-8.4): builderName pendiente cuando se haga JOIN a profiles
}
```

`ProjectCard.project` acepta un tipo compatible (tiene `id`, `title`, `imageUrls`, `status`, `builderId`, `problem?`, `builderName?`). `ProjectListItem` es compatible — no hace falta transformación.

### `ProjectsEmptyState` — reutilizar para estado vacío global

```ts
// components/projects/ProjectsEmptyState.tsx
// Props: { communitySlug: string, canCreate?: boolean }
// canCreate=false → no muestra botón "Crear el primero" (correcto para esta story)
```

### Query en la homepage — NO modificar

La query de Supabase en `app/(app)/communities/[slug]/page.tsx` ya devuelve todos los proyectos visibles (RLS filtra: `live` e `inactive` para todos los miembros; `draft` solo al builder propio). `ProjectFeed` recibe el array completo y filtra por status internamente.

### Arquitectura del componente `ProjectFeed`

```
ProjectFeed (Server Component)
  ├── [si liveProjects.length > 0]
  │     Sección "En validación"
  │     ├── <h2> "Ideas en validación"
  │     ├── <p> subtítulo
  │     └── ProjectCard × N (Client Component — no rompe RSC)
  ├── [si closedProjects.length > 0]
  │     Sección "Cerrados"
  │     ├── <h2> "Cerrados"
  │     └── ProjectCard × N
  └── [si ambas vacías]
        ProjectsEmptyState
```

### Design tokens a usar

Todos los estilos deben usar CSS custom properties. Referencia de tokens relevantes para este componente:

```css
/* Headings de sección */
font-size: var(--text-xl);       /* 20px — heading de sección */
font-weight: var(--font-semibold); /* 600 */
color: var(--color-text-primary);  /* #1A1A18 */

/* Subtítulo */
font-size: var(--text-sm);        /* 14px */
color: var(--color-text-secondary); /* #6B6B63 */

/* Espaciado entre secciones */
gap: var(--space-8);  /* 32px entre sección live y closed */

/* Espaciado entre cards */
gap: var(--space-3);  /* 12px — mismo que ProjectGrid actual */
```

No usar valores hardcoded. No usar clases Tailwind que no estén en la extensión de `tailwind.config.ts`. Si se usan clases Tailwind, que sean de las extendidas con tokens.

### Patrón de tests unitarios del proyecto

Archivo de referencia: `tests/unit/auth/confirmButtonComponent.test.tsx`

```ts
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
```

Para tests de `ProjectFeed` que contiene `ProjectCard` (Client Component con `useState`):

```ts
// Mock de ProjectCard para aislar el test de ProjectFeed
vi.mock('@/components/projects/ProjectCard', () => ({
  ProjectCard: ({ project }: { project: { id: string; title: string } }) => (
    <div data-testid="project-card">{project.title}</div>
  ),
}))

// Mock de ProjectsEmptyState
vi.mock('@/components/projects/ProjectsEmptyState', () => ({
  ProjectsEmptyState: () => <div data-testid="empty-state" />,
}))
```

### Storybook — patrón de stories existente

Referencia: `stories/projects/ProjectCard.stories.tsx` y `stories/projects/StatusBadge.stories.tsx`.

```ts
import type { Meta, StoryObj } from '@storybook/react'
import { ProjectFeed } from '@/components/projects/ProjectFeed'

const meta: Meta<typeof ProjectFeed> = {
  title: 'Projects/ProjectFeed',
  component: ProjectFeed,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof ProjectFeed>
```

### Project Structure Notes

- Componente nuevo: `components/projects/ProjectFeed.tsx`
- Story nueva: `stories/projects/ProjectFeed.stories.tsx`
- Tests E2E: `tests/e2e/community-projectfeed.spec.ts` (con `test.skip`)
- Tests unitarios: `tests/unit/projects/ProjectFeed.test.tsx`
- Archivo modificado: `app/(app)/communities/[slug]/page.tsx`
- `ProjectGrid.tsx` y `ProjectsEmptyState.tsx` — NO eliminar, solo se deja de usar `ProjectGrid` en la homepage

### Posibles regresiones a verificar

1. `ProjectGrid` sigue importándose en algún otro lugar — verificar antes de quitar el import de la homepage. Comando: `grep -r "ProjectGrid" components/ app/` para confirmar que no hay otros usos.
2. El layout de 2 columnas (proyectos + sidebar gamificación) en `communities/[slug]/page.tsx` — NO modificar el grid externo, solo el contenido de la columna principal.
3. `canCreate` en `ProjectsEmptyState` debe ser `false` (no hay botón de crear en el feed).

### Referencias

- [Source: components/projects/ProjectCard.tsx] — interfaz `ProjectCardProps` y props disponibles
- [Source: components/projects/ProjectGrid.tsx] — componente a reemplazar, patrón de lista vertical con `gap: var(--space-3)`
- [Source: components/projects/ProjectsEmptyState.tsx] — reutilizar para estado vacío global
- [Source: lib/api/projects.ts#ProjectListItem] — tipo de dato de entrada (línea 122)
- [Source: app/(app)/communities/[slug]/page.tsx] — página a modificar, query existente, layout grid 2 columnas
- [Source: docs/project/design-tokens.md] — todos los tokens CSS disponibles
- [Source: stories/projects/ProjectCard.stories.tsx] — patrón de stories a seguir
- [Source: tests/unit/auth/confirmButtonComponent.test.tsx] — patrón de unit tests a seguir

---

## Definición de Done

- [ ] `components/projects/ProjectFeed.tsx` creado y tipado correctamente
- [ ] `stories/projects/ProjectFeed.stories.tsx` con 4 stories (SoloEnValidacion, SoloCerrados, Mixto, VacioGlobal)
- [ ] `tests/e2e/community-projectfeed.spec.ts` creado con 6 tests en `test.skip`
- [ ] `tests/unit/projects/ProjectFeed.test.tsx` con todos los tests pasando en verde
- [ ] `app/(app)/communities/[slug]/page.tsx` actualizado: usa `ProjectFeed`, elimina `ProjectGrid` y el botón "Nuevo proyecto" del feed
- [ ] `npm run build` pasa sin errores TypeScript
- [ ] `npm run test` pasa sin regresiones
- [ ] Storybook arranca y muestra los 4 stories de `ProjectFeed` correctamente
- [ ] Sin valores hardcoded — todos los estilos usan `var(--color-*)`, `var(--space-*)`, etc.
- [ ] `ProjectFeed` NO tiene `'use client'` (es Server Component)

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

_Pendiente de completar por el dev agent._

### Completion Notes List

_Pendiente de completar por el dev agent._

### File List

- `components/projects/ProjectFeed.tsx` — CREAR
- `stories/projects/ProjectFeed.stories.tsx` — CREAR
- `tests/e2e/community-projectfeed.spec.ts` — CREAR
- `tests/unit/projects/ProjectFeed.test.tsx` — CREAR
- `app/(app)/communities/[slug]/page.tsx` — MODIFICAR
