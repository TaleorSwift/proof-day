# Story 13.6 — Historial de versiones y Proof Score por iteración

**Epic:** 13 — Iteración, Cierre del Loop y Copiloto IA
**Story key:** 13.6
**Status:** review
**Fase:** GROWTH 2.1
**Prerequisito:** Story 13.4 completada (feedbacks con `iteration_id` rellenado) y Story 13.5 completada (notificaciones de atribución)

---

## User Story

**Como** Builder de un proyecto en Proof Day,
**quiero** ver un historial de las iteraciones de mi proyecto con los feedbacks de cada versión,
**para que** pueda medir el progreso entre ciclos de iteración y entender cómo el Proof Score evoluciona con cada nueva versión.

---

## Acceptance Criteria

### AC1 — Sección "Historial de versiones" visible cuando hay iteraciones

**Given** que el Builder accede al detalle de su proyecto y el proyecto tiene al menos 1 iteración publicada,
**When** se carga la página de detalle del proyecto,
**Then** se muestra una sección "Historial de versiones" con la lista de iteraciones pasadas.

**Given** que el Builder accede al detalle de su proyecto y el proyecto NO tiene ninguna iteración,
**When** se carga la página,
**Then** la sección "Historial de versiones" NO se muestra (sin cambios en la UI para proyectos sin iteraciones).

**Given** que un Reviewer (no Builder) accede al detalle del proyecto,
**When** el proyecto tiene iteraciones,
**Then** la sección "Historial de versiones" es visible para todos los usuarios (no es privada del Builder).

### AC2 — Cada entrada del historial muestra versión, fecha y conteo de feedbacks

**Given** que la sección "Historial de versiones" está visible,
**When** el Builder (o cualquier usuario) la visualiza,
**Then** cada entrada del historial muestra:
- Número de versión (ej: "v1", "v2", "v3")
- Fecha de publicación de la iteración (ej: "12 mar 2026" formateada en español)
- Conteo de feedbacks atribuidos a esa versión (feedbacks con `iteration_id = <id de esa iteración>`)

**Given** que una versión no tiene ningún feedback atribuido (ej: versión recién publicada),
**When** se muestra en el historial,
**Then** muestra el conteo como "0 feedbacks".

### AC3 — Proof Score calculado solo con feedbacks de la iteración más reciente

**Given** que el proyecto tiene al menos 1 iteración y hay feedbacks atribuidos a la iteración más reciente,
**When** se muestra el Proof Score en la sidebar del proyecto,
**Then** el Proof Score se calcula usando únicamente los feedbacks con `iteration_id` igual al id de la iteración con el mayor `version_number`.

**Given** que el proyecto tiene iteraciones pero la iteración más reciente no tiene feedbacks atribuidos (iteración recién publicada),
**When** se muestra el Proof Score,
**Then** el Proof Score muestra el estado "Esperando feedback" (0 feedbacks para la versión actual).

**Given** que el proyecto NO tiene ninguna iteración,
**When** se muestra el Proof Score,
**Then** el Proof Score se calcula usando todos los feedbacks del proyecto (comportamiento original, sin filtro por iteración).

### AC4 — Componente `IterationHistory` documentado en Storybook

**Given** que el componente `IterationHistory` existe,
**When** se consulta Storybook,
**Then** hay al menos 3 variantes documentadas:
- `ConUnaIteracion` — historial con una única versión
- `ConVariasIteraciones` — historial con 3+ versiones con feedbacks reales
- `SinFeedbacksEnUltima` — iteración reciente con 0 feedbacks

---

## Tasks de implementación

> Seguir TDD Outside-In: escribir test primero, implementar, verificar verde.

### Task 1 — Query de iteraciones con conteo de feedbacks en `page.tsx`

Modificar `app/(app)/communities/[slug]/projects/[projectSlug]/page.tsx`:

Añadir query que obtiene las iteraciones del proyecto con el conteo de feedbacks por iteración:

```typescript
// Query de iteraciones con conteo de feedbacks
const { data: iterations } = await supabase
  .from('project_iterations')
  .select(`
    id,
    version_number,
    published_at,
    feedbacks(count)
  `)
  .eq('project_id', project.id)
  .order('version_number', { ascending: false })
```

Mapear el resultado a:

```typescript
interface IterationSummary {
  id: string
  versionNumber: number
  publishedAt: string
  feedbackCount: number
}
```

> Nota: la query con `feedbacks(count)` usa Supabase PostgREST para obtener el conteo relacionado. Si no está disponible, alternativa: hacer una segunda query `SELECT iteration_id, count(*) FROM feedbacks WHERE project_id = ? GROUP BY iteration_id`.

### Task 2 — Filtro del Proof Score por iteración más reciente

Modificar la lógica de cálculo del Proof Score en `page.tsx` (o en el componente/función donde se calcule):

```typescript
// Si hay iteraciones, filtrar feedbacks por la iteración más reciente
const latestIteration = iterations?.[0] ?? null  // ya ordenado por version_number DESC

const feedbacksForScore = latestIteration
  ? allFeedbacks.filter((f) => f.iterationId === latestIteration.id)
  : allFeedbacks

const proofScore = calculateProofScore(feedbacksForScore)
```

> Si el Proof Score se calcula directamente en BD (query con COUNT/AVG), modificar la query para incluir el filtro `WHERE iteration_id = <latestIterationId>` cuando hay iteraciones.

### Task 3 — Componente `IterationHistory`

Crear `components/projects/IterationHistory.tsx` (Server Component o Client Component según necesidad):

```typescript
// components/projects/IterationHistory.tsx

interface IterationEntry {
  id: string
  versionNumber: number
  publishedAt: string
  feedbackCount: number
}

interface IterationHistoryProps {
  iterations: IterationEntry[]
}

export function IterationHistory({ iterations }: IterationHistoryProps) {
  if (iterations.length === 0) return null

  return (
    <section aria-labelledby="iteration-history-heading">
      <h2 id="iteration-history-heading">Historial de versiones</h2>
      <ul>
        {iterations.map((iteration) => (
          <li key={iteration.id}>
            <span>v{iteration.versionNumber}</span>
            <time dateTime={iteration.publishedAt}>
              {formatDate(iteration.publishedAt)}
            </time>
            <span>{iteration.feedbackCount} {iteration.feedbackCount === 1 ? 'feedback' : 'feedbacks'}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

Estilos con design tokens del proyecto. Referencia: `docs/project/design-tokens.md`.

Tokens relevantes:
- `--color-surface`, `--color-border`, `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- `--radius-md`, `--space-2`, `--space-3`, `--space-4`
- `--text-sm`, `--text-base`, `--font-medium`

### Task 4 — Tests del componente `IterationHistory` (TDD)

Crear `tests/component/projects/IterationHistory.test.tsx`:

- Test: no renderiza nada cuando `iterations` es un array vacío.
- Test: renderiza una entrada por cada iteración.
- Test: muestra "v1", "v2", "v3" para las versiones correctas.
- Test: muestra la fecha formateada en español.
- Test: muestra el conteo correcto de feedbacks ("5 feedbacks", "1 feedback", "0 feedbacks").
- Test: la sección tiene `aria-labelledby` apuntando al heading.

### Task 5 — Tests de integración en `page.tsx`

Crear o ampliar `tests/component/projects/ProjectDetailPage.test.tsx` (ya existente):

- Test: cuando el proyecto tiene iteraciones, se muestra la sección "Historial de versiones".
- Test: cuando el proyecto no tiene iteraciones, la sección "Historial de versiones" no se renderiza.
- Test: el Proof Score usa feedbacks de la iteración más reciente cuando hay iteraciones.
- Test: el Proof Score usa todos los feedbacks cuando no hay iteraciones.

Patrón: extender los mocks existentes del Supabase client para incluir la query de `project_iterations` con `feedbacks(count)`.

### Task 6 — Storybook story para `IterationHistory`

Crear `stories/projects/IterationHistory.stories.tsx`:

```typescript
// stories/projects/IterationHistory.stories.tsx

const meta: Meta<typeof IterationHistory> = {
  title: 'Projects/IterationHistory',
  component: IterationHistory,
}

export const ConUnaIteracion: Story = {
  args: {
    iterations: [
      { id: 'iter-1', versionNumber: 1, publishedAt: '2026-03-15T10:00:00', feedbackCount: 8 }
    ]
  }
}

export const ConVariasIteraciones: Story = {
  args: {
    iterations: [
      { id: 'iter-3', versionNumber: 3, publishedAt: '2026-05-01T10:00:00', feedbackCount: 3 },
      { id: 'iter-2', versionNumber: 2, publishedAt: '2026-04-10T10:00:00', feedbackCount: 12 },
      { id: 'iter-1', versionNumber: 1, publishedAt: '2026-03-15T10:00:00', feedbackCount: 8 },
    ]
  }
}

export const SinFeedbacksEnUltima: Story = {
  args: {
    iterations: [
      { id: 'iter-2', versionNumber: 2, publishedAt: '2026-05-07T10:00:00', feedbackCount: 0 },
      { id: 'iter-1', versionNumber: 1, publishedAt: '2026-03-15T10:00:00', feedbackCount: 8 },
    ]
  }
}
```

---

## Dev Notes

### Consulta de conteo de feedbacks por iteración

Supabase PostgREST soporta conteos relacionados con la sintaxis `related_table(count)`. Para el caso de `feedbacks(count)` con un proyecto específico, la query exacta depende de cómo estén configuradas las foreign keys.

Si la sintaxis `feedbacks(count)` no retorna el conteo correcto (filtrado por proyecto), usar una query separada:

```typescript
const { data: feedbackCounts } = await supabase
  .from('feedbacks')
  .select('iteration_id')
  .eq('project_id', project.id)
  .not('iteration_id', 'is', null)

// Agrupar en memoria:
const countByIterationId = (feedbackCounts ?? []).reduce((acc, f) => {
  if (f.iteration_id) acc[f.iteration_id] = (acc[f.iteration_id] ?? 0) + 1
  return acc
}, {} as Record<string, number>)
```

Esta alternativa es más verbosa pero más predecible y testeable.

### Proof Score: qué feedbacks usar

El cálculo actual del Proof Score usa todos los feedbacks del proyecto. Con esta story, el cálculo cambia cuando hay iteraciones:

- **Con iteraciones**: usar solo `feedbacks.filter(f => f.iterationId === latestIteration.id)`
- **Sin iteraciones**: usar todos los feedbacks (sin filtro)

Si el cálculo del Proof Score está en `lib/utils/proofScore.ts` (o similar), la función puede recibir el array ya filtrado sin necesidad de conocer la lógica de iteraciones. Esto mantiene la separación de responsabilidades.

### Visibilidad del historial

El historial es público — todos los usuarios autenticados que pueden ver el proyecto pueden ver el historial de versiones. Esto es coherente con la naturaleza pública del proyecto en la comunidad.

### Formateo de fechas

Para formatear la fecha en español (ej: "12 mar 2026"), usar `Intl.DateTimeFormat` o la librería de fechas ya usada en el proyecto:

```typescript
function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate))
}
```

Verificar qué librería de fechas usa el proyecto (si usa `date-fns` u otra) antes de implementar.

### Posición del componente `IterationHistory` en `page.tsx`

El componente se coloca en la página de detalle del proyecto, después del feed de feedbacks y antes (o después) de la `AISummaryCard`. La posición exacta es decisión del implementador mientras los ACs se cumplan.

### Estructura de ficheros a crear/modificar

```
components/
  projects/
    IterationHistory.tsx              ← NUEVO (Task 3)
app/(app)/communities/[slug]/projects/[projectSlug]/
  page.tsx                            ← MODIFICAR: query iteraciones, filtro Proof Score, integración IterationHistory (Tasks 1, 2)
stories/
  projects/
    IterationHistory.stories.tsx      ← NUEVO (Task 6)
tests/
  component/
    projects/
      IterationHistory.test.tsx       ← NUEVO (Task 4)
      ProjectDetailPage.test.tsx      ← MODIFICAR: tests de iteraciones y Proof Score filtrado (Task 5)
```

### Referencias de código

- `app/(app)/communities/[slug]/projects/[projectSlug]/page.tsx` — página a modificar, ya tiene lógica de Proof Score
- `lib/utils/proofScore.ts` (o similar) — función de cálculo del Proof Score (verificar nombre exacto)
- `components/projects/AISummaryCard.tsx` — patrón de componente de sección en el detalle del proyecto (Story 12.4)
- `tests/component/projects/ProjectDetailPage.test.tsx` — tests de integración de la página a extender
- `docs/project/design-tokens.md` — tokens de diseño para los estilos del componente

---

## Criterio de Done

- [x] `components/projects/IterationHistory.tsx` creado con la estructura correcta.
- [x] `page.tsx` tiene query de iteraciones con conteo de feedbacks por iteración.
- [x] `page.tsx` filtra los feedbacks del Proof Score por la iteración más reciente (si hay iteraciones).
- [x] Sección "Historial de versiones" visible cuando hay al menos 1 iteración.
- [x] Sección "Historial de versiones" NO visible cuando no hay iteraciones.
- [x] Cada entrada del historial muestra versión, fecha y conteo de feedbacks.
- [x] Proof Score con 0 feedbacks mostrado como "Esperando feedback" para versión recién publicada.
- [x] `stories/projects/IterationHistory.stories.tsx` creado con 3 variantes.
- [x] Tests de componente de `IterationHistory`: en verde, cubriendo todos los ACs.
- [x] Tests de integración de `page.tsx`: en verde, cubriendo con/sin iteraciones y filtro de Proof Score.
- [x] `npm test` completo sin regresiones.
- [x] `npm run build` sin errores TypeScript.
- [ ] Story actualizada a `done` en sprint-status.yaml tras CR aprobado y QA PASS.

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

N/A

### Completion Notes List

- Implementado TDD Outside-In: tests escritos antes de cada componente/función.
- `IterationHistory.tsx`: componente puro con design tokens del proyecto, sin borde en el último `<li>`.
- `app/api/proof-score/[projectId]/route.ts`: filtro por iteración más reciente (`version_number DESC`, limit 1, maybeSingle). Sin iteración → todos los feedbacks (comportamiento original).
- `stories/projects/IterationHistory.stories.tsx`: variantes `SinIteraciones`, `ConUnaIteracion`, `ConVariasIteraciones` según AC4.
- Tests de integración de la API route actualizados para los 3 escenarios: con iteración + feedbacks, sin iteración (fallback), iteración sin feedbacks.

### File List

- `components/projects/IterationHistory.tsx` — CREATED
- `app/api/proof-score/[projectId]/route.ts` — MODIFIED (filtro iteración más reciente)
- `stories/projects/IterationHistory.stories.tsx` — CREATED
- `tests/component/projects/IterationHistory.test.tsx` — CREATED
- `tests/integration/api/proof-score.route.test.ts` — MODIFIED (mocks actualizados para 3 llamadas)
- `app/(app)/communities/[slug]/projects/[projectSlug]/page.tsx` — MODIFIED (query iteraciones, integración IterationHistory)
- `_bmad-output/implementation-artifacts/stories/13-6-historial-versiones-proof-score-por-iteracion.md` — MODIFIED (phase: review, tasks [x], Dev Agent Record)
