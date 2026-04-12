# Story 8.9: TeamPerspectives — Feedbacks públicos + Storybook

Status: ready-for-dev

## Story

Como miembro de la comunidad,
quiero ver las perspectivas del equipo sobre un proyecto aunque no sea el owner,
para aprender de los criterios de mis compañeros y dar feedback más informado.

## Acceptance Criteria

1. Existe `components/feedback/FeedbackEntry.tsx` — componente presentacional puro, sin `'use client'`, sin fetch, sin estado interno. Acepta los datos de un feedback como props tipadas.
2. `FeedbackEntry` muestra: `UserAvatar` con el nombre del reviewer (`size="sm"`), nombre del reviewer, fecha relativa, las respuestas de texto no vacías de `text_responses` (p1–p4) con su label de pregunta, y opcionalmente un `ContributorBadge` si se le pasa `contributorType`.
3. Existe `components/feedback/TeamPerspectives.tsx` — componente presentacional puro, sin `'use client'`, sin fetch. Acepta `feedbacks: FeedbackEntryData[]` como prop.
4. `TeamPerspectives` renderiza la sección "Perspectivas del equipo" con un título y una lista de `FeedbackEntry`. Cuando `feedbacks` está vacío, muestra el texto "Aún no hay perspectivas del equipo".
5. `TeamPerspectives` es visible para TODOS los miembros autenticados de la comunidad (no solo el builder). La condición `isOwner` NO controla esta sección — se muestra a todos.
6. La query de feedbacks en `page.tsx` se ejecuta para TODOS los miembros (no solo `isOwner`). Se usa `createFeedbackRepository(supabase).findByProject(projectId)`.
7. Existe una nueva migración `supabase/migrations/012_rls_feedbacks_member_read.sql` que añade una policy SELECT en `feedbacks` para que cualquier miembro autenticado de la comunidad del proyecto pueda leer los feedbacks. La policy existente `builder_read_project_feedbacks` y `reviewer_read_own_feedbacks` NO se eliminan — se añade una tercera.
8. Todos los componentes usan exclusivamente design tokens CSS (`var(--color-*)`, `var(--space-*)`, etc.) — sin valores hardcoded.
9. Existe `stories/feedback/FeedbackEntry.stories.tsx` con al menos 3 exports: `ConTextoCompleto`, `SinBadge`, `Vacio` (reviewer sin respuestas de texto opcionales).
10. Existe `stories/feedback/TeamPerspectives.stories.tsx` con al menos 2 exports: `ConFeedbacks` y `Vacio`.
11. Existen tests unitarios en `tests/unit/feedback/FeedbackEntry.test.tsx` y `tests/unit/feedback/TeamPerspectives.test.tsx`.
12. Existe `tests/e2e/feedback/TeamPerspectives.spec.ts` con `test.skip` para el flujo E2E.

## Tasks / Subtasks

- [ ] Task 1 — Test E2E (AC: #12)
  - [ ] Crear `tests/e2e/feedback/TeamPerspectives.spec.ts` con `test.skip` describiendo el flujo: miembro no-owner visita un proyecto live con feedbacks → ve la sección "Perspectivas del equipo"

- [ ] Task 2 — Tests unitarios `FeedbackEntry` (AC: #11)
  - [ ] Crear `tests/unit/feedback/FeedbackEntry.test.tsx`
  - [ ] Test: renderiza el nombre del reviewer
  - [ ] Test: renderiza `UserAvatar` con el nombre del reviewer
  - [ ] Test: renderiza las respuestas de texto no vacías (p4 siempre presente)
  - [ ] Test: no renderiza campos de pregunta con valor vacío o undefined
  - [ ] Test: renderiza `ContributorBadge` cuando se pasa `contributorType`
  - [ ] Test: no renderiza `ContributorBadge` cuando `contributorType` es undefined

- [ ] Task 3 — Tests unitarios `TeamPerspectives` (AC: #11)
  - [ ] Crear `tests/unit/feedback/TeamPerspectives.test.tsx`
  - [ ] Test: renderiza el título "Perspectivas del equipo"
  - [ ] Test: renderiza N instancias de `FeedbackEntry` cuando feedbacks.length > 0
  - [ ] Test: renderiza mensaje vacío cuando feedbacks es array vacío

- [ ] Task 4 — Definir tipo `FeedbackEntryData` (AC: #1, #2)
  - [ ] Añadir o exportar `FeedbackEntryData` desde `lib/types/feedback.ts`:
    ```ts
    export interface FeedbackEntryData {
      id: string
      reviewerName: string
      createdAt: string
      textResponses: FeedbackTextResponses
      contributorType?: 'top-reviewer' | 'insightful' | 'changed-thinking'
    }
    ```

- [ ] Task 5 — Implementar `FeedbackEntry` (AC: #1, #2, #8)
  - [ ] Crear `components/feedback/FeedbackEntry.tsx`
  - [ ] Sin `'use client'` — RSC puro
  - [ ] Props: `{ data: FeedbackEntryData }`
  - [ ] Importar y usar `UserAvatar` de `@/components/shared/UserAvatar` con `size="sm"` y `showName={false}`
  - [ ] Importar y usar `ContributorBadge` de `@/components/shared/ContributorBadge` (renderizado condicional)
  - [ ] Importar `getRelativeTime` de `@/lib/utils/date` para la fecha
  - [ ] Renderizar respuestas de texto p1–p4 únicamente cuando el valor es truthy (misma lógica que `FeedbackList`)
  - [ ] Usar las mismas `QUESTION_LABELS` que `FeedbackList`: `p1: '¿Entiendes el problema?'`, `p2: '¿Usarías la solución?'`, `p3: '¿Es viable técnicamente?'`, `p4: '¿Qué mejorarías?'`
  - [ ] Estructura visual: `<article>` con cabecera (avatar + nombre + badge opcional + fecha) y cuerpo (respuestas de texto)
  - [ ] Solo design tokens CSS — sin valores hardcoded

- [ ] Task 6 — Implementar `TeamPerspectives` (AC: #3, #4, #5, #8)
  - [ ] Crear `components/feedback/TeamPerspectives.tsx`
  - [ ] Sin `'use client'` — RSC puro
  - [ ] Props: `{ feedbacks: FeedbackEntryData[] }`
  - [ ] Renderizar sección con `<h2>Perspectivas del equipo</h2>`
  - [ ] Cuando `feedbacks.length === 0`: renderizar `<p>Aún no hay perspectivas del equipo</p>`
  - [ ] Cuando `feedbacks.length > 0`: renderizar lista de `<FeedbackEntry>` por cada item
  - [ ] Solo design tokens CSS

- [ ] Task 7 — Nueva migración RLS (AC: #7)
  - [ ] Crear `supabase/migrations/012_rls_feedbacks_member_read.sql`
  - [ ] Añadir policy SELECT en `feedbacks` para miembros autenticados de la comunidad del proyecto:
    ```sql
    CREATE POLICY "member_read_community_feedbacks"
      ON feedbacks FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM community_members cm
          JOIN projects p ON p.community_id = cm.community_id
          WHERE p.id = feedbacks.project_id
            AND cm.user_id = auth.uid()
        )
      );
    ```
  - [ ] NO eliminar las policies existentes `builder_read_project_feedbacks` y `reviewer_read_own_feedbacks`

- [ ] Task 8 — Actualizar `page.tsx` (AC: #5, #6)
  - [ ] En `app/(app)/communities/[slug]/projects/[id]/page.tsx`, añadir import de `createFeedbackRepository`
  - [ ] Eliminar el bloque condicional `if (isOwner) { const { count } ... }` — el count pasa a calcularse desde el array de feedbacks
  - [ ] Añadir query incondicional (para todos los usuarios):
    ```ts
    const feedbackRepo = createFeedbackRepository(supabase)
    const { data: feedbacksRaw } = await feedbackRepo.findByProject(id)
    const feedbacks = feedbacksRaw ?? []
    const feedbackCount = feedbacks.length
    ```
  - [ ] Mapear `feedbacksRaw` a `FeedbackEntryData[]` para pasar a `TeamPerspectives`:
    ```ts
    const feedbackEntries: FeedbackEntryData[] = feedbacks.map((f) => ({
      id: f.id,
      reviewerName: f.profiles?.name ?? 'Usuario',
      createdAt: f.created_at,
      textResponses: f.text_responses as FeedbackTextResponses,
    }))
    ```
  - [ ] Añadir `<TeamPerspectives feedbacks={feedbackEntries} />` en la columna principal de contenido, debajo de `<ProjectDetailFeedbackTopics>` — visible para TODOS (sin condición `isOwner`)
  - [ ] El sidebar del builder (`FeedbackList`) puede quedar como está (owner-only) o eliminarse — decisión: mantenerlo para no romper funcionalidad existente. `FeedbackList` recibe `isBuilder={isOwner}` y solo renderiza para el builder (comportamiento actual preservado)
  - [ ] Actualizar import: añadir `TeamPerspectives` y `FeedbackEntryData`, `FeedbackTextResponses`

- [ ] Task 9 — Storybook stories (AC: #9, #10)
  - [ ] Crear `stories/feedback/FeedbackEntry.stories.tsx`
    - Meta: `title: 'feedback/FeedbackEntry'`, `layout: 'padded'`, `tags: ['autodocs']`
    - Export `ConTextoCompleto`: reviewer con badge `top-reviewer` y respuestas en p1, p2, p3, p4
    - Export `SinBadge`: reviewer sin badge, solo p4 con texto
    - Export `SoloObligatorio`: reviewer sin badge, solo p4 (campo obligatorio)
  - [ ] Crear `stories/feedback/TeamPerspectives.stories.tsx`
    - Meta: `title: 'feedback/TeamPerspectives'`, `layout: 'padded'`, `tags: ['autodocs']`
    - Export `ConFeedbacks`: array de 3 feedbacks con variedad de badges y textos
    - Export `Vacio`: `feedbacks={[]}`

## Dev Notes

### Arquitectura y restricciones críticas

- `FeedbackEntry` y `TeamPerspectives` son RSC puros — sin `'use client'`, sin hooks, sin fetch.
- Los datos llegan desde `page.tsx` (Server Component) como props. Mismo patrón que `ProjectDetailSections.tsx`.
- `FeedbackList` (cliente, con fetch propio) permanece intacta para el sidebar del builder. No modificar.
- El fetch de feedbacks en `page.tsx` pasa de condicional (`if isOwner`) a incondicional. Esto es correcto: la nueva RLS policy permitirá lectura a todos los miembros.

### Tipo FeedbackEntryData — mapeo desde el repositorio

El método `findByProject` del repositorio devuelve filas con join a `profiles`:
```ts
// Retorno de findByProject (row shape):
{
  id: string,
  text_responses: Json,  // castear a FeedbackTextResponses
  created_at: string,
  profiles: { id: string, name: string, avatar_url: string | null } | null
}
```
El mapeo a `FeedbackEntryData` se hace en `page.tsx` antes de pasar a `TeamPerspectives`. No pasar el objeto raw del repositorio directamente al componente.

### Lógica de renderizado de respuestas de texto

Reutilizar exactamente la lógica de `FeedbackList.tsx` (líneas 215-243): iterar `['p1', 'p2', 'p3', 'p4']`, renderizar solo si `textResponses[key]` es truthy. Las mismas `QUESTION_LABELS`. Considerar extraer `QUESTION_LABELS` a `lib/constants/feedback.ts` para no duplicar — pero solo si el refactor es trivial; si añade complejidad, duplicar con comentario.

### ContributorBadge — uso en FeedbackEntry

`ContributorBadge` acepta `type: 'top-reviewer' | 'insightful' | 'changed-thinking'`. En esta story `contributorType` es opcional en `FeedbackEntryData`. La lógica de asignación de badge (qué reviewer es top-reviewer) NO es parte de esta story — el campo se incluye en el tipo para uso futuro y para Storybook. En producción, `page.tsx` lo dejará como `undefined` en el mapeo inicial.

### UserAvatar — uso en FeedbackEntry

`UserAvatar` de `components/shared/UserAvatar.tsx` acepta `name: string`, `size?: 'sm' | 'md' | 'lg'`, `showName?: boolean`. En `FeedbackEntry` usar `size="sm"` y `showName={false}` (el nombre se renderiza aparte con su propio estilo).

### Migración RLS — numeración y convención

La última migración es `011_add_project_optional_fields.sql`. La nueva debe ser `012_rls_feedbacks_member_read.sql`. La policy usa `EXISTS` con JOIN (patrón establecido en migration 006 — más eficiente que `IN`). La policy permite lectura a cualquier miembro de la comunidad del proyecto, sin restricción de rol.

### Posición de `<TeamPerspectives>` en page.tsx

Insertar después de `<ProjectDetailFeedbackTopics feedbackTopics={project.feedback_topics} />` y antes del cierre del `<div>` de la columna principal. Fuera del bloque condicional `{isOwner && ...}`.

### Patrón de Storybook del proyecto

Ver `stories/proof-score/ValidationSignalCard.stories.tsx` como referencia exacta:
- Import: `import type { Meta, StoryObj } from '@storybook/react'`
- `const meta: Meta<typeof ComponentName> = { title: '...', component: ..., parameters: { layout: 'padded' }, tags: ['autodocs'] }`
- `export default meta` + `type Story = StoryObj<typeof meta>`
- Stories con `args` (no `render`)

### Patrón de tests unitarios del proyecto

Ver `tests/unit/proof-score/ValidationSignalCard.test.tsx` como referencia:
- Cabecera: `// @vitest-environment jsdom`
- Imports: `{ describe, it, expect } from 'vitest'`, `{ render, screen } from '@testing-library/react'`, `'@testing-library/jest-dom'`
- Fixtures tipadas como constantes en la parte superior del fichero
- `describe` por suite, `it` por caso

### Regresiones a evitar

- `FeedbackList` permanece intacta — solo el builder la ve en el sidebar. No modificar.
- `FeedbackCounter` en el sidebar sigue recibiendo `feedbackCount`. El count ahora viene de `feedbacks.length` (obtenido sin condición `isOwner`), lo que es correcto.
- El sidebar del builder (`{isOwner && <aside>...</aside>}`) permanece sin cambios en su estructura — solo cambia de dónde viene `feedbackCount`.
- No eliminar ni modificar las policies RLS existentes de feedbacks.

### Project Structure Notes

```
components/feedback/
  FeedbackEntry.tsx          ← NUEVO (RSC puro)
  TeamPerspectives.tsx       ← NUEVO (RSC puro)
  FeedbackButton.tsx         ← existente, sin cambios
  FeedbackCounter.tsx        ← existente, sin cambios
  FeedbackDialog.tsx         ← existente, sin cambios
  FeedbackList.tsx           ← existente, sin cambios
  FeedbackQuestion.tsx       ← existente, sin cambios

stories/feedback/
  FeedbackEntry.stories.tsx  ← NUEVO
  TeamPerspectives.stories.tsx ← NUEVO

tests/unit/feedback/
  FeedbackEntry.test.tsx     ← NUEVO
  TeamPerspectives.test.tsx  ← NUEVO

tests/e2e/feedback/
  TeamPerspectives.spec.ts   ← NUEVO (test.skip)

supabase/migrations/
  012_rls_feedbacks_member_read.sql ← NUEVO

lib/types/feedback.ts        ← MODIFICAR (añadir FeedbackEntryData)
app/(app)/communities/[slug]/projects/[id]/page.tsx ← MODIFICAR
```

### References

- `FeedbackList.tsx` — patrón de renderizado de respuestas de texto y `QUESTION_LABELS` [Source: components/feedback/FeedbackList.tsx#87-243]
- `UserAvatar.tsx` — API: `name`, `size`, `showName` [Source: components/shared/UserAvatar.tsx]
- `ContributorBadge.tsx` — API: `type: ContributorType` [Source: components/shared/ContributorBadge.tsx]
- `feedback.repository.ts` — `findByProject` devuelve join con `profiles` [Source: lib/repositories/feedback.repository.ts#6-16]
- `feedback.ts` (types) — `FeedbackTextResponses`, `Feedback` [Source: lib/types/feedback.ts]
- `feedback.ts` (api) — `FeedbackWithReviewer` shape [Source: lib/api/feedback.ts#4-9]
- `008_create_feedbacks.sql` — RLS existente: `builder_read_project_feedbacks`, `reviewer_read_own_feedbacks` [Source: supabase/migrations/008_create_feedbacks.sql]
- `006_rls_communities_member_access.sql` — patrón EXISTS para RLS [Source: supabase/migrations/006_rls_communities_member_access.sql]
- `ValidationSignalCard.stories.tsx` — patrón Storybook de referencia [Source: stories/proof-score/ValidationSignalCard.stories.tsx]
- `ValidationSignalCard.test.tsx` — patrón de tests unitarios de referencia [Source: tests/unit/proof-score/ValidationSignalCard.test.tsx]
- Design tokens CSS [Source: docs/project/design-tokens.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Ned — SM)

### Debug Log References

### Completion Notes List

### File List
