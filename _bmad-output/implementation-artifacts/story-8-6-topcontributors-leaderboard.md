# Story 8.6: TopContributors Leaderboard + Storybook

Status: ready-for-dev

## Story

Como miembro de una comunidad,
quiero ver el ranking de los top revisores de la comunidad,
para conocer quiénes contribuyen más con feedback de calidad.

---

## Acceptance Criteria

### AC1 — Leaderboard visible en la homepage de comunidad

**WHEN** la homepage de comunidad carga
**THEN** el sidebar derecho muestra `TopContributors` en lugar de `PersonalFeedbackCounter` y `TopReviewerWidget`
**AND** el componente lista hasta 5 revisores ordenados por número total de feedbacks dados en la comunidad (descendente)

### AC2 — Cada fila muestra: avatar + badge + conteo

**WHEN** existe al menos un revisor con feedbacks en la comunidad
**THEN** cada fila del leaderboard muestra:
- `UserAvatar` (size="sm") con el nombre del revisor
- Nombre del revisor (`profile.name`)
- `ContributorBadge` con `type="top-reviewer"` para el #1, `type="insightful"` para #2 y #3, `type="active"` para #4 y #5

**NOTA CRÍTICA:** `ContributorBadge` acepta `type: 'top-reviewer' | 'insightful' | 'changed-thinking'` — NO existe `'active'`. Ver `components/shared/ContributorBadge.tsx`. El badge para #4 y #5 debe ser `'changed-thinking'` (el único tipo disponible restante).

**AND** el número de feedbacks totales dados en la comunidad (ej: "12 feedbacks")

### AC3 — Empty state cuando no hay feedbacks

**WHEN** ningún usuario ha dado feedback en la comunidad
**THEN** se muestra un mensaje: "Aún no hay revisores en esta comunidad"
**AND** el componente no rompe ni lanza error

### AC4 — Server Component (sin 'use client')

**WHEN** se implementa `TopContributors`
**THEN** el componente NO tiene la directiva `'use client'`
**AND** los datos se obtienen en el servidor mediante una server action o query directa a Supabase
**AND** no se usa `useEffect`, `useState` ni fetch del lado del cliente

### AC5 — Datos provienen de la tabla `feedbacks`

**WHEN** el componente carga
**THEN** consulta la tabla `feedbacks` agrupando por `reviewer_id` y contando filas
**AND** filtra por `community_id` del parámetro recibido
**AND** une con `profiles` para obtener `name` de cada revisor

### AC6 — Storybook story con datos mock

**WHEN** existe el componente `TopContributors`
**THEN** existe `stories/gamification/TopContributors.stories.tsx`
**AND** cubre los escenarios: con_datos (5 revisores), un_revisor (1 revisor), sin_revisores (empty state)
**AND** usa datos mock estáticos (sin llamadas a Supabase)

### AC7 — Reemplazar widgets legacy en la homepage

**WHEN** se completa la implementación
**THEN** `app/(app)/communities/[slug]/page.tsx` importa `TopContributors` y ya no importa `PersonalFeedbackCounter` ni `TopReviewerWidget`
**AND** el sidebar renderiza `<TopContributors communityId={community.id} />`
**AND** `PersonalFeedbackCounter` y `TopReviewerWidget` se mantienen en el codebase (no se eliminan — pueden tener otros usos)

---

## Tasks / Subtasks

### Tarea 1 — Test E2E (Playwright, `test.skip`) (AC: 1, 2, 3)

- [ ] Crear `tests/e2e/community-topcontributors.spec.ts`
  - [ ] `test.skip` — "muestra el leaderboard TopContributors en el sidebar"
  - [ ] `test.skip` — "cada fila muestra avatar, nombre, badge y conteo de feedbacks"
  - [ ] `test.skip` — "muestra empty state cuando no hay revisores"

### Tarea 2 — Lógica de top contributors (AC: 4, 5)

**Patrón arquitectónico del proyecto:** Repository → Utils puros → Server Component (NO existe `lib/actions/`).

- [ ] Añadir método en `lib/repositories/gamification.repository.ts`
  - [ ] `getAllFeedbacksByCommunity(communityId: string)` — retorna `reviewer_id, created_at` de todos los feedbacks de la comunidad (sin filtro por semana, sin límite)
  - [ ] Usar `createClient()` de `@/lib/supabase/server` como ya hace el repositorio

- [ ] Añadir función pura en `lib/utils/gamification.ts`
  - [ ] `calculateTopContributors(feedbacks: FeedbackRow[], limit?: number): TopReviewerResult[]`
  - [ ] Agrupa por `reviewer_id`, cuenta feedbacks, ordena desc por count, retorna top `limit` (default: 5)
  - [ ] Mismo patron que `calculateTopReviewer` ya existente en el mismo fichero
  - [ ] Retorna `[]` si no hay feedbacks

- [ ] Tests unitarios para `calculateTopContributors` (función pura — sin mocks de Supabase)
  - [ ] `tests/unit/gamification/topContributors.test.ts` (junto a `topReviewer.test.ts` existente)
  - [ ] Test: retorna hasta 5 revisores ordenados por feedbackCount desc
  - [ ] Test: retorna array vacío si feedbacks es array vacío
  - [ ] Test: limita al `limit` especificado
  - [ ] Test: un solo revisor → array de 1 elemento

- [ ] Tipo `TopContributor` en `lib/types/gamification.ts`
  - [ ] Añadir: `export interface TopContributor { userId: string; name: string; feedbackCount: number }`
  - [ ] Mantener tipos existentes (`TopReviewer`, `FeedbackCountStats`) sin modificarlos

### Tarea 3 — Componente `TopContributors` (AC: 1, 2, 3, 4)

Arquitectura de dos capas para compatibilidad con Storybook (ver Tarea 4):

- [ ] Crear `components/gamification/TopContributorsList.tsx` (componente de presentación puro)
  - [ ] Sin `'use client'` ni hooks — componente de presentación puro compatible con RSC y Storybook
  - [ ] Props: `{ contributors: TopContributor[] }`
  - [ ] Renderiza lista de filas con `UserAvatar` (size="sm") + nombre + `ContributorBadge` + conteo
  - [ ] Badge por posición (índice del array): 0 → `'top-reviewer'`, 1-2 → `'insightful'`, 3-4 → `'changed-thinking'`
  - [ ] Empty state si array vacío: "Aún no hay revisores en esta comunidad"
  - [ ] Estilos con design tokens CSS (sin valores hardcoded)

- [ ] Crear `components/gamification/TopContributors.tsx` (Server Component — orquestador de datos)
  - [ ] Server Component — sin `'use client'`
  - [ ] Props: `{ communityId: string }`
  - [ ] Llama a `getAllFeedbacksByCommunity(communityId)` del repositorio con `createClient()`
  - [ ] Aplica `calculateTopContributors(feedbacks, 5)` para obtener los top 5
  - [ ] Hace join con `profiles` para resolver `name` de cada `userId` (usar `findByIdForWidget` del profiles repository con `Promise.all`)
  - [ ] Pasa `contributors: TopContributor[]` a `<TopContributorsList />`

- [ ] Tests unitarios de `TopContributorsList` (AC: 1, 2, 3) — componente puro, fácil de testear
  - [ ] `tests/unit/gamification/TopContributorsList.test.tsx`
  - [ ] Test: renderiza N filas con nombre, badge y conteo
  - [ ] Test: primer revisor recibe badge `top-reviewer` (texto "Top Reviewer" en DOM)
  - [ ] Test: revisores 2 y 3 reciben badge `insightful` (texto "Perspicaz" en DOM)
  - [ ] Test: revisores 4 y 5 reciben badge `changed-thinking` (texto "Cambió mi perspectiva" en DOM)
  - [ ] Test: muestra "Aún no hay revisores en esta comunidad" cuando array es vacío
  - [ ] NOTA: los textos de badge provienen de `BADGE_CONFIG` en `ContributorBadge.tsx` — usar esos textos literales en los tests

### Tarea 4 — Storybook story (AC: 6)

- [ ] Crear `stories/gamification/TopContributors.stories.tsx`
  - [ ] Importar `TopContributorsList` (componente de presentación) — NO `TopContributors` (Server Component)
  - [ ] Meta: `title: 'Gamification/TopContributors'`, `tags: ['autodocs']`, `layout: 'padded'`
  - [ ] Story `ConDatos`: array de 5 `TopContributor` mock con nombres, conteos distintos
  - [ ] Story `UnRevisor`: array de 1 `TopContributor` mock
  - [ ] Story `SinRevisores`: `contributors={[]}` — muestra empty state
  - [ ] Ver patrón en `stories/projects/ProjectFeed.stories.tsx` para estructura de fixtures y exports

### Tarea 5 — Reemplazar en la homepage (AC: 7)

- [ ] Editar `app/(app)/communities/[slug]/page.tsx`
  - [ ] Eliminar imports de `PersonalFeedbackCounter` y `TopReviewerWidget`
  - [ ] Añadir import de `TopContributors`
  - [ ] En el `<aside>`, reemplazar los dos widgets por `<TopContributors communityId={community.id} />`

---

## Dev Notes

### Arquitectura y patrones

- **Arquitectura del proyecto**: Repository → Utils puros → Server Component. NO existe `lib/actions/` en este proyecto. Los Server Components usan directamente repositorios (con `createClient()`) o servicios de `lib/services/`.
- **Server Component obligatorio**: `TopContributors` NO puede tener `'use client'`. Los datos se obtienen en el servidor instanciando el repositorio directamente.
- **Patrón de repositorio + utils puros**: El proyecto separa la lógica pura en `lib/utils/gamification.ts` (ya existe `calculateTopReviewer`). Para esta story, `calculateTopContributors` se añade al mismo fichero. El repositorio carga los datos crudos, el util los agrupa.
- **Query de Supabase**: La tabla `feedbacks` tiene `reviewer_id` y `community_id`. Supabase SDK no soporta `GROUP BY` nativo. Solución validada por el proyecto: cargar todos los `reviewer_id` de la comunidad y agrupar en TypeScript (mismo patrón que `calculateTopReviewer` en `lib/utils/gamification.ts` que ya hace esto). Para volúmenes bajos (comunidades de early adopters) es aceptable. Documentar la limitación en código.
- **Join con profiles**: `profiles.repository.ts` tiene `findByIdForWidget(id)` que retorna `{ id, name, avatar_url }`. Para los top 5 revisores, hacer 5 queries paralelas con `Promise.all([...userIds.map(id => profilesRepo.findByIdForWidget(id))])`.
- **Separación presentación/datos**: `TopContributorsList` (presentación pura) + `TopContributors` (orquestador Server Component). Permite testing de presentación sin mocks de Supabase y compatibilidad con Storybook.

### Componentes reutilizables — API exacta

**`UserAvatar`** (`components/shared/UserAvatar.tsx`):
```tsx
// Props: name: string, size?: 'sm' | 'md' | 'lg', showName?: boolean
// UserAvatar genera inicial y color automáticamente — NO acepta avatarUrl
// Para esta story: <UserAvatar name={contributor.name} size="sm" />
```

**`ContributorBadge`** (`components/shared/ContributorBadge.tsx`):
```tsx
// Props: type: 'top-reviewer' | 'insightful' | 'changed-thinking'
// ALERTA: El tipo 'active' NO existe en el código real — ignorar la descripción del plan original
// Mapeo de posición a type:
//   índice 0 → 'top-reviewer'
//   índice 1, 2 → 'insightful'
//   índice 3, 4 → 'changed-thinking'
```

### Design tokens aplicables

Usar exclusivamente CSS custom properties. Valores relevantes para el componente:
- Contenedor: `background: var(--color-hypothesis-bg)`, `border: 1px solid var(--color-hypothesis-border)`, `borderRadius: var(--radius-md)`, `padding: var(--space-4)`
- Título sección: `fontSize: var(--text-xs)`, `fontWeight: var(--font-semibold)`, `color: var(--color-text-muted)`, `textTransform: uppercase`
- Nombre revisor: `fontSize: var(--text-sm)`, `fontWeight: var(--font-medium)`, `color: var(--color-text-primary)`
- Conteo: `fontSize: var(--text-xs)`, `color: var(--color-text-secondary)`
- Spacing entre filas: `gap: var(--space-3)`

Ver `components/gamification/TopReviewerWidget.tsx` como referencia visual de estilos para el contenedor — mantener consistencia visual con el widget que reemplaza.

### Tipo de datos

```typescript
// lib/types/gamification.ts — AÑADIR (mantener tipos existentes)
export interface TopContributor {
  userId: string
  name: string        // fallback a 'Usuario' si profile.name es null
  feedbackCount: number
}

// lib/utils/gamification.ts — AÑADIR (mantener calculateTopReviewer y getWeekStart existentes)
// calculateTopContributors usa el mismo FeedbackRow ya exportado en el mismo fichero
export function calculateTopContributors(
  feedbacks: FeedbackRow[],
  limit = 5
): Array<{ userId: string; feedbackCount: number }>
```

### Estructura de ficheros a crear/modificar

```
# CREAR:
components/gamification/TopContributors.tsx         ← Server Component (orquestador)
components/gamification/TopContributorsList.tsx     ← Presentación pura (testeable + Storybook)
tests/e2e/community-topcontributors.spec.ts
tests/unit/gamification/topContributors.test.ts    ← Tests de calculateTopContributors (utils puro)
tests/unit/gamification/TopContributorsList.test.tsx
stories/gamification/TopContributors.stories.tsx   ← Importa TopContributorsList

# MODIFICAR:
lib/repositories/gamification.repository.ts        ← Añadir getAllFeedbacksByCommunity
lib/utils/gamification.ts                          ← Añadir calculateTopContributors
lib/types/gamification.ts                          ← Añadir TopContributor interface
app/(app)/communities/[slug]/page.tsx              ← Reemplazar imports y sidebar
```

### Anti-patrones a evitar

- NO añadir `'use client'` a `TopContributors.tsx` — rompe la arquitectura Server Component
- NO crear `lib/actions/` — ese directorio NO existe en este proyecto. Usar el patrón repositorio + utils.
- NO usar `useEffect` ni `useState` en `TopContributors.tsx` ni `TopContributorsList.tsx`
- NO crear un `ContributorBadge` con `type="active"` — ese tipo NO existe en el componente real
- NO eliminar `PersonalFeedbackCounter.tsx` ni `TopReviewerWidget.tsx` del codebase
- NO hardcodear colores — usar design tokens
- NO modificar ni eliminar `calculateTopReviewer` ni `getWeekStart` en `lib/utils/gamification.ts` — solo añadir `calculateTopContributors`
- NO hacer N+1 descontrolado: 5 queries de profiles con `Promise.all` es aceptable y documentado

### Storybook — Storybook importa TopContributorsList

`TopContributors` es Server Component (no compatible con Storybook browser runtime).
`TopContributorsList` es el componente de presentación puro que recibe datos como props.
La story en `stories/gamification/TopContributors.stories.tsx` importa `TopContributorsList` directamente con datos mock estáticos. Ver estructura exacta en `stories/projects/ProjectFeed.stories.tsx`.

### Referencias de código existente

- Componente a reemplazar (patrón de estilos): `components/gamification/TopReviewerWidget.tsx`
- Componente a reemplazar (simplicidad): `components/gamification/PersonalFeedbackCounter.tsx`
- Repositorio de feedbacks (query base): `lib/repositories/feedback.repository.ts` → `findWeeklyByCommunity`
- Repositorio de profiles (join): `lib/repositories/profiles.repository.ts` → `findByIdForWidget`
- Patrón de stories: `stories/projects/ProjectFeed.stories.tsx`
- Patrón de badges: `stories/shared/ContributorBadge.stories.tsx`
- Homepage que se modifica: `app/(app)/communities/[slug]/page.tsx` (líneas 5-6: imports a eliminar; líneas 105-108: aside a modificar)

### Tests — framework y convenciones

- Unit tests: Vitest + React Testing Library (ver `tests/unit/` para ejemplos)
- E2E: Playwright con `test.skip` (estructura fixture — no se ejecutan hasta activar)
- Mock de Supabase: ver patrón en tests existentes (`vi.mock`, `vi.fn`)
- Storybook: `@storybook/react`, tipo `Meta<typeof Component>` + `StoryObj<typeof Component>`

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
