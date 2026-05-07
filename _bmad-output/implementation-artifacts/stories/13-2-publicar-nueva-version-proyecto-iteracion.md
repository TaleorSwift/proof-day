# Story 13.2 — Publicar nueva versión de proyecto (iteración)

**Epic:** 13 — Iteración, Cierre del Loop y Copiloto IA
**Story key:** 13.2
**Status:** ready-for-dev
**Fase:** GROWTH 2.1
**Prerequisito:** Story 13.1 completada (tabla `project_iterations` + columna `iteration_id` en feedbacks)

---

## User Story

**Como** Builder de un proyecto publicado en Proof Day,
**quiero** poder publicar una nueva versión/iteración de mi proyecto editando opcionalmente su título, descripción e hipótesis,
**para que** pueda documentar mis cambios tras iterar sobre el feedback recibido, incrementar el número de versión y resetear visualmente el proof score para el ciclo de validación siguiente.

---

## Acceptance Criteria

### AC1 — Botón "Nueva versión" visible solo para el Builder

**Given** que un usuario autenticado es el Builder del proyecto (`project.builder_id === user.id`) y el proyecto está en estado `live`,
**When** accede a la página de detalle del proyecto (`/communities/[slug]/projects/[projectSlug]`),
**Then** ve un botón "Nueva versión" en el área de acciones del proyecto.

**Given** que un usuario autenticado NO es el Builder del proyecto,
**When** accede a la página de detalle del proyecto,
**Then** el botón "Nueva versión" NO es visible.

**Given** que el proyecto está en estado `draft` o `inactive`,
**When** el Builder accede a la página de detalle,
**Then** el botón "Nueva versión" NO es visible (la funcionalidad solo aplica a proyectos `live`).

### AC2 — Modal pre-rellenado con valores actuales del proyecto

**Given** que el Builder hace clic en el botón "Nueva versión",
**When** se abre el modal/formulario,
**Then** el formulario muestra los campos título, descripción (problem + solution como texto combinado o por separado) e hipótesis pre-rellenados con los valores actuales del proyecto.

**Given** que el modal está abierto,
**When** el Builder pulsa "Cancelar" o cierra el modal,
**Then** el modal se cierra sin crear ningún registro en `project_iterations`.

### AC3 — El Builder puede editar el contenido antes de publicar

**Given** que el modal está abierto con los valores pre-rellenados,
**When** el Builder modifica el título, la descripción o la hipótesis y pulsa "Publicar versión",
**Then** el registro en `project_iterations` se crea con los valores editados (no con los originales del proyecto).

**Given** que el Builder no modifica ningún campo y pulsa "Publicar versión",
**Then** el registro en `project_iterations` se crea con los valores actuales del proyecto sin cambios.

### AC4 — Creación del registro en `project_iterations` con version_number correcto

**Given** que el proyecto no tiene ningún registro previo en `project_iterations`,
**When** el Builder publica la primera iteración,
**Then** se crea un registro con `version_number = 1`.

**Given** que el proyecto ya tiene registros en `project_iterations` y la última versión tiene `version_number = N`,
**When** el Builder publica una nueva iteración,
**Then** se crea un registro con `version_number = N + 1`.

**Given** que la operación de inserción en `project_iterations` falla (error de BD o red),
**When** el Builder intenta publicar la versión,
**Then** se muestra un mensaje de error y el modal permanece abierto para reintentar.

### AC5 — Feedback visual tras publicar la iteración

**Given** que el Builder ha confirmado la publicación de la nueva versión,
**When** la operación se completa con éxito,
**Then** el modal se cierra y se muestra un mensaje de confirmación "Versión X publicada" (donde X es el número de versión recién creado).

### AC6 — Reset visual del proof score para la nueva iteración

**Given** que se ha publicado una nueva iteración exitosamente,
**When** el Builder visualiza la sidebar del proyecto,
**Then** el proof score se muestra en estado "esperando feedback" (indicador visual de 0 feedbacks para la nueva versión), reflejando que los feedbacks anteriores corresponden a la versión previa.

> Nota: esta story implementa únicamente el reset visual. Los feedbacks anteriores no se eliminan ni se migran — siguen almacenados en BD sin `iteration_id` asociado a la nueva versión. La atribución real de feedbacks por iteración es scope de la Story 13.4.

### AC7 — Accesibilidad y UX del modal

**Given** que el modal se abre,
**When** el usuario interactúa con él,
**Then** el modal es accesible: tiene `role="dialog"`, `aria-modal="true"`, título descriptivo, y el foco se gestiona correctamente al abrir y cerrar.

---

## Tasks de implementación

> Seguir TDD Outside-In: escribir test primero, implementar, verificar verde.

### Task 1 — Repositorio: `createProjectIterationsRepository`

Crear `lib/repositories/project-iterations.repository.ts` con:

- `getLatestVersionNumber(projectId: string): Promise<number>` — obtiene el `MAX(version_number)` para el proyecto. Retorna `0` si no hay registros previos.
- `create(data: CreateProjectIterationData): Promise<ProjectIteration>` — inserta un nuevo registro en `project_iterations` y retorna el objeto mapeado.

```typescript
// lib/repositories/project-iterations.repository.ts
import type { SupabaseClient } from '@/lib/supabase/types'
import { projectIterationFromRow } from '@/lib/types/project-iterations'
import type { ProjectIteration, ProjectIterationRow } from '@/lib/types/project-iterations'

export interface CreateProjectIterationData {
  projectId: string
  versionNumber: number
  title: string | null
  description: string | null
  hypothesis: string | null
}

export function createProjectIterationsRepository(supabase: SupabaseClient) {
  return {
    async getLatestVersionNumber(projectId: string): Promise<number> { ... },
    async create(data: CreateProjectIterationData): Promise<{ data: ProjectIteration | null; error: unknown }> { ... },
  }
}
```

Patrón: igual que `createProjectsRepository` / `createFeedbackRepository` en `lib/repositories/`.

### Task 2 — Tests unitarios del repositorio (TDD)

Crear `tests/unit/project-iterations/projectIterationsRepository.test.ts`:

- Test: `getLatestVersionNumber` retorna `0` cuando no hay registros.
- Test: `getLatestVersionNumber` retorna el valor máximo cuando hay registros (N=2 → retorna 2).
- Test: `create` llama a `supabase.from('project_iterations').insert(...)` con los campos correctos (snake_case).
- Test: `create` retorna el objeto mapeado con `projectIterationFromRow`.

### Task 3 — API Route: `POST /api/projects/[id]/iterations`

Crear `app/api/projects/[id]/iterations/route.ts` con handler `POST`:

- Autenticación: `supabase.auth.getUser()` — 401 si no autenticado.
- Verificar que el proyecto existe y `builder_id === user.id` — 404 si no existe, 403 si no es el Builder.
- Verificar que el proyecto está en estado `live` — 422 si no está `live`.
- Validación del body con Zod: `{ title?: string, description?: string, hypothesis?: string }` (todos opcionales — si no se pasan, se usan los del proyecto).
- Obtener `latestVersionNumber` del repositorio y calcular `versionNumber = latestVersionNumber + 1`.
- Insertar en `project_iterations`.
- Retornar `{ data: ProjectIterationRow, versionNumber: number }` con status 201.

Códigos de error:
- `401 AUTH_REQUIRED`
- `403 PROJECT_FORBIDDEN`
- `404 PROJECT_NOT_FOUND`
- `422 PROJECT_NOT_LIVE`
- `500 ITERATION_CREATE_ERROR`

### Task 4 — Tests de integración de la API route (TDD)

Crear `tests/integration/api/projects/iterations.route.test.ts`:

- Test: 401 sin autenticación.
- Test: 404 cuando el proyecto no existe.
- Test: 403 cuando el usuario no es el Builder.
- Test: 422 cuando el proyecto no está en estado `live`.
- Test: 201 con `version_number = 1` en la primera iteración.
- Test: 201 con `version_number = N + 1` cuando ya hay iteraciones previas.
- Test: 201 con valores del body si se pasan (título/descripción/hipótesis editados).
- Test: 201 con valores del proyecto si no se pasan campos en el body.

Patrón: igual que `tests/integration/api/projects/status.route.test.ts` o `decision.route.test.ts`.

### Task 5 — Cliente HTTP: `lib/api/project-iterations.ts`

Crear `lib/api/project-iterations.ts` con:

```typescript
export interface PublishIterationInput {
  title?: string
  description?: string
  hypothesis?: string
}

export interface PublishIterationResult {
  versionNumber: number
}

export async function publishIteration(
  projectId: string,
  data: PublishIterationInput
): Promise<PublishIterationResult> {
  const res = await fetch(`/api/projects/${projectId}/iterations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return (await res.json()).data
}
```

Patrón: igual que `publishProject` / `registerDecision` en `lib/api/projects.ts`.

### Task 6 — Tests unitarios del cliente HTTP (TDD)

Crear `tests/unit/api/publishIteration.test.ts`:

- Test: llama a `fetch` con método `POST` y ruta correcta.
- Test: retorna `{ versionNumber }` en caso de éxito.
- Test: lanza Error con el mensaje de la API en caso de error.

### Task 7 — Componente `NewVersionModal`

Crear `components/projects/NewVersionModal.tsx` (Client Component — `'use client'`):

Props:
```typescript
interface NewVersionModalProps {
  projectId: string
  initialTitle: string
  initialDescription: string   // se puede combinar problem + solution o pasar solo uno
  initialHypothesis: string
  onSuccess: (versionNumber: number) => void
  onClose: () => void
}
```

Comportamiento:
- Renderiza un overlay modal con campos controlados (title, description, hypothesis).
- Pre-rellena los campos con los valores `initial*`.
- Botón "Publicar versión" llama a `publishIteration(projectId, { title, description, hypothesis })`.
- Estado de loading durante la llamada: botón deshabilitado + texto "Publicando...".
- En éxito: llama a `onSuccess(versionNumber)`.
- En error: muestra el mensaje de error con `role="alert"`.
- Botón "Cancelar": llama a `onClose()`.
- A11y: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apuntando al heading del modal.

Patrón de estilos: CSS variables de design tokens igual que `ProjectStateActions.tsx` y `DecisionDialog.tsx`.

### Task 8 — Tests del componente `NewVersionModal` (TDD)

Crear `tests/component/projects/NewVersionModal.test.tsx`:

- Test: renderiza con los valores pre-rellenados.
- Test: botón "Cancelar" llama a `onClose`.
- Test: submit llama a `publishIteration` con los datos del formulario.
- Test: muestra estado de loading durante la petición.
- Test: llama a `onSuccess(versionNumber)` tras éxito.
- Test: muestra mensaje de error cuando `publishIteration` rechaza.
- Test: a11y — `role="dialog"`, `aria-modal="true"` presentes.

### Task 9 — Integración en `page.tsx`: botón "Nueva versión" + lógica de feedback visual

Modificar `app/(app)/communities/[slug]/projects/[projectSlug]/page.tsx`:

- Añadir query de la última iteración del proyecto al cargar la página (para mostrar `versionNumber` actual y para el reset visual del proof score).
- Condición para mostrar el botón "Nueva versión": `isOwner && project.status === 'live'`.
- El botón abre `NewVersionModal` (requiere convertir la sección relevante en un Client Component wrapper o usar un Client Component separado `NewVersionActions`).
- Tras éxito (`onSuccess`): mostrar toast/banner "Versión X publicada" y actualizar el estado visual del proof score (reset a 0 feedbacks para la nueva versión).

> Preferencia de implementación: extraer un `NewVersionActions` Client Component para no convertir todo el `page.tsx` en client component (mantener SSR máximo).

### Task 10 — Storybook story para `NewVersionModal`

Crear `stories/projects/NewVersionModal.stories.tsx` con variantes:
- `Default` — modal abierto con valores pre-rellenados.
- `Loading` — estado durante la publicación.
- `Error` — estado de error tras fallo de la API.

---

## Dev Notes

### Patrón de repositorios en el proyecto

Los repositorios siguen el patrón factory en `lib/repositories/`:

```typescript
export function createXRepository(supabase: SupabaseClient) {
  return {
    async methodName(...) { ... }
  }
}
```

El cliente Supabase se inyecta desde fuera (no se crea dentro del repositorio), lo que facilita los tests con mocks.

Repositorios de referencia:
- `lib/repositories/projects.repository.ts` — CRUD de proyectos
- `lib/repositories/feedback.repository.ts` — CRUD de feedbacks

### Patrón de API Routes

Las rutas siguen el patrón de `app/api/projects/[id]/`:
1. Crear `createClient()` de Supabase server.
2. `getUser()` — 401 si no autenticado.
3. Verificar existencia del recurso — 404.
4. Verificar ownership — 403.
5. Verificar estado permitido — 422.
6. Validar body con Zod.
7. Ejecutar operación.
8. Retornar `NextResponse.json({ data: ... })`.

Referencia: `app/api/projects/[id]/route.ts` (PUT handler) y `app/api/projects/[id]/decision/route.ts`.

### Patrón de Client Components con acciones

`ProjectStateActions.tsx` es el referente más cercano para el botón "Nueva versión":
- `'use client'`
- `useState` para loading, error, confirm.
- Llama a funciones de `lib/api/projects.ts`.
- Estilos con CSS variables de design tokens.

`DecisionDialog.tsx` es el referente para el modal:
- `'use client'`
- Props controladas desde el padre.
- `role="dialog"`, `aria-modal="true"`.
- Loading state en el botón de acción.

### Cálculo del `version_number`

El `version_number` se calcula en la aplicación (no auto-increment de BD), siguiendo la decisión de diseño de la Story 13.1:

```typescript
const latestVersionNumber = await repo.getLatestVersionNumber(projectId)
const versionNumber = latestVersionNumber + 1
```

La BD impone la constraint `UNIQUE(project_id, version_number)` como salvaguarda contra race conditions. Si dos publicaciones concurrentes ocurren (caso muy improbable en MVP), la segunda operación fallará con error de BD que se captura y retorna como 500.

### Reset visual del proof score

El reset visual del proof score para la nueva iteración NO requiere modificar la tabla `feedbacks` ni el cálculo del proof score real. La implementación es:

- Mostrar en la sidebar un indicador "Nueva versión publicada — Esperando feedback" cuando existe una iteración con `published_at` reciente (por ejemplo, menos de 5 minutos, o simplemente al detectar que existe una iteración y el Builder acaba de publicar).
- Los feedbacks anteriores siguen contando en el proof score real hasta que la Story 13.4 (atribución por iteración) esté implementada.
- Para esta story, basta con un estado local en el Client Component que se activa tras `onSuccess`.

### Tipos disponibles (Story 13.1)

```typescript
// lib/types/project-iterations.ts
export interface ProjectIteration { id, projectId, versionNumber, title, description, hypothesis, publishedAt, createdAt }
export interface ProjectIterationRow { id, project_id, version_number, title, description, hypothesis, published_at, created_at }
export function projectIterationFromRow(row: ProjectIterationRow): ProjectIteration
```

### Número de migración

No se requieren nuevas migraciones en esta story. La tabla `project_iterations` ya existe desde la Story 13.1 (`032_create_project_iterations.sql`). Solo se crean nuevos ficheros de aplicación.

### Supabase client en tests de integración

Los tests de integración de API routes usan `vi.mock('@/lib/supabase/server')` con un mock del cliente Supabase que simula las respuestas. Ver `tests/integration/api/projects/decision.route.test.ts` como referente de estructura y mocking.

### Design tokens de referencia

Fichero: `docs/project/design-tokens.md`

Tokens relevantes para el modal:
- `--color-surface`, `--color-background`, `--color-border`
- `--color-primary`, `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- `--radius-md`, `--radius-lg`, `--radius-xl`
- `--space-2`, `--space-3`, `--space-4`, `--space-6`, `--space-8`
- `--text-sm`, `--text-base`, `--font-medium`, `--font-semibold`
- `--shadow-sm`

### Estructura del modal — campo `description`

El proyecto almacena `problem` y `solution` por separado, pero la iteración tiene un único campo `description`. Para esta story, el Builder puede editar el campo `description` de la iteración de forma libre. El pre-relleno sugiere usar `problem + '\n\n' + solution` como valor inicial del textarea, o bien mostrar ambos campos por separado en el modal (decisión del implementador, cualquiera de las dos opciones es válida mientras los ACs se cumplan).

### Project structure relevante

```
app/
  api/
    projects/
      [id]/
        iterations/           ← NUEVO (Task 3)
          route.ts
components/
  projects/
    NewVersionModal.tsx       ← NUEVO (Task 7)
    NewVersionActions.tsx     ← NUEVO (Task 9, wrapper client)
lib/
  api/
    project-iterations.ts     ← NUEVO (Task 5)
  repositories/
    project-iterations.repository.ts  ← NUEVO (Task 1)
stories/
  projects/
    NewVersionModal.stories.tsx  ← NUEVO (Task 10)
tests/
  unit/
    project-iterations/
      projectIterationsRepository.test.ts  ← NUEVO (Task 2)
    api/
      publishIteration.test.ts             ← NUEVO (Task 6)
  integration/
    api/
      projects/
        iterations.route.test.ts           ← NUEVO (Task 4)
  component/
    projects/
      NewVersionModal.test.tsx             ← NUEVO (Task 8)
```

### Referencias

- [Source: lib/types/project-iterations.ts] — tipos de iteración (Story 13.1)
- [Source: lib/repositories/projects.repository.ts] — patrón de repositorio
- [Source: lib/api/projects.ts] — patrón de cliente HTTP (`publishProject`, `registerDecision`)
- [Source: app/api/projects/[id]/route.ts] — patrón de API route (PUT)
- [Source: components/projects/ProjectStateActions.tsx] — patrón de Client Component con loading/error
- [Source: components/projects/DecisionDialog.tsx] — patrón de modal accesible (si existe)
- [Source: app/(app)/communities/[slug]/projects/[projectSlug]/page.tsx] — página de detalle donde se integra el botón

---

## Criterio de Done

- [ ] `lib/repositories/project-iterations.repository.ts` creado con `getLatestVersionNumber` y `create`.
- [ ] `app/api/projects/[id]/iterations/route.ts` creado con handler POST (auth, 403, 404, 422, 201).
- [ ] `lib/api/project-iterations.ts` creado con `publishIteration`.
- [ ] `components/projects/NewVersionModal.tsx` creado y accesible (`role="dialog"`, `aria-modal="true"`).
- [ ] Botón "Nueva versión" visible solo para Builder en proyecto `live` en `page.tsx`.
- [ ] Feedback visual "Versión X publicada" mostrado tras éxito.
- [ ] Reset visual del proof score tras publicar nueva versión.
- [ ] `stories/projects/NewVersionModal.stories.tsx` creado con 3 variantes.
- [ ] Tests unitarios (repositorio, cliente HTTP): en verde.
- [ ] Tests de integración (API route): en verde, cubriendo 401/403/404/422/201.
- [ ] Tests de componente (modal): en verde, cubriendo pre-relleno/loading/error/éxito/a11y.
- [ ] `npm test` completo sin regresiones.
- [ ] `npm run build` sin errores TypeScript.
- [ ] Story actualizada a `done` en sprint-status.yaml tras CR aprobado y QA PASS.

---

## Dev Agent Record

### Agent Model Used

_A completar por Homer al implementar_

### Debug Log References

### Completion Notes List

### File List
