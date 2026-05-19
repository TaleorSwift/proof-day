# Story 13.5 — Notificación de atribución al Reviewer etiquetado

**Epic:** 13 — Iteración, Cierre del Loop y Copiloto IA
**Story key:** 13.5
**Status:** ready-for-dev
**Fase:** GROWTH 2.1
**Prerequisito:** Story 13.4 completada (campo `iteration_id` rellenado en `feedbacks` al crear feedback)

---

## User Story

**Como** Reviewer que ha enviado feedback en un proyecto de Proof Day,
**quiero** recibir una notificación in-app cuando mi contribución queda registrada para una iteración específica,
**para que** pueda saber que mi feedback está siendo tenido en cuenta en el contexto de esa versión del proyecto.

---

## Acceptance Criteria

### AC1 — Notificación `feedback_attributed` creada para el Reviewer

**Given** que un Reviewer envía feedback en un proyecto que tiene iteración activa,
**When** el POST /api/feedback crea el registro con `iteration_id` no nulo (Story 13.4),
**Then** se crea una notificación de tipo `feedback_attributed` para ese Reviewer con el payload:
- `projectId`: el ID del proyecto
- `projectSlug`: el slug del proyecto
- `projectTitle`: el título del proyecto
- `versionNumber`: el `version_number` de la iteración a la que quedó atribuido el feedback
- `communitySlug`: el slug de la comunidad del proyecto

### AC2 — Fire-and-forget: no bloquea la respuesta 201

**Given** que el POST /api/feedback procesa la solicitud con éxito,
**When** se dispara la notificación `feedback_attributed`,
**Then** la respuesta 201 del endpoint se devuelve inmediatamente sin esperar a que la notificación se cree.

> La creación de la notificación se dispara con `void notifyFeedbackAttributed(...)` — no `await`. Los errores internos se capturan con `console.error` y no se propagan al caller.

### AC3 — Sin notificación cuando `iteration_id` es NULL

**Given** que un Reviewer envía feedback en un proyecto SIN iteraciones activas,
**When** el POST /api/feedback crea el registro con `iteration_id = null`,
**Then** NO se crea ninguna notificación de tipo `feedback_attributed` para ese Reviewer.

**Given** que `getLatestIteration` falla o retorna null,
**When** el feedback se crea con `iteration_id = null`,
**Then** tampoco se crea la notificación (el guard es: si `iterationId === null`, no disparar).

### AC4 — `NotificationBell` muestra texto correcto para `feedback_attributed`

**Given** que un Reviewer tiene una notificación de tipo `feedback_attributed` no leída,
**When** abre el dropdown de la campana de notificaciones,
**Then** la notificación muestra:
- Título: el `projectTitle` del payload
- Subtexto: "Tu feedback fue registrado en v{versionNumber}"

**Given** que el Reviewer hace clic en la notificación `feedback_attributed`,
**When** se procesa la navegación,
**Then** navega a `/communities/{communitySlug}/projects/{projectSlug}` (misma URL que `ai_synthesis_ready` y `new_iteration_ready`).

---

## Tasks de implementación

> Seguir TDD Outside-In: escribir test primero, implementar, verificar verde.

### Task 1 — Helper: `notifyFeedbackAttributed`

Crear `lib/notifications/notify-feedback-attributed.ts`:

```typescript
// lib/notifications/notify-feedback-attributed.ts

import { createAdminClient } from '@/lib/supabase/admin'

interface NotifyFeedbackAttributedParams {
  reviewerId: string
  projectId: string
  projectSlug: string
  projectTitle: string
  versionNumber: number
  communitySlug: string
}

/**
 * Fire-and-forget: notifica al Reviewer que su feedback quedó atribuido
 * a una iteración específica del proyecto.
 *
 * - Usa createAdminClient() (service role) para bypasear RLS en notifications.
 * - No bloquea el response — llamar con void.
 * - Captura errores de BD en console.error sin propagarlos.
 */
export async function notifyFeedbackAttributed(
  params: NotifyFeedbackAttributedParams
): Promise<void> { ... }
```

Lógica interna:
1. `createAdminClient()` para obtener el cliente admin.
2. Insertar en `notifications`: `{ user_id: params.reviewerId, type: 'feedback_attributed', payload: { projectId, projectSlug, projectTitle, versionNumber, communitySlug }, read: false }`.
3. Capturar errores con `console.error` — no propagar.

```typescript
const adminClient = createAdminClient()
const { error } = await adminClient
  .from('notifications')
  .insert({
    user_id: params.reviewerId,
    type: 'feedback_attributed',
    payload: {
      projectId: params.projectId,
      projectSlug: params.projectSlug,
      projectTitle: params.projectTitle,
      versionNumber: params.versionNumber,
      communitySlug: params.communitySlug,
    },
    read: false,
  })
if (error) console.error('[notifyFeedbackAttributed] Error inserting notification:', error)
```

### Task 2 — Tests unitarios de `notifyFeedbackAttributed` (TDD)

Crear `tests/unit/notifications/notifyFeedbackAttributed.test.ts`:

- Test: llama a `adminClient.from('notifications').insert(...)` con el payload correcto.
- Test: el payload incluye `reviewerId` como `user_id`, `type = 'feedback_attributed'` y todos los campos del payload.
- Test: captura errores de BD en `console.error` sin propagar la excepción (`console.error` spy + verificar que no lanza).
- Test: `read: false` en la inserción.

Patrón de mock: igual que los tests de `notifyPreviousReviewers` en `tests/unit/notifications/notifyPreviousReviewers.test.ts` (Story 13.3) — `vi.mock('@/lib/supabase/admin', ...)`.

### Task 3 — Integrar `notifyFeedbackAttributed` en POST /api/feedback

Modificar `app/api/feedback/route.ts`:

Tras crear el feedback (Task 3 de Story 13.4) y obtener `iterationId` e `iterationVersionNumber`:

```typescript
import { notifyFeedbackAttributed } from '@/lib/notifications/notify-feedback-attributed'

// Dentro del handler POST, tras crear el feedback:
if (iterationId !== null && latestIteration !== null) {
  // Necesitamos communitySlug — obtenerlo de la misma forma que en notify-previous-reviewers
  void notifyFeedbackAttributed({
    reviewerId: user.id,
    projectId,
    projectSlug: project.slug,
    projectTitle: project.title,
    versionNumber: latestIteration.versionNumber,
    communitySlug,
  })
}

return NextResponse.json({ data: ... }, { status: 201 })
```

Para obtener `project.slug`, `project.title` y `communitySlug` en la route de feedback:
- Verificar si ya se hace una query al proyecto en el handler actual. Si no existe, añadir SELECT de `projects` con `id, slug, title, community_id` para obtener los datos necesarios.
- El `communitySlug` se obtiene con una segunda query a `communities` igual que en `notify-previous-reviewers`.

> Si la route actual ya hace un SELECT del proyecto para validación (existencia, estado), añadir los campos `slug`, `title`, `community_id` a ese SELECT existente en lugar de hacer una segunda query.

### Task 4 — Tests de integración: verificar que el trigger se dispara

Ampliar `tests/integration/api/feedback-iteration-attribution.test.ts` (ya creado en Story 13.4):

- Test: cuando el feedback tiene `iteration_id` no nulo, `notifyFeedbackAttributed` es llamada con los parámetros correctos (`reviewerId`, `versionNumber`, etc.).
- Test: cuando el feedback tiene `iteration_id = null`, `notifyFeedbackAttributed` NO es llamada.

Patrón: `vi.mock('@/lib/notifications/notify-feedback-attributed')` + `expect(notifyFeedbackAttributed).toHaveBeenCalledWith(expect.objectContaining({ versionNumber: 1 }))`.

### Task 5 — Actualizar comentario en `lib/types/ai.ts`

Modificar la sección de comentario de `NotificationType` en `lib/types/ai.ts`:

```typescript
/**
 * Tipo nominal para los tipos de notificación.
 * Se usa string en lugar de enum para extensibilidad sin deploy de schema.
 *
 * Valores conocidos del sistema:
 *   - 'ai_synthesis_ready'    — síntesis IA completada, notifica al Builder (Story 12.3)
 *   - 'budget_alert'          — presupuesto mensual de IA >= 80% del límite (Story 12.7)
 *   - 'new_iteration_ready'   — nueva versión del proyecto publicada, notifica a reviewers (Story 13.3)
 *   - 'feedback_attributed'   — feedback del Reviewer atribuido a una iteración (Story 13.5)
 */
export type NotificationType = string
```

### Task 6 — Actualizar `NotificationBell` para mostrar texto de `feedback_attributed`

Modificar `components/shared/NotificationBell.tsx`:

Añadir el case `feedback_attributed` a la función `getNotificationSubtext` (ya refactorizada en Story 13.3):

```typescript
case 'feedback_attributed': {
  const version = payload.versionNumber as number | undefined
  return version
    ? `Tu feedback fue registrado en v${version}`
    : 'Tu feedback fue registrado en esta versión'
}
```

### Task 7 — Tests del componente `NotificationBell` para `feedback_attributed`

Modificar `tests/component/shared/NotificationBell.test.tsx` (ya existente):

- Test: para notificación `feedback_attributed`, muestra "Tu feedback fue registrado en v1".
- Test: para notificación `feedback_attributed` sin `versionNumber`, muestra el texto fallback.
- Test: click en notificación `feedback_attributed` navega a la ruta correcta `/communities/{slug}/projects/{slug}`.

---

## Dev Notes

### Por qué `createAdminClient()` en `notifyFeedbackAttributed`

Igual que en `notifyPreviousReviewers` (Story 13.3): la tabla `notifications` tiene RLS que solo permite INSERT con service role. El cliente de sesión del usuario puede leer sus notificaciones propias pero no insertar.

Referencia: `lib/supabase/admin.ts` + `app/api/webhooks/ai-synthesis/route.ts` líneas 303-313.

### Obtener `communitySlug` en POST /api/feedback

Si la route de feedback no hace actualmente un JOIN con la comunidad, se puede hacer la query de `communitySlug` de forma lazy, solo cuando `iterationId !== null`:

```typescript
let communitySlug = ''
if (iterationId !== null) {
  const adminClient = createAdminClient()
  const { data: community } = await adminClient
    .from('communities')
    .select('slug')
    .eq('id', project.community_id)
    .single()
  communitySlug = community?.slug ?? ''
}
```

Esto evita la query extra en el happy path sin iteraciones (la mayoría de feedbacks en proyectos nuevos).

### Módulo `lib/notifications/`

Este directorio ya existe desde Story 13.3 (`notify-previous-reviewers.ts`). `notify-feedback-attributed.ts` es el segundo fichero del módulo. Ambos siguen el mismo contrato: función async de un solo propósito, sin estado, fire-and-forget desde el caller.

### Estructura de ficheros a modificar

```
lib/
  notifications/
    notify-feedback-attributed.ts     ← NUEVO (Task 1)
  types/
    ai.ts                             ← MODIFICAR: comentario NotificationType (Task 5)
app/
  api/
    feedback/
      route.ts                        ← MODIFICAR: trigger fire-and-forget (Task 3)
components/
  shared/
    NotificationBell.tsx              ← MODIFICAR: case feedback_attributed (Task 6)
tests/
  unit/
    notifications/
      notifyFeedbackAttributed.test.ts  ← NUEVO (Task 2)
  integration/
    api/
      feedback-iteration-attribution.test.ts  ← MODIFICAR: añadir tests del trigger (Task 4)
  component/
    shared/
      NotificationBell.test.tsx       ← MODIFICAR: añadir tests feedback_attributed (Task 7)
```

### Referencias de código

- `lib/notifications/notify-previous-reviewers.ts` — patrón idéntico para el helper (Story 13.3)
- `tests/unit/notifications/notifyPreviousReviewers.test.ts` — patrón de tests del helper (Story 13.3)
- `components/shared/NotificationBell.tsx` — función `getNotificationSubtext` a extender (Story 13.3)
- `app/api/feedback/route.ts` — route a modificar (ya modificada en Stories 11.2, 11.3, 12.7, 13.4)
- `lib/supabase/admin.ts` — `createAdminClient()` para service role

---

## Criterio de Done

- [ ] `lib/notifications/notify-feedback-attributed.ts` creado con la función `notifyFeedbackAttributed`.
- [ ] `app/api/feedback/route.ts` dispara `void notifyFeedbackAttributed(...)` cuando `iterationId !== null`.
- [ ] Cuando `iterationId === null`, no se dispara ninguna notificación `feedback_attributed`.
- [ ] `lib/types/ai.ts` comentario de `NotificationType` actualizado con `feedback_attributed`.
- [ ] `components/shared/NotificationBell.tsx` muestra "Tu feedback fue registrado en v{N}" para notificaciones `feedback_attributed`.
- [ ] Tests unitarios de `notifyFeedbackAttributed`: en verde, cubriendo inserción correcta y manejo de errores.
- [ ] Tests de integración verifican que el trigger se dispara con los parámetros correctos.
- [ ] Tests de componente de `NotificationBell`: en verde para el nuevo tipo.
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
