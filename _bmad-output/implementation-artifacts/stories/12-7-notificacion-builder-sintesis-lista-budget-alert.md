# Story 12.7 — Notificación Builder: síntesis lista + budget alert

## Metadata
- **Epic:** 12 — AI Summaries & Notifications
- **Story key:** 12.7
- **Phase:** ready-for-dev
- **Agent:** Homer
- **Flow:** Full Flow (Homer)
- **Prerrequisito:** Stories 12.3, 12.5 y 12.6 Done

## User Story

Como sistema,
quiero que el webhook de síntesis se dispare automáticamente cuando un proyecto alcanza el threshold de feedbacks completos y que se emita una alerta cuando el presupuesto diario de IA se acerca al límite,
para que el flujo de síntesis sea completamente automático sin intervención manual y los administradores tengan visibilidad del gasto.

## Acceptance Criteria

**AC1 — Trigger automático del webhook desde POST /api/feedback**
Given que un Reviewer envía un feedback que pasa la validación y se persiste correctamente
When ese feedback hace que el proyecto alcance exactamente 3 feedbacks con `quality_score >= 0.6`
Then `POST /api/webhooks/ai-synthesis` se dispara automáticamente de forma asíncrona (fire-and-forget) con `{projectId}`
And el disparo usa `fetch` con el header `x-webhook-secret` correcto
And el webhook se dispara sin bloquear la respuesta del POST /api/feedback (la respuesta al Reviewer retorna 201 con normalidad)
Given que el feedback es el número 4 completo (o más)
Then el webhook NO se dispara (el proyecto ya tiene >= 3 feedbacks, la síntesis fue o será gestionada por el webhook anterior)

**AC2 — Conteo exacto al umbral**
Given que el proyecto tiene 2 feedbacks completos antes de este feedback
When se crea el nuevo feedback con `quality_score >= 0.6`
Then el conteo post-insert en la base de datos es exactamente 3
And se dispara el webhook
Given que el proyecto tiene 3 o más feedbacks completos antes de este feedback
When se crea un nuevo feedback completo
Then el webhook NO se dispara

**AC3 — Budget alert al superar el 80% del límite diario**
Given que `checkDailyBudget()` se llama durante el procesamiento del webhook
When el coste acumulado supera el 80% de `AI_DAILY_BUDGET_USD` pero no el 100%
Then se inserta una notificación de tipo `budget_alert` en `notifications` para cada admin de la comunidad
And el payload es `{communityId, currentCostUsd, limitUsd, percentUsed}`
And el tipo es `'budget_alert'`
And esta notificación se crea como máximo una vez por día por comunidad (no crear duplicados si ya hay una de hoy)
Given que el coste supera el 100% (budget excedido)
Then el webhook retorna 429 como ya especifica Story 12.3 (AC4)
And NO se crea notificación budget_alert adicional (el 429 ya detiene el procesamiento)

**AC4 — Identificación de admins de la comunidad**
Given que se debe crear la budget_alert
When se buscan los destinatarios
Then se consultan los usuarios con rol `admin` en la comunidad del proyecto
And si no hay admins identificables, se omite la notificación sin error

**AC5 — Los tipos de notificación están documentados**
Given que reviso `lib/types/ai.ts`
When busco los valores de `NotificationType`
Then encuentro un comentario que documenta los valores concretos del Epic 12:
  - `'ai_synthesis_ready'` — síntesis IA lista para el Builder (Story 12.3)
  - `'budget_alert'` — alerta de presupuesto para admins (Story 12.7)

**AC6 — Tests**
Given que ejecuto `npm run test:unit`
When se procesan los tests de POST /api/feedback con la lógica de trigger
Then hay tests para:
  - Feedback que alcanza exactamente 3 completos: webhook disparado
  - Feedback que es el 4to completo: webhook NO disparado
  - Feedback incompleto (quality_score < 0.6): webhook NO disparado
  - El disparo es fire-and-forget (el test verifica que fetch fue llamado, no que completó)
When se procesan los tests de checkDailyBudget con budget alert
Then hay tests para:
  - Coste en 79%: no budget_alert
  - Coste en 81%: budget_alert creada (mock de insert en notifications)
  - budget_alert no se duplica si ya hay una de hoy

## Tasks

- [ ] Task 1: Modificar `app/api/feedback/route.ts` (POST) — después del `feedbackRepo.create` exitoso, contar feedbacks completos del proyecto. Si el conteo es exactamente 3, disparar `fetch` al webhook asíncrono (fire-and-forget)
- [ ] Task 2: Crear helper `lib/ai/triggerSynthesisWebhook.ts` — función `triggerSynthesisWebhook(projectId: string): void` que encapsula el `fetch` fire-and-forget con el header correcto. Importar en la route de feedback.
- [ ] Task 3: Modificar `lib/ai/budgetChecker.ts` — añadir lógica de budget alert: si coste >= 80% del límite, insertar notificación de tipo `budget_alert` para admins de la comunidad (verificar duplicado del día antes de insertar)
- [ ] Task 4: Añadir comentario en `lib/types/ai.ts` documentando los valores de `NotificationType` (AC5)
- [ ] Task 5: Crear `tests/unit/api/feedback-trigger.test.ts` — tests del trigger automático (AC6, primer bloque)
- [ ] Task 6: Añadir tests de budget alert en `tests/unit/ai/budgetChecker.test.ts` (AC6, segundo bloque)

## Dev Notes

### Ficheros a crear
- `lib/ai/triggerSynthesisWebhook.ts`
- `tests/unit/api/feedback-trigger.test.ts`

### Ficheros a modificar
- `app/api/feedback/route.ts` — añadir lógica de trigger tras el create exitoso
- `lib/ai/budgetChecker.ts` — añadir budget alert al 80%
- `lib/types/ai.ts` — documentar valores de NotificationType

### CRITICO: Service role client de Supabase
La función `triggerSynthesisWebhook` y la lógica de budget alert en `budgetChecker` necesitan el service role client para:
1. Consultar el conteo de feedbacks completos post-insert (el cliente con cookies del usuario ya tiene acceso via RLS, verificar)
2. Insertar la notificación `budget_alert` en `notifications` (INSERT solo por service_role)
3. Consultar admins de la comunidad

Para el insert de `budget_alert` en `notifications`, usar siempre el service role client:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### Lógica de trigger en POST /api/feedback (route.ts)
Añadir después del `feedbackRepo.create` exitoso:
```typescript
// Story 12.7 — disparar webhook de síntesis si se alcanza el threshold
const { count: completeCount } = await feedbackRepo.countCompleteByProject(projectId)
if (completeCount === 3) {
  triggerSynthesisWebhook(projectId) // fire-and-forget
}
```
El método `countCompleteByProject` debe añadirse a `feedback.repository.ts` o la query puede hacerse inline. Decidir e implementar consistentemente. Usar threshold `quality_score >= 0.6` (mismo que el webhook).

### triggerSynthesisWebhook — patrón fire-and-forget
```typescript
// lib/ai/triggerSynthesisWebhook.ts
export function triggerSynthesisWebhook(projectId: string): void {
  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/ai-synthesis`
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-secret': process.env.WEBHOOK_SECRET ?? '',
    },
    body: JSON.stringify({ projectId }),
  }).catch((err) => {
    console.error('[triggerSynthesisWebhook] fetch failed:', err)
  })
}
```
No usar `await` — el objetivo es no bloquear la respuesta al Reviewer.

### Budget alert — deduplicación diaria
Para evitar crear múltiples alertas el mismo día:
```typescript
const today = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'
const { data: existingAlert } = await supabaseAdmin
  .from('notifications')
  .select('id')
  .eq('type', 'budget_alert')
  .gte('created_at', `${today}T00:00:00Z`)
  .maybeSingle()

if (!existingAlert) {
  // insertar budget_alert
}
```

### Consulta de admins de la comunidad
Depende del schema de roles/members del proyecto. Buscar la tabla de membresía (`community_members` o similar) con la columna de rol. Si no hay tabla de admins, usar el `created_by` de la comunidad como fallback. Documentar la decisión en el Dev Agent Record.

### Nota sobre feedback.repository.ts
`countCompleteByProject` debe añadirse al repositorio de feedback:
```typescript
async countCompleteByProject(projectId: string, qualityThreshold = 0.6) {
  return supabase
    .from('feedbacks')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .gte('quality_score', qualityThreshold)
}
```

### Tipos de referencia (`lib/types/ai.ts`)
- `Notification` — para tipar el insert de `budget_alert`
- `NotificationType` — el tipo nominal; documentar `'ai_synthesis_ready'` y `'budget_alert'` como comentario

### Patrones del proyecto
- TDD Outside-In: los tests del trigger deben escribirse antes de modificar la route de feedback
- No bloquear nunca la respuesta al Reviewer con lógica de síntesis IA
- Fire-and-forget: `fetch()` sin `await` + `.catch()` para logging de errores silenciosos
