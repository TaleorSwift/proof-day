# Story 13.4 — Atribución de feedback en iteración

**Epic:** 13 — Iteración, Cierre del Loop y Copiloto IA
**Story key:** 13.4
**Status:** ready-for-dev
**Fase:** GROWTH 2.1
**Prerequisito:** Story 13.3 completada (`notifyPreviousReviewers` integrado en POST /api/projects/[id]/iterations)

---

## User Story

**Como** Builder de un proyecto con iteraciones publicadas en Proof Day,
**quiero** que cada feedback recibido quede vinculado automáticamente a la versión activa del proyecto,
**para que** pueda ver cuántos feedbacks ha recibido cada versión y medir el impacto de cada ciclo de iteración.

---

## Acceptance Criteria

### AC1 — Feedback asociado a la iteración vigente cuando existe

**Given** que un Reviewer envía feedback en un proyecto que tiene al menos una iteración publicada,
**When** el POST /api/feedback procesa la solicitud y crea el registro en `feedbacks`,
**Then** el campo `iteration_id` del registro se llena con el `id` de la iteración con el mayor `version_number` de ese proyecto.

**Given** que el proyecto tiene 3 iteraciones con `version_number` 1, 2 y 3,
**When** se crea un nuevo feedback para ese proyecto,
**Then** el feedback queda asociado a la iteración con `version_number = 3` (la más reciente).

### AC2 — `iteration_id` NULL cuando el proyecto no tiene iteraciones

**Given** que un Reviewer envía feedback en un proyecto que NO tiene ningún registro en `project_iterations`,
**When** el POST /api/feedback procesa la solicitud,
**Then** el campo `iteration_id` del registro creado es `NULL` (comportamiento idéntico al anterior a esta story).

**Given** que un Reviewer envía feedback en un proyecto con estado `draft` (sin iteraciones),
**When** el POST /api/feedback procesa la solicitud,
**Then** el campo `iteration_id` queda NULL sin ningún error.

### AC3 — El Builder puede ver el conteo de feedbacks por versión

**Given** que el Builder accede al detalle de su proyecto,
**When** el proyecto tiene al menos una iteración publicada,
**Then** el Builder puede ver cuántos feedbacks tiene atribuidos cada versión en la sección "Historial de versiones" (implementada en Story 13.6).

> Nota: este AC establece el requisito de datos para Story 13.6. La Story 13.4 debe exponer los datos necesarios (feedbacks con `iteration_id` rellenado) para que Story 13.6 los pueda consultar.

### AC4 — Feedbacks etiquetados por versión en el feed del proyecto

**Given** que el Builder accede al feed de feedbacks de su proyecto,
**When** hay feedbacks de múltiples versiones,
**Then** cada feedback muestra su versión de origen en la UI (ej: "v1", "v2") cuando `iteration_id` no es NULL.

**Given** que hay feedbacks sin `iteration_id` (anteriores a esta story),
**When** se muestran en el feed,
**Then** se muestran sin etiqueta de versión (sin cambios respecto al comportamiento actual).

---

## Tasks de implementación

> Seguir TDD Outside-In: escribir test primero, implementar, verificar verde.

### Task 1 — Repositorio: `getLatestIteration`

Añadir método `getLatestIteration` al repositorio existente `lib/repositories/project-iterations.repository.ts`:

```typescript
// lib/repositories/project-iterations.repository.ts

/**
 * Retorna la iteración con el mayor version_number del proyecto,
 * o null si el proyecto no tiene ninguna iteración.
 */
async getLatestIteration(projectId: string): Promise<ProjectIteration | null>
```

Implementación interna:

```typescript
const { data, error } = await supabase
  .from('project_iterations')
  .select('*')
  .eq('project_id', projectId)
  .order('version_number', { ascending: false })
  .limit(1)
  .maybeSingle()

if (error || !data) return null
return projectIterationFromRow(data)
```

### Task 2 — Tests unitarios de `getLatestIteration` (TDD)

Añadir casos al fichero existente `tests/unit/project-iterations/projectIterationsRepository.test.ts`:

- Test: `getLatestIteration` retorna `null` cuando no hay registros para el proyecto.
- Test: `getLatestIteration` retorna la iteración con el mayor `version_number` cuando hay múltiples (ej: version_number 1, 2, 3 → retorna la de version_number 3).
- Test: `getLatestIteration` retorna la única iteración cuando solo hay una.
- Test: `getLatestIteration` llama a `.order('version_number', { ascending: false })` y `.limit(1)`.

Patrón: igual que los tests existentes de `getLatestVersionNumber` en el mismo fichero (mock de `supabase.from`).

### Task 3 — API Route: atribuir `iteration_id` en POST /api/feedback

Modificar `app/api/feedback/route.ts` — handler POST:

Tras validar el body y antes de crear el feedback, obtener la iteración vigente del proyecto:

```typescript
import { createProjectIterationsRepository } from '@/lib/repositories/project-iterations.repository'

// Dentro del handler POST, tras obtener el projectId del body validado:
const iterationsRepo = createProjectIterationsRepository(supabase)
const latestIteration = await iterationsRepo.getLatestIteration(projectId)
const iterationId = latestIteration?.id ?? null

// Pasar iterationId al crear el feedback:
const result = await feedbackRepo.create({
  projectId,
  reviewerId: user.id,
  // ... otros campos del body
  iterationId,  // nuevo campo
})
```

> Si `getLatestIteration` falla o retorna null, `iterationId` es `null` — no bloquear la creación del feedback.

### Task 4 — Repositorio feedback: actualizar `create` para recibir `iterationId`

Modificar `lib/repositories/feedback.repository.ts` — función/método `create`:

Añadir `iterationId: string | null` al objeto de datos de entrada:

```typescript
interface CreateFeedbackData {
  projectId: string
  reviewerId: string
  // ... campos existentes
  iterationId: string | null  // NUEVO
}
```

En el INSERT incluir `iteration_id: data.iterationId` (mapeo camelCase → snake_case).

> Si el fichero ya tenía un tipo definido para `CreateFeedbackData`, extenderlo. Si no tenía tipo explícito, añadir el campo inline en el objeto de insert.

### Task 5 — Tests de integración: verificar atribución en POST /api/feedback

Crear o ampliar `tests/integration/api/feedback-iteration-attribution.test.ts`:

- Test: al crear feedback en un proyecto CON iteración, el repo `create` es llamado con `iterationId` igual al id de la iteración más reciente.
- Test: al crear feedback en un proyecto SIN iteración, el repo `create` es llamado con `iterationId = null`.
- Test: si `getLatestIteration` lanza una excepción, el feedback se crea igualmente con `iterationId = null` (no bloquea la creación).

Patrón de mocking: igual que `tests/integration/api/feedback-quality-score.11-3.test.ts` — mockear `createProjectIterationsRepository` con `vi.mock`.

### Task 6 — UI: etiqueta de versión en el feed de feedbacks

Modificar el componente que muestra la lista de feedbacks en la página del proyecto (`app/(app)/communities/[slug]/projects/[projectSlug]/page.tsx` o el componente de feed correspondiente):

- Si el feedback tiene `iteration_id` no nulo, mostrar un badge/etiqueta con el número de versión.
- Para obtener el número de versión del badge, usar el mapeo de iteraciones que ya se cargará en page.tsx para Story 13.6, o añadir una sub-query para obtener el `version_number` desde `iteration_id`.

> Implementación simplificada aceptable: añadir `iteration_id` al SELECT de feedbacks en `page.tsx` y mostrar el badge cuando `iteration_id !== null` con el texto "v?" hasta que Story 13.6 exponga el mapeo completo. Alternativamente, hacer join con `project_iterations` en el SELECT de feedbacks.

---

## Dev Notes

### Por qué atribuir en POST /api/feedback y no en la BD

La alternativa sería usar un trigger de PostgreSQL para rellenar `iteration_id` automáticamente al insertar en `feedbacks`. Sin embargo, la política del proyecto es mantener la lógica en la capa de aplicación para facilitar los tests y la observabilidad. El trigger en la BD es más performante pero menos testeable.

La decisión adoptada (atribuir en la route de feedback) sigue el patrón ya establecido en el proyecto de mantener toda la lógica de negocio en TypeScript/Next.js y usar Supabase solo como capa de datos.

### Patrón de llamada a `getLatestIteration`

La llamada debe usar el mismo cliente `supabase` que el handler de feedback (cliente de sesión, no `createAdminClient`), ya que `project_iterations` NO tiene RLS que requiera service role para SELECT.

> Verificar las políticas RLS de `project_iterations` antes de implementar. Si la tabla tiene RLS restrictiva, usar `createAdminClient()` para la consulta de la iteración vigente.

### Campo `iteration_id` en `feedbacks`

El campo ya existe desde Story 13.1 (migración `033_add_iteration_id_to_feedbacks.sql`):

```sql
ALTER TABLE feedbacks ADD COLUMN iteration_id UUID REFERENCES project_iterations(id) ON DELETE SET NULL;
```

No se necesita ninguna migración adicional.

### Impacto en el Proof Score (Story 13.6)

La Story 13.6 usará los feedbacks con `iteration_id` de la última iteración para calcular el Proof Score filtrado. Para que 13.6 funcione correctamente, es necesario que 13.4 esté implementada y que los feedbacks nuevos tengan `iteration_id` rellenado.

Los feedbacks históricos (anteriores a 13.4) mantendrán `iteration_id = NULL` y seguirán contando en el cálculo global de Proof Score hasta que Story 13.6 defina la lógica exacta.

### Estructura de ficheros a modificar

```
lib/
  repositories/
    project-iterations.repository.ts  ← MODIFICAR: añadir getLatestIteration (Task 1)
    feedback.repository.ts             ← MODIFICAR: iterationId en CreateFeedbackData + INSERT (Task 4)
app/
  api/
    feedback/
      route.ts                         ← MODIFICAR: obtener iteración vigente + pasar iterationId (Task 3)
app/(app)/communities/[slug]/projects/[projectSlug]/
  page.tsx                             ← MODIFICAR: badge de versión en feed de feedbacks (Task 6)
tests/
  unit/
    project-iterations/
      projectIterationsRepository.test.ts  ← MODIFICAR: tests getLatestIteration (Task 2)
  integration/
    api/
      feedback-iteration-attribution.test.ts  ← NUEVO (Task 5)
```

### Referencias de código

- `lib/repositories/project-iterations.repository.ts` — repositorio a extender (Story 13.2)
- `lib/repositories/feedback.repository.ts` — repositorio de feedbacks
- `app/api/feedback/route.ts` — route a modificar (ya modificada en Stories 11.2, 11.3, 12.7)
- `tests/integration/api/feedback-quality-score.11-3.test.ts` — patrón de tests de integración de feedback
- `lib/types/project-iterations.ts` — tipos `ProjectIteration` y `projectIterationFromRow` (Story 13.1)

---

## Criterio de Done

- [x] `lib/repositories/project-iterations.repository.ts` tiene `getLatestIteration(projectId)` que retorna la iteración más reciente o null.
- [x] `lib/repositories/feedback.repository.ts` acepta `iterationId: string | null` en `create`.
- [x] `app/api/feedback/route.ts` obtiene la iteración vigente y la pasa al crear el feedback.
- [x] Si no hay iteración, `iteration_id` queda NULL sin errores ni bloqueos.
- [x] Tests unitarios de `getLatestIteration`: en verde, cubriendo retorno null, retorno del mayor version_number.
- [x] Tests de integración de atribución: en verde, cubriendo proyecto con/sin iteración y manejo de errores.
- [x] Badge de versión visible en el feed cuando el feedback tiene `iteration_id`.
- [x] `npm test` completo sin regresiones (1804 tests en verde, +10 nuevos).
- [x] Sin errores TypeScript nuevos relacionados con esta story.
- [ ] Story actualizada a `done` en sprint-status.yaml tras CR aprobado y QA PASS.

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

N/A — implementación directa sin bloqueos.

### Completion Notes List

- `getLatestIteration` usa `.maybeSingle()` en lugar de `.single()` para manejar gracefully el caso de 0 registros sin lanzar error.
- La route envuelve la llamada a `getLatestIteration` en try/catch para garantizar que un fallo de BD no bloquee la creación del feedback (AC2 + comportamiento graceful).
- El SELECT de `findByProject` se extendió con join a `project_iterations` para obtener `version_number` directamente, evitando dependencia con Story 13.6.
- `FeedbackWithReviewer` extendida con `iteration_id` y `project_iterations` para que el tipo sea consistente con los datos que retorna Supabase.
- Tests de componente de `FeedbackList` actualizados con los nuevos campos requeridos por el tipo.

### File List

- `lib/repositories/project-iterations.repository.ts` — añadido `getLatestIteration`
- `lib/repositories/feedback.repository.ts` — `iterationId` en `create`, join en `findByProject`
- `app/api/feedback/route.ts` — atribución de iteración con manejo graceful
- `lib/api/feedback.ts` — `FeedbackWithReviewer` extendida con `iteration_id` y `project_iterations`
- `components/feedback/FeedbackList.tsx` — badge de versión "v{N}" en cabecera de cada feedback
- `tests/unit/project-iterations/projectIterationsRepository.test.ts` — 5 tests nuevos de `getLatestIteration`
- `tests/integration/api/feedback-iteration-attribution.test.ts` — 3 tests nuevos de atribución
- `tests/component/feedback/FeedbackList.test.tsx` — fixtures actualizados + 2 tests del badge
