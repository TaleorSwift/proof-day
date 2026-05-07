# Story 12.3 — Webhook síntesis IA: trigger + upsert + notificación

## Metadata
- **Epic:** 12 — AI Summaries & Notifications
- **Story key:** 12.3
- **Phase:** ready-for-dev
- **Agent:** Homer
- **Flow:** Full Flow (Homer)
- **Prerrequisito:** Story 12.2 Done (lib/ai disponible)

## User Story

Como sistema,
quiero una route `POST /api/webhooks/ai-synthesis` que orqueste la síntesis IA de feedbacks de un proyecto,
para que el resumen generado por Claude se persista en `ai_summaries`, se registre el coste y el Builder reciba una notificación in-app cuando su síntesis esté lista.

## Acceptance Criteria

**AC1 — Autenticación por WEBHOOK_SECRET**
Given que llamo a `POST /api/webhooks/ai-synthesis` sin el header `x-webhook-secret`
Then retorna 401 `{error: 'Unauthorized'}`
Given que llamo con un valor incorrecto en `x-webhook-secret`
Then retorna 401 `{error: 'Unauthorized'}`
And la comparación usa `timingSafeEqual` (mismo patrón que cron jobs del proyecto) para evitar timing attacks

**AC2 — Validación de feedbacks suficientes**
Given que envío `{projectId}` con un proyecto que tiene menos de 3 feedbacks con `quality_score >= 0.6`
Then retorna 400 `{error: 'INSUFFICIENT_FEEDBACKS', count: N}` donde N es el número actual de feedbacks completos

**AC3 — Skip si síntesis reciente**
Given que el proyecto ya tiene un registro en `ai_summaries` con `updated_at` de hace menos de 24 horas
When llamo al webhook con ese `projectId`
Then retorna 200 `{skipped: true, reason: 'RECENT_SUMMARY'}`
And NO se llama a Claude ni se genera nueva síntesis

**AC4 — Control de presupuesto diario**
Given que el gasto diario acumulado supera `AI_DAILY_BUDGET_USD`
When llamo al webhook
Then retorna 429 `{error: 'BUDGET_EXCEEDED'}`
And NO se llama a Claude

**AC5 — Síntesis exitosa y upsert en ai_summaries**
Given que el proyecto tiene >= 3 feedbacks completos, no hay síntesis reciente y hay presupuesto
When llamo al webhook con `{projectId}` válido
Then se llama a `synthesizeFeedbacks()` con los feedbacks del proyecto y los datos del proyecto
And se hace upsert en `ai_summaries` (`on_conflict: project_id`) con:
  - `content` — el `summaryText` devuelto por Claude (texto completo incluyendo los key insights formateados)
  - `feedback_count_at_generation` — número de feedbacks completos usados
  - `model` — el modelo usado (`claude-sonnet-4-6`)
And se actualiza `updated_at` a now()

**AC6 — Tracking de coste**
Given que la síntesis se genera con éxito
When se completa el webhook
Then se llama a `trackCost()` con los tokens y coste de la llamada a Claude

**AC7 — Notificación in-app al Builder**
Given que la síntesis se genera con éxito
When se completa el upsert
Then se inserta una fila en `notifications` con:
  - `user_id` = `project.builder_id`
  - `type` = `'ai_synthesis_ready'`
  - `payload` = `{projectId, projectSlug, projectTitle}`
  - `read` = `false`

**AC8 — Uso de service role client**
Given que el webhook opera en contexto de servidor sin sesión de usuario
When accede a las tablas `ai_summaries`, `notifications` y `ai_cost_tracking`
Then usa el service role client de Supabase (no el cookie client)
And esto permite saltarse las políticas RLS que bloquearían al cliente anónimo

**AC9 — Respuesta exitosa**
Given que todo el flujo se completa sin errores
Then retorna 200 `{success: true, projectId, summaryId}`

**AC10 — Tests**
Given que ejecuto `npm run test:unit`
When se procesan los tests de `tests/unit/webhooks/`
Then hay tests para: 401 sin secret, 400 insuficientes feedbacks, 429 budget excedido, 200 skip por síntesis reciente, 200 OK con síntesis generada
And los tests mockean `lib/ai` y el cliente Supabase service role

## Tasks

- [ ] Task 1: Crear `app/api/webhooks/ai-synthesis/route.ts` — route handler con validación WEBHOOK_SECRET via timingSafeEqual
- [ ] Task 2: Implementar lógica de verificación: >= 3 feedbacks con quality_score >= 0.6 para el projectId recibido
- [ ] Task 3: Implementar lógica de skip: consultar `ai_summaries` por project_id, comparar `updated_at` con now() - 24h
- [ ] Task 4: Implementar llamada a `checkDailyBudget()` y retorno 429 si excedido
- [ ] Task 5: Implementar llamada a `synthesizeFeedbacks()` con los feedbacks y datos del proyecto
- [ ] Task 6: Implementar upsert en `ai_summaries` via service role client
- [ ] Task 7: Implementar llamada a `trackCost()` post-síntesis
- [ ] Task 8: Implementar insert en `notifications` via service role client con payload `{projectId, projectSlug, projectTitle}`
- [ ] Task 9: Añadir `WEBHOOK_SECRET` a `.env.example` con comentario
- [ ] Task 10: Crear `tests/unit/webhooks/ai-synthesis.test.ts` con los 5 casos del AC10

## Dev Notes

### Ficheros a crear
- `app/api/webhooks/ai-synthesis/route.ts`
- `tests/unit/webhooks/ai-synthesis.test.ts`

### Ficheros a modificar
- `.env.example` — añadir `WEBHOOK_SECRET` si no existe (verificar si ya está para los cron jobs)

### CRITICO: Service role client de Supabase
Este webhook corre en contexto de servidor sin sesión de usuario autenticado. Las tablas `ai_summaries`, `notifications` y `ai_cost_tracking` tienen RLS que bloquearía un cliente anónimo o cookie-based:
- `ai_summaries` — no tiene política INSERT/UPDATE pública (solo service_role bypasea)
- `notifications` — no tiene política INSERT pública (solo service_role)
- `ai_cost_tracking` — sin políticas públicas en absoluto

Importar y usar el service role client:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```
NO usar `createClient` de `@/lib/supabase/server` para las operaciones de escritura del webhook.

### Patrón timingSafeEqual (referencia: cron jobs del proyecto)
```typescript
import { timingSafeEqual } from 'crypto'

function verifySecret(provided: string, expected: string): boolean {
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
```

### Tipos de referencia (`lib/types/ai.ts`)
- `AISummaryRow` — para tipar el resultado del SELECT en `ai_summaries`
- `aiSummaryFromRow()` — disponible si se necesita deserializar para la respuesta
- `NotificationRow` — para tipar el INSERT en `notifications`

### Tipos de referencia (`lib/ai/index.ts` — Story 12.2)
- `synthesizeFeedbacks(feedbacks, project)` — devuelve `AISynthesisResult`
- `checkDailyBudget(communityId)` — devuelve `Promise<boolean>`
- `trackCost(input)` — devuelve `Promise<void>`

### Estructura del body esperado
```typescript
interface WebhookBody {
  projectId: string
}
```
Validar con Zod o validación manual. Retornar 400 si falta `projectId`.

### Feedbacks para síntesis
Consultar feedbacks completos del proyecto:
```sql
SELECT id, text_responses, quality_score, created_at
FROM feedbacks
WHERE project_id = $1 AND quality_score >= 0.6
ORDER BY created_at DESC
```
Usar el mismo `supabaseAdmin` (service role) para esta query, ya que la RLS de feedbacks puede requerir contexto autenticado.

### Datos del proyecto necesarios
Para llamar a `synthesizeFeedbacks` se necesita al menos `{id, title, builder_id, slug}`. Consultar via service role client.

### Patrones del proyecto
- No usar Tailwind — este es un módulo de API sin UI
- TDD Outside-In: test primero, implementación después
- Hexagonal: la route es el adaptador de entrada; delega a `lib/ai/` (puerto de salida hacia Claude)
- Los imports de `lib/ai` deben ser desde el barrel `@/lib/ai`
