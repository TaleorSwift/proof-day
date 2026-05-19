# Story 13.3 — Notificación a reviewers anteriores cuando hay nueva versión

**Epic:** 13 — Iteración, Cierre del Loop y Copiloto IA
**Story key:** 13.3
**Status:** ready-for-dev
**Fase:** GROWTH 2.1
**Prerequisito:** Story 13.2 completada (POST /api/projects/[id]/iterations retorna 201 + `NewVersionModal`)

---

## User Story

**Como** reviewer que ha dado feedback en versiones anteriores de un proyecto en Proof Day,
**quiero** recibir una notificación in-app cuando el Builder publica una nueva versión del proyecto,
**para que** pueda saber que hay una nueva iteración disponible para revisar y contribuir con feedback fresco.

---

## Acceptance Criteria

### AC1 — Notificación creada para cada reviewer anterior tras publicar nueva versión

**Given** que el Builder publica una nueva versión de su proyecto (POST /api/projects/[id]/iterations retorna 201),
**When** la operación de creación de la iteración se completa con éxito,
**Then** se crea una notificación de tipo `new_iteration_ready` para cada usuario que tiene al menos un feedback con `project_id = <id>` y `reviewer_id != builder_id`.

**Given** que el proyecto no tiene ningún reviewer anterior (ningún feedback con ese `project_id`),
**When** el Builder publica una nueva versión,
**Then** no se crea ninguna notificación (cero inserciones en la tabla `notifications`).

### AC2 — El Builder no recibe la notificación de nueva versión

**Given** que el Builder publica su propia nueva versión,
**When** se procesan las notificaciones,
**Then** el Builder NO aparece en la lista de destinatarios aunque, por algún error de datos, tuviese un feedback asociado al mismo proyecto con su propio `user_id`.

> Condición de filtrado: `reviewer_id != project.builder_id` en la consulta de reviewers anteriores.

### AC3 — Payload de la notificación correcto

**Given** que se crea una notificación `new_iteration_ready` para un reviewer,
**When** el reviewer consulta sus notificaciones (GET /api/notifications),
**Then** la notificación tiene:
- `type`: `"new_iteration_ready"`
- `payload.projectId`: el ID del proyecto
- `payload.projectSlug`: el slug del proyecto
- `payload.projectTitle`: el título del proyecto
- `payload.versionNumber`: el número de la versión recién publicada (el mismo `versionNumber` retornado en el 201)
- `payload.communitySlug`: el slug de la comunidad a la que pertenece el proyecto

### AC4 — Fire-and-forget: las notificaciones no bloquean la respuesta 201

**Given** que el POST /api/projects/[id]/iterations se invoca con datos válidos,
**When** la iteración se crea exitosamente,
**Then** la respuesta 201 se devuelve inmediatamente sin esperar a que las notificaciones terminen de crearse.

> La creación de notificaciones se dispara con `void` (sin `await`), y los errores se registran en consola pero no se propagan al caller.

### AC5 — No duplicar notificaciones

**Given** que ya existe una notificación de tipo `new_iteration_ready` con `payload.projectId = X` y `payload.versionNumber = N` para el usuario U,
**When** se intenta crear la misma notificación otra vez (ej: retry o doble llamada),
**Then** no se crea una segunda notificación duplicada para ese usuario.

> Implementación: antes de insertar, verificar si ya existe una notificación con `type = 'new_iteration_ready'`, `user_id = userId` y `payload @> {projectId, versionNumber}`. Si existe, se omite.

### AC6 — Uso de service_role para las inserciones

**Given** que la tabla `notifications` tiene RLS activada (solo `service_role` puede insertar),
**When** se crean las notificaciones para los reviewers,
**Then** se usa `createAdminClient()` (service role key) para las operaciones de SELECT en `feedbacks` y las de INSERT en `notifications`.

### AC7 — La NotificationBell muestra texto adecuado para `new_iteration_ready`

**Given** que un reviewer tiene una notificación de tipo `new_iteration_ready` no leída,
**When** abre el dropdown de la campana de notificaciones,
**Then** la notificación muestra:
- Título: el `projectTitle` del payload
- Subtexto: "Nueva versión disponible — v{versionNumber}"

**Given** que el reviewer hace clic en la notificación,
**When** se procesa la navegación,
**Then** navega a `/communities/{communitySlug}/projects/{projectSlug}` (mismo comportamiento que las notificaciones `ai_synthesis_ready`).

---

## Tasks de implementación

> Seguir TDD Outside-In: escribir test primero, implementar, verificar verde.

### Task 1 — Función helper: `notifyPreviousReviewers`

Crear `lib/notifications/notify-previous-reviewers.ts` con la función:

```typescript
// lib/notifications/notify-previous-reviewers.ts

import { createAdminClient } from '@/lib/supabase/admin'

interface NotifyPreviousReviewersParams {
  projectId: string
  builderId: string
  projectSlug: string
  projectTitle: string
  versionNumber: number
  communitySlug: string
}

/**
 * Fire-and-forget: notifica a todos los reviewers anteriores del proyecto
 * que hay una nueva versión disponible.
 *
 * - Usa createAdminClient() (service role) para bypasear RLS.
 * - No bloquea la respuesta de la API — llamar con void.
 * - Omite duplicados: si ya existe una notificación new_iteration_ready
 *   para ese user/project/version, no crea otra.
 * - Omite al Builder (builderId).
 */
export async function notifyPreviousReviewers(
  params: NotifyPreviousReviewersParams
): Promise<void> { ... }
```

Lógica interna:
1. `createAdminClient()` para obtener el cliente admin.
2. SELECT DISTINCT `reviewer_id` FROM `feedbacks` WHERE `project_id = params.projectId` AND `reviewer_id != params.builderId`.
3. Para cada `reviewerId` en la lista:
   a. Verificar si ya existe notificación con `type = 'new_iteration_ready'` y `user_id = reviewerId` y `payload->>'projectId' = params.projectId` y `payload->>'versionNumber' = String(params.versionNumber)`. Si existe, saltar.
   b. Insertar en `notifications`: `{ user_id: reviewerId, type: 'new_iteration_ready', payload: {...}, read: false }`.
4. Capturar errores con `console.error` — no propagar.

Patrón de referencia para la consulta DISTINCT:

```typescript
const { data: reviewerRows } = await adminClient
  .from('feedbacks')
  .select('reviewer_id')
  .eq('project_id', params.projectId)
  .neq('reviewer_id', params.builderId)

const uniqueReviewerIds = [...new Set(
  (reviewerRows ?? []).map((r) => r.reviewer_id as string)
)]
```

Patrón de referencia para el check de duplicados:

```typescript
const { data: existing } = await adminClient
  .from('notifications')
  .select('id')
  .eq('user_id', reviewerId)
  .eq('type', 'new_iteration_ready')
  .contains('payload', { projectId: params.projectId, versionNumber: params.versionNumber })
  .maybeSingle()

if (existing) continue
```

### Task 2 — Tests unitarios de `notifyPreviousReviewers` (TDD)

Crear `tests/unit/notifications/notifyPreviousReviewers.test.ts`:

- Test: llama a `feedbacks` con `eq('project_id', ...)` y `neq('reviewer_id', builderId)`.
- Test: no inserta nada si no hay reviewers anteriores.
- Test: inserta una notificación por cada reviewer único.
- Test: omite al Builder de la lista aunque aparezca en `feedbacks` (neq guard).
- Test: omite inserciones cuando ya existe una notificación duplicada (check de exists).
- Test: captura errores de BD en consola sin propagar la excepción (`console.error` spy).
- Test: el payload incluye `projectId`, `projectSlug`, `projectTitle`, `versionNumber`, `communitySlug`.

Patrón de mock: igual que los tests de `ai-synthesis.route.ts` que mockean `createAdminClient` con `vi.mock('@/lib/supabase/admin', ...)`.

### Task 3 — Integrar `notifyPreviousReviewers` en la API route

Modificar `app/api/projects/[id]/iterations/route.ts`:

- Obtener el `communitySlug` del proyecto (añadir al SELECT inicial: `community_id`, luego hacer una segunda query para obtener el slug de la comunidad, o añadir `communities(slug)` en el select con join).
- Tras el `return NextResponse.json({ data: {...} }, { status: 201 })`, añadir el disparo fire-and-forget:

```typescript
// Fire-and-forget — no bloquea la respuesta 201
void notifyPreviousReviewers({
  projectId: id,
  builderId: project.builder_id,
  projectSlug: project.slug,  // añadir slug al SELECT inicial
  projectTitle: project.title,
  versionNumber,
  communitySlug: communitySlug ?? '',
})
```

> Nota: el `return` de la respuesta 201 debe ir ANTES del `void notifyPreviousReviewers(...)` para que la respuesta no sea bloqueada. En Next.js el `return` finaliza la ejecución del handler — el fire-and-forget debe dispararse justo ANTES del `return` con `void` (no `await`), o bien después usando `waitUntil` si está disponible. La forma más simple y compatible: disparar con `void` antes del return:

```typescript
void notifyPreviousReviewers({ ... })
return NextResponse.json({ data: {...} }, { status: 201 })
```

Campos adicionales a añadir al SELECT inicial del proyecto:
- `slug` (para `projectSlug`)
- El `communitySlug` se obtiene con una query adicional a `communities` antes del return, igual que en `app/api/webhooks/ai-synthesis/route.ts` (líneas ~296-302).

### Task 4 — Tests de integración: verificar que el trigger se dispara

Modificar `tests/integration/api/projects/iterations.route.test.ts` (ya existente desde Story 13.2):

- Añadir test: en el happy path 201, `notifyPreviousReviewers` es llamada con los parámetros correctos (`projectId`, `builderId`, `versionNumber`, etc.).

Patrón: mockear `lib/notifications/notify-previous-reviewers` con `vi.mock` y verificar que fue llamado con `expect(notifyPreviousReviewers).toHaveBeenCalledWith(expect.objectContaining({ versionNumber: 1 }))`.

> No testear el comportamiento interno de la función en tests de integración — eso lo cubren los tests unitarios de Task 2.

### Task 5 — Actualizar comentario en `lib/types/ai.ts`

Modificar `lib/types/ai.ts`, sección del comentario de `NotificationType`:

```typescript
/**
 * Tipo nominal para los tipos de notificación.
 * Se usa string en lugar de enum para extensibilidad sin deploy de schema.
 *
 * Valores conocidos del sistema:
 *   - 'ai_synthesis_ready'    — síntesis IA completada, notifica al Builder (Story 12.3)
 *   - 'budget_alert'          — presupuesto mensual de IA >= 80% del límite (Story 12.7)
 *   - 'new_iteration_ready'   — nueva versión del proyecto publicada, notifica a reviewers (Story 13.3)
 */
export type NotificationType = string
```

### Task 6 — Actualizar `NotificationBell` para mostrar texto específico de `new_iteration_ready`

Modificar `components/shared/NotificationBell.tsx`:

Sustituir el subtexto genérico "Síntesis IA disponible" por lógica basada en el tipo de notificación:

```typescript
function getNotificationSubtext(notification: AppNotification): string {
  const payload = notification.payload as Record<string, unknown>
  switch (notification.type) {
    case 'new_iteration_ready': {
      const version = payload.versionNumber as number | undefined
      return version ? `Nueva versión disponible — v${version}` : 'Nueva versión disponible'
    }
    case 'ai_synthesis_ready':
    default:
      return 'Síntesis IA disponible'
  }
}
```

Usar `getNotificationSubtext(notification)` en lugar del texto hardcodeado en el `DropdownMenuItem`.

### Task 7 — Tests del componente `NotificationBell` para el nuevo tipo

Modificar (o añadir) `tests/component/shared/NotificationBell.test.tsx`:

- Test: para notificación `new_iteration_ready`, muestra "Nueva versión disponible — v2".
- Test: para notificación `ai_synthesis_ready`, sigue mostrando "Síntesis IA disponible".
- Test: click en notificación `new_iteration_ready` navega a la ruta correcta (`/communities/{slug}/projects/{slug}`).

---

## Dev Notes

### Patrón fire-and-forget en Next.js App Router

En Next.js 14+ App Router, el handler de una route se ejecuta en un contexto serverless que puede finalizar en cuanto la respuesta es enviada. El `void` antes de una Promise asíncrona **dispara** la operación pero no garantiza que completará si el runtime finaliza.

Para MVP es aceptable el riesgo de que alguna notificación no se entregue si el runtime se corta (extremadamente improbable en práctica para operaciones rápidas de BD). La misma estrategia se usa en `app/api/webhooks/ai-synthesis/route.ts` para el envío de email (línea `sendEmail(...).catch(...)`).

Si en el futuro se necesita garantía de entrega, se puede migrar a una queue (ej: Supabase Edge Functions + pg_cron) como parte del backlog técnico.

### Por qué `createAdminClient()` y no el cliente de sesión

La tabla `notifications` tiene RLS: solo `service_role` puede insertar. El cliente de sesión del usuario solo puede leer sus propias notificaciones. Por tanto, cualquier INSERT en `notifications` desde lógica de servidor debe usar `createAdminClient()`.

Referencia: mismo patrón en `app/api/webhooks/ai-synthesis/route.ts` líneas 303-313.

### Deduplicación con `.contains('payload', {...})`

Supabase soporta el operador `contains` para columnas `jsonb`. La consulta:

```typescript
.contains('payload', { projectId: params.projectId, versionNumber: params.versionNumber })
```

Es equivalente a SQL: `payload @> '{"projectId":"...","versionNumber":N}'::jsonb`.

Referencia: [Supabase docs — Querying JSON columns](https://supabase.com/docs/guides/database/json).

### Estructura del directorio `lib/notifications/`

Este es el primer fichero en `lib/notifications/`. Crear el directorio si no existe.

Patrón de módulo de utilidades del dominio — igual que `lib/email/` (Story 12.6) o `lib/ai/` (Epic 12).

### Campos adicionales en el SELECT del proyecto (Task 3)

La route actual (`app/api/projects/[id]/iterations/route.ts`) selecciona:
```
id, builder_id, status, title, problem, solution, hypothesis
```

Para Task 3 añadir también `slug` y `community_id` al SELECT. El `communitySlug` se obtiene con una query adicional a `communities` igual que en el webhook de síntesis IA:

```typescript
const { data: community } = await adminClient
  .from('communities')
  .select('slug')
  .eq('id', project.community_id)
  .single()
const communitySlug = community?.slug ?? ''
```

Esta query usa `createAdminClient()` para consistencia con el resto del flujo de notificaciones.

### Project structure relevante

```
lib/
  notifications/
    notify-previous-reviewers.ts    ← NUEVO (Task 1)
  types/
    ai.ts                           ← MODIFICAR comentario NotificationType (Task 5)
app/
  api/
    projects/
      [id]/
        iterations/
          route.ts                  ← MODIFICAR: añadir slug+community_id al SELECT, trigger fire-and-forget (Task 3)
components/
  shared/
    NotificationBell.tsx            ← MODIFICAR: texto por tipo de notificación (Task 6)
tests/
  unit/
    notifications/
      notifyPreviousReviewers.test.ts   ← NUEVO (Task 2)
  integration/
    api/
      projects/
        iterations.route.test.ts    ← MODIFICAR: añadir test del trigger (Task 4)
  component/
    shared/
      NotificationBell.test.tsx     ← MODIFICAR: añadir tests new_iteration_ready (Task 7)
```

### Referencias de código

- `app/api/webhooks/ai-synthesis/route.ts` — patrón de notificación in-app con `createAdminClient` (líneas 303-313) y email fire-and-forget (líneas 316-340)
- `lib/supabase/admin.ts` — `createAdminClient()` para service role
- `components/shared/NotificationBell.tsx` — componente a extender con subtexto por tipo
- `tests/unit/webhooks/ai-synthesis.test.ts` — patrón de mock de `createAdminClient`
- `tests/integration/api/projects/iterations.route.test.ts` — fichero a extender (Task 4)

---

## Criterio de Done

- [ ] `lib/notifications/notify-previous-reviewers.ts` creado con la función `notifyPreviousReviewers`.
- [ ] `app/api/projects/[id]/iterations/route.ts` modificado: SELECT ampliado con `slug` + `community_id`, query de `communitySlug`, disparo fire-and-forget con `void notifyPreviousReviewers(...)`.
- [ ] `lib/types/ai.ts` actualizado con el comentario de `new_iteration_ready`.
- [ ] `components/shared/NotificationBell.tsx` muestra "Nueva versión disponible — v{N}" para notificaciones `new_iteration_ready`.
- [ ] Tests unitarios de `notifyPreviousReviewers`: en verde, cubriendo lista de reviewers, deduplicación, exclusión del Builder, errores silenciosos.
- [ ] Tests de integración de `iterations.route.test.ts` verifican que `notifyPreviousReviewers` es llamado en el happy path 201.
- [ ] Tests de componente de `NotificationBell`: en verde, cubriendo subtexto por tipo.
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
