# Story 9.6: Feed — secciones Live/Cerrados, ProjectCard horizontal y fix bugs autor

Status: review

## Story

Como Reviewer,
quiero ver el feed agrupado en secciones Live/Cerradas con tarjetas horizontales que muestren el nombre real del autor y el contador "lo usarían",
para decidir rápidamente qué idea revisar y confiar en la información mostrada.

## Acceptance Criteria

1. **[AC-1]** Dado que hay proyectos `live` e `inactive` en la comunidad, cuando se renderiza el feed, entonces:
   - Primero aparece la sección con heading `"🔴 Live — aceptando feedback"` (uppercase, font-semibold, text-xs, color-text-muted)
   - Después aparece la sección con heading `"Cerrados"` (uppercase, font-semibold, text-xs, color-text-muted)
   - Los proyectos `draft` solo son visibles para su builder (responsabilidad del RLS, no del frontend)

2. **[AC-2]** Dado que se renderiza una ProjectCard con `image_urls` no vacíos, cuando el componente monta, entonces:
   - A la izquierda: thumbnail 120×90px con border-radius
   - En el centro (columna flex): título + StatusBadge (fila), tagline (`project.tagline` si existe, si no `project.problem` truncado a 1 línea; si ninguno, omitir), nombre del autor (`builderName` o fallback a primeros 8 chars de `builderId`), `"N feedbacks · N lo usarían"` (text-xs, muted)
   - A la derecha: HeartButton (toggle visual)

3. **[AC-3]** Dado que el proyecto no tiene imágenes (`imageUrls` vacío), cuando se renderiza la tarjeta, entonces el thumbnail muestra un placeholder con gradiente (sin iniciales).

4. **[AC-4]** Dado que el builder de un proyecto tiene nombre en `profiles.name`, cuando se renderiza su tarjeta en el feed, entonces el nombre del autor muestra `profiles.name` real (no el UUID).

5. **[AC-5]** Dado que hay feedbacks en la comunidad, cuando se renderiza el widget `Top Contribuidores`, entonces cada revisor muestra su `profiles.name` real (no el fallback `"Usuario"`).

6. **[AC-6]** Dado que ejecuto `npm run storybook`, cuando navego a `Projects/ProjectCard`, entonces encuentro stories para: `ConImagenYTagline`, `SinImagen`, `SinTagline` (además de las existentes).

7. **[AC-7]** Dado que ejecuto la suite de tests, cuando todos pasan, entonces lint/tsc/tests son verdes (≥357 tests pasando).

## Tasks / Subtasks

- [x] **T1** — Extender `ProjectListItem` en `lib/api/projects.ts`
  - [x] T1.1 Añadir `tagline?: string | null`
  - [x] T1.2 Añadir `wouldUseCount?: number`
  - [x] T1.3 Eliminar el comentario TODO del campo `builderName` (ya se implementa en esta story)

- [x] **T2** — Actualizar query y mapping en `app/(app)/communities/[slug]/page.tsx`
  - [x] T2.1 Añadir `tagline, would_use_count` al select de projects
  - [x] T2.2 Tras obtener `projectRows`, hacer batch-fetch de profiles (ver Dev Notes)
  - [x] T2.3 Añadir `tagline`, `wouldUseCount`, `builderName` al mapping `ProjectListItem`

- [x] **T3** — Modificar `components/projects/ProjectCard.tsx`
  - [x] T3.1 Añadir `tagline?: string | null` y `wouldUseCount?: number` a la interface del prop `project`
  - [x] T3.2 Reemplazar bloque `problem` por `tagline ?? problem` con `WebkitLineClamp: 1`
  - [x] T3.3 Reemplazar `<UserAvatar>` por `<span data-testid="project-card-author-name">` con el nombre
  - [x] T3.4 Añadir `<span data-testid="project-card-would-use-count">N lo usarían</span>` junto al feedback count
  - [x] T3.5 Reemplazar placeholder de iniciales por placeholder con gradiente (sin texto)

- [x] **T4** — Modificar `components/projects/ProjectFeed.tsx`
  - [x] T4.1 Cambiar heading Live: `"🔴 Live — aceptando feedback"` (uppercase, text-xs, muted, semibold)
  - [x] T4.2 Cambiar heading Cerrados al mismo estilo (uppercase, text-xs, muted, semibold)
  - [x] T4.3 Eliminar el subtítulo con `data-testid="live-section-subtitle"` (inconsistente con nuevo estilo)

- [x] **T5** — Fix bug TopContributors
  - [x] T5.1 Modificar `getAllFeedbacksByCommunity` en `lib/repositories/gamification.repository.ts` para join profiles
  - [x] T5.2 Refactorizar `components/gamification/TopContributors.tsx` para usar el nombre del join (eliminar N+1)

- [x] **T6** — Storybook `stories/projects/ProjectCard.stories.tsx`
  - [x] T6.1 Añadir story `ConImagenYTagline` — con tagline + wouldUseCount
  - [x] T6.2 Añadir story `SinTaglineConProblem` — sin tagline, con problem (fallback)
  - [x] T6.3 Actualizar stories existentes para incluir `wouldUseCount`

- [x] **T7** — Tests
  - [x] T7.1 `tests/unit/projects/projectCard.test.ts` — añadir tests de tagline, wouldUseCount, gradient placeholder, author name plain text
  - [x] T7.2 `tests/unit/projects/ProjectFeed.test.tsx` — actualizar assertions de headings ("Ideas en validación" → "🔴 Live — aceptando feedback"), eliminar test `live-section-subtitle`

- [x] **T8** — Documentación `docs/project/modules/projects.md`
  - [x] T8.1 Actualizar reglas de ProjectCard (tagline, wouldUseCount, gradient placeholder)
  - [x] T8.2 Actualizar reglas de ProjectFeed (headings)

- [x] **T9** — Verificación final
  - [x] T9.1 `npm run lint` — verde
  - [x] T9.2 `npx tsc --noEmit` — verde
  - [x] T9.3 `npx vitest run tests/unit/` — verde (365 tests, ≥357 ✓)

## Dev Notes

### Arquitectura actual relevante

```
app/(app)/communities/[slug]/page.tsx  (Server Component async)
  ├── query: supabase.from('projects').select('id, title, image_urls, status, builder_id, created_at, problem')
  ├── mapea a ProjectListItem (lib/api/projects.ts)
  └── pasa a <ProjectFeed projects={projects} communitySlug={slug} />

ProjectFeed.tsx  (Server Component puro)
  ├── filtra: liveProjects / closedProjects
  └── renderiza <ProjectCard> por cada proyecto

ProjectCard.tsx  ('use client')
  ├── props: project{ id, title, imageUrls, status, builderId, problem?, builderName? }
  ├── placeholder: iniciales (getProjectInitials) → CAMBIAR a gradiente
  ├── descripción: project.problem (2 líneas) → CAMBIAR a tagline??problem (1 línea)
  ├── autor: <UserAvatar name={builderLabel} size="sm" /> → CAMBIAR a <span>
  └── contadores: feedbackCount → AÑADIR wouldUseCount

TopContributors.tsx  (Server Component async)
  ├── getAllFeedbacksByCommunity → reviewer_id + created_at (SIN profiles)
  ├── calculateTopContributors (agrupa por reviewer_id)
  └── N+1: profilesRepo.findByIdForWidget(userId) × top5  → ELIMINAR, usar JOIN
```

---

### T2 — Batch fetch de profiles para builder names

`projects.builder_id` referencia `auth.users(id)`, NO `profiles(id)` directamente. No hay FK
PostgREST entre `projects` y `profiles`. Por tanto, **no se puede hacer JOIN** en la query
de projects. Se usa batch-fetch en paralelo:

```typescript
// app/(app)/communities/[slug]/page.tsx — después de obtener projectRows

const builderIds = [...new Set((projectRows ?? []).map((r) => r.builder_id as string))]

const { data: builderProfiles } =
  builderIds.length > 0
    ? await supabase.from('profiles').select('id, name').in('id', builderIds)
    : { data: [] }

const profileMap = Object.fromEntries(
  (builderProfiles ?? []).map((p: { id: string; name: string | null }) => [p.id, p.name ?? undefined])
)

const projects: ProjectListItem[] = (projectRows ?? []).map((r: Record<string, unknown>) => ({
  id: r.id as string,
  title: r.title as string,
  imageUrls: r.image_urls as string[],
  status: r.status as 'draft' | 'live' | 'inactive',
  builderId: r.builder_id as string,
  createdAt: r.created_at as string,
  ...(r.problem != null && { problem: r.problem as string }),
  tagline: (r.tagline as string | null) ?? null,
  wouldUseCount: (r.would_use_count as number) ?? 0,
  builderName: profileMap[r.builder_id as string],
}))
```

> **Nota de performance**: Un `IN` con ≤N IDs únicos es 1 query vs N queries N+1.
> Aceptable para volúmenes early adopters.

---

### T3 — ProjectCard: cambios exactos

**Interface** (añadir a `project` prop):
```typescript
tagline?: string | null
wouldUseCount?: number
```

**Tagline display** (reemplazar bloque `project.problem && ...`):
```tsx
{(project.tagline || project.problem) && (
  <p
    data-testid="project-card-tagline"
    style={{
      fontSize: 'var(--text-xs)',
      color: 'var(--color-text-muted)',
      margin: 0,
      display: '-webkit-box',
      WebkitLineClamp: 1,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    }}
  >
    {project.tagline ?? project.problem}
  </p>
)}
```

**Author name** (reemplazar `<UserAvatar name={builderLabel} size="sm" />`):
```tsx
<span
  data-testid="project-card-author-name"
  style={{
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-secondary)',
    fontWeight: 'var(--font-medium)',
  }}
>
  {project.builderName ?? project.builderId.slice(0, 8)}
</span>
```

> Eliminar el import de `UserAvatar` si ya no se usa en este fichero.

**Would-use count** (junto al feedback count, en la misma fila):
```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'auto' }}>
  <span data-testid="project-card-author-name" ...>{builderLabel}</span>
  <span
    data-testid="project-card-feedback-count"
    style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
  >
    {formatFeedbackCount(feedbackCount)}
  </span>
  {(project.wouldUseCount ?? 0) > 0 && (
    <span
      data-testid="project-card-would-use-count"
      style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
    >
      · {project.wouldUseCount} lo usarían
    </span>
  )}
</div>
```

> Nota: `wouldUseCount` solo se muestra si > 0 para evitar "0 lo usarían" en tarjetas nuevas.

**Gradient placeholder** (reemplazar `<div>` con iniciales):
```tsx
<div
  data-testid="project-card-placeholder"
  style={{
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(135deg, var(--color-hypothesis-bg) 0%, var(--color-hypothesis-border) 100%)',
  }}
/>
```

---

### T4 — ProjectFeed: headings exactos

```tsx
// Sección Live
<h2
  id="live-section-heading"
  style={{
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: 0,
  }}
>
  🔴 Live — aceptando feedback
</h2>

// Sección Cerrados
<h2
  id="closed-section-heading"
  style={{
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: 0,
  }}
>
  Cerrados
</h2>
```

> Eliminar la `<p data-testid="live-section-subtitle">` — queda incoherente con el nuevo
> estilo compacto de la sección.

---

### T5 — Fix TopContributors: JOIN en gamification repository

**FK disponible**: `feedbacks.reviewer_id → profiles.id` (migration 013: `feedbacks_reviewer_profiles_fkey`)

**`lib/repositories/gamification.repository.ts`** — cambiar `getAllFeedbacksByCommunity`:
```typescript
async getAllFeedbacksByCommunity(communityId: string) {
  return supabase
    .from('feedbacks')
    .select('reviewer_id, created_at, profiles!feedbacks_reviewer_profiles_fkey(name)')
    .eq('community_id', communityId)
},
```

El resultado incluirá `profiles: { name: string | null } | null` por feedback.

**`components/gamification/TopContributors.tsx`** — eliminar N+1, usar nombre del join:
```typescript
const { data: feedbacks } = await gamificationRepo.getAllFeedbacksByCommunity(communityId)

const topResults = calculateTopContributors(feedbacks ?? [], 5)

// Construir mapa reviewer_id → name desde los feedbacks con join
type FeedbackWithProfile = { reviewer_id: string; profiles: { name: string | null } | null }
const feedbackList = (feedbacks ?? []) as FeedbackWithProfile[]
const nameMap = Object.fromEntries(
  feedbackList
    .filter((f) => f.profiles?.name)
    .map((f) => [f.reviewer_id, f.profiles!.name!])
)

const contributors: TopContributor[] = topResults.map((result) => ({
  userId: result.userId,
  name: nameMap[result.userId] ?? result.userId.slice(0, 8),
  feedbackCount: result.feedbackCount,
}))

return <TopContributorsList contributors={contributors} />
```

> Eliminar imports de `createProfilesRepository` y `createProfilesRepository`.
> La función `calculateTopContributors` recibe `feedbacks: { reviewer_id: string; created_at: string }[]`.
> Verificar que el tipo aceptado es compatible con el nuevo select (puede requerir casting).

---

### T7 — Tests: impacto en suites existentes

#### `tests/unit/projects/ProjectFeed.test.tsx`

Assertions que **rompen** tras T4:

```typescript
// ANTES (rompe):
expect(screen.getByRole('heading', { name: 'Ideas en validación' })).toBeInTheDocument()
// DESPUÉS (correcto):
expect(screen.getByRole('heading', { name: '🔴 Live — aceptando feedback' })).toBeInTheDocument()

// ANTES (rompe — testid eliminado):
const subtitle = screen.getByTestId('live-section-subtitle')
// DESPUÉS: eliminar este test o reemplazar por asserción del heading
```

#### `tests/unit/projects/projectCard.test.ts`

Tests **nuevos** a añadir (TDD Outside-In — escribir antes de implementar):

```typescript
// Tagline prevalece sobre problem cuando ambos existen
it('muestra tagline cuando existe', () => {
  render(React.createElement(ProjectCard, {
    project: { ...PROJECT_MINIMAL, tagline: 'Mi tagline', problem: 'Mi problem' },
    communitySlug: 'test',
  }))
  expect(screen.getByTestId('project-card-tagline')).toHaveTextContent('Mi tagline')
})

// Fallback a problem cuando tagline es null
it('muestra problem como fallback cuando tagline es null', () => {
  render(React.createElement(ProjectCard, {
    project: { ...PROJECT_MINIMAL, tagline: null, problem: 'Mi problem' },
    communitySlug: 'test',
  }))
  expect(screen.getByTestId('project-card-tagline')).toHaveTextContent('Mi problem')
})

// wouldUseCount
it('muestra would-use-count cuando > 0', () => {
  render(React.createElement(ProjectCard, {
    project: { ...PROJECT_MINIMAL, wouldUseCount: 3 },
    communitySlug: 'test',
  }))
  expect(screen.getByTestId('project-card-would-use-count')).toHaveTextContent('3 lo usarían')
})

it('no muestra would-use-count cuando es 0', () => {
  render(React.createElement(ProjectCard, {
    project: { ...PROJECT_MINIMAL, wouldUseCount: 0 },
    communitySlug: 'test',
  }))
  expect(screen.queryByTestId('project-card-would-use-count')).not.toBeInTheDocument()
})

// Author name plain text
it('muestra builderName como texto plano', () => {
  render(React.createElement(ProjectCard, {
    project: { ...PROJECT_MINIMAL, builderName: 'Ana García' },
    communitySlug: 'test',
  }))
  expect(screen.getByTestId('project-card-author-name')).toHaveTextContent('Ana García')
})

// Gradient placeholder — no iniciales
it('placeholder sin imagen no muestra iniciales', () => {
  render(React.createElement(ProjectCard, {
    project: PROJECT_MINIMAL,  // imageUrls: []
    communitySlug: 'test',
  }))
  const placeholder = screen.getByTestId('project-card-placeholder')
  expect(placeholder).toBeInTheDocument()
  // No hay span de texto dentro del placeholder
  expect(placeholder.querySelector('span')).toBeNull()
})
```

---

### Dependencias de la story

- **Story 9.1** — `tagline` y `would_use_count` ya existen en la tabla `projects` ✓
- **Migration 013** — FK `feedbacks.reviewer_id → profiles.id` ya existe ✓
- **`lib/utils/projectCard.ts`** — `formatFeedbackCount`, `buildProjectUrl`, `getProjectInitials`, `computeLikeState` — no necesitan cambios
- **`calculateTopContributors` (`lib/utils/gamification.ts`)** — recibe `{ reviewer_id: string; created_at: string }[]`. El nuevo select añade `profiles` al objeto pero el campo extra es ignorado en la función. Verificar tipos.

### Design tokens en uso

Todos los inline styles deben usar tokens de `docs/project/design-tokens.md`:
- `var(--text-xs)`, `var(--text-sm)`, `var(--text-base)`
- `var(--color-text-primary)`, `var(--color-text-secondary)`, `var(--color-text-muted)`
- `var(--color-surface)`, `var(--color-background)`, `var(--color-border)`
- `var(--color-hypothesis-bg)`, `var(--color-hypothesis-border)` (para gradiente placeholder)
- `var(--font-semibold)`, `var(--font-medium)`
- `var(--space-2)`, `var(--space-3)`
- `var(--radius-sm)`, `var(--radius-md)`

### Git context (últimos commits)

```
cdf8e11 feat(navbar): añadir logo, nombre de usuario e icono logout — Story 9.5
875e8e1 feat(landing): welcome screen — Story 9.4
fa63715 fix(test): actualizar assertion href de /auth/login a /login en FeedbackCTA
b78520c fix(auth): reemplazar todas las rutas /auth/login por /login
f2f74fa feat(auth): login page visual redesign — Story 9.2
3bdcfb1 feat(db): tagline + would_use_count en projects — Story 9.1
```

Patrón de commits Conventional Commits: `feat(scope): descripción — Story X.Y (#PR)`

### Flow recomendado

Full Flow (Homer) por la complejidad: múltiples componentes, fix de bug con JOIN, cambio de tipos en cadena.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Homer — Full Flow)

### File List

- `lib/api/projects.ts`
- `app/(app)/communities/[slug]/page.tsx`
- `components/projects/ProjectCard.tsx`
- `components/projects/ProjectFeed.tsx`
- `lib/repositories/gamification.repository.ts`
- `components/gamification/TopContributors.tsx`
- `stories/projects/ProjectCard.stories.tsx`
- `tests/unit/projects/projectCard.test.ts`
- `tests/unit/projects/ProjectFeed.test.tsx`
- `docs/project/modules/projects.md`
- `docs/project/modules/gamification.md`
- `_bmad-output/execution-log.yaml`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Implementation Notes

**T1 — ProjectListItem:** Añadidos `tagline?: string | null` y `wouldUseCount?: number`. Eliminado comentario TODO de `builderName`.

**T2 — CommunityPage:** Extendido el select a `tagline, would_use_count`. Batch-fetch de profiles con `IN` sobre `builderIds` únicos (1 query vs N). No es posible JOIN directo porque `builder_id` referencia `auth.users`, no `profiles`.

**T3 — ProjectCard:** Eliminado `UserAvatar` y `getProjectInitials`. Placeholder cambiado a gradiente sin texto. Descripción cambiada de `problem` a `tagline ?? problem` (1 línea). Autor como `<span data-testid="project-card-author-name">`. `wouldUseCount` visible solo cuando > 0.

**T4 — ProjectFeed:** Headings actualizados a estilo compacto (text-xs, uppercase, muted). Eliminada `<p data-testid="live-section-subtitle">`.

**T5 — TopContributors:** `getAllFeedbacksByCommunity` ahora hace JOIN a profiles via FK `feedbacks_reviewer_profiles_fkey`. TopContributors.tsx eliminó N+1 y resuelve nombres desde el JOIN. Cast via `unknown` necesario por discrepancia en tipos generados por Supabase SDK (array vs objeto).

**T6 — Storybook:** Añadidas stories `ConImagenYTagline` y `SinTaglineConProblem`. Actualizadas existentes con `wouldUseCount`.

**T7 — Tests:** 10 nuevos tests en projectCard.test.ts (tagline, fallback, wouldUseCount, author name, gradient placeholder). ProjectFeed.test.tsx actualizado: heading corregido, test subtitle eliminado. Total: 365 tests (≥357 ✓).

**Lint/TSC:** Verdes. TSC requirió cast `as unknown as FeedbackWithProfile[]` por tipo generado de Supabase para JOIN (profiles como array en lugar de objeto).

### Completion Notes

Story 9.6 completa. Todos los ACs satisfechos:
- AC-1: Secciones Live/Cerrados con headings correctos
- AC-2: ProjectCard horizontal con tagline, autor real, wouldUseCount
- AC-3: Placeholder gradiente sin iniciales
- AC-4: Builder name desde profiles.name
- AC-5: TopContributors con nombre real via JOIN (sin N+1)
- AC-6: Storybook con ConImagenYTagline, SinTaglineConProblem
- AC-7: 365 tests verdes (≥357)
