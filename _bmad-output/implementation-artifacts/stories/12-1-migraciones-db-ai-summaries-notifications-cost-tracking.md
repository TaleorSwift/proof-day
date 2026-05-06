# Story 12.1 — Migraciones DB: ai_summaries, notifications, notification_preferences, ai_cost_tracking

## Metadata
- **Epic:** 12 — AI Summaries & Notifications
- **Story key:** 12.1
- **Phase:** Done
- **Agent:** —
- **Flow:** Full Flow (Homer)

## User Story

Como desarrollador,
quiero disponer de las tablas de base de datos necesarias para almacenar resúmenes IA, notificaciones y tracking de costes de IA,
para que las stories de funcionalidad de Epic 12 puedan construirse sobre una base de datos sólida con RLS correctamente configurado.

## Acceptance Criteria

**AC1 — Tabla ai_summaries**
Given que se aplica la migración 027
When inspecciono la tabla `ai_summaries`
Then existe con columnas: `id` (uuid PK), `project_id` (uuid UNIQUE, FK → projects.id ON DELETE CASCADE), `content` (text NOT NULL), `feedback_count_at_generation` (int NOT NULL DEFAULT 0), `model` (text NOT NULL), `created_at` (timestamptz DEFAULT now()), `updated_at` (timestamptz DEFAULT now())

**AC2 — Tabla notifications**
Given que se aplica la migración 028
When inspecciono la tabla `notifications`
Then existe con columnas: `id` (uuid PK DEFAULT gen_random_uuid()), `user_id` (uuid NOT NULL, FK → auth.users.id ON DELETE CASCADE), `type` (text NOT NULL), `payload` (jsonb NOT NULL DEFAULT '{}'), `read` (bool NOT NULL DEFAULT false), `created_at` (timestamptz DEFAULT now())

**AC3 — Tabla notification_preferences**
Given que se aplica la migración 029
When inspecciono la tabla `notification_preferences`
Then existe con columnas: `id` (uuid PK DEFAULT gen_random_uuid()), `user_id` (uuid NOT NULL, FK → auth.users.id ON DELETE CASCADE), `type` (text NOT NULL), `email_enabled` (bool NOT NULL DEFAULT true)
And existe UNIQUE constraint en `(user_id, type)`

**AC4 — Tabla ai_cost_tracking**
Given que se aplica la migración 030
When inspecciono la tabla `ai_cost_tracking`
Then existe con columnas: `id` (uuid PK DEFAULT gen_random_uuid()), `month` (varchar(7) UNIQUE NOT NULL), `tokens_input` (bigint NOT NULL DEFAULT 0), `tokens_output` (bigint NOT NULL DEFAULT 0), `estimated_cost_usd` (numeric(10,6) NOT NULL DEFAULT 0), `synthesis_count` (int NOT NULL DEFAULT 0), `updated_at` (timestamptz DEFAULT now())

**AC5 — RLS policies (migración 031)**
Given que se aplican las políticas RLS de la migración 031
When un usuario autenticado consulta `notifications`
Then solo puede SELECT/UPDATE sus propias notificaciones (auth.uid() = user_id)

When un usuario autenticado consulta `notification_preferences`
Then solo puede SELECT/INSERT/UPDATE/DELETE sus propias preferencias (auth.uid() = user_id)

When cualquier usuario consulta `ai_summaries`
Then puede hacer SELECT de todos los registros (proyectos públicos dentro de comunidad)

When cualquier rol consulta `ai_cost_tracking`
Then solo service_role puede acceder (no hay política pública)

**AC6 — Tipos TypeScript**
Given que existe `lib/types/ai.ts`
When importo los tipos
Then encuentro: `AISummary`, `AISummaryRow`, `Notification`, `NotificationRow`, `NotificationType`
And las funciones mapper `aiSummaryFromRow()` y `notificationFromRow()` mapean correctamente los campos snake_case → camelCase

**AC7 — Tests**
Given que ejecuto `npm run test:unit`
When se procesan los tests de `tests/unit/ai/`
Then todos los tests de mappers y schema pasan al 100%

## Dev Notes

### Migraciones SQL

- 027: `supabase/migrations/027_create_ai_summaries.sql`
- 028: `supabase/migrations/028_create_notifications.sql`
- 029: `supabase/migrations/029_create_notification_preferences.sql`
- 030: `supabase/migrations/030_create_ai_cost_tracking.sql`
- 031: `supabase/migrations/031_rls_ai_tables.sql`

### Tipos TypeScript

- `lib/types/ai.ts` — AISummary, AISummaryRow, Notification, NotificationRow, NotificationType, mappers

### RLS summary

- `notifications` → auth.uid() = user_id (SELECT, UPDATE propio)
- `notification_preferences` → auth.uid() = user_id (CRUD propio)
- `ai_summaries` → SELECT público (miembros autenticados de la comunidad)
- `ai_cost_tracking` → service_role únicamente

### NO en esta story

- No crear API routes
- No crear componentes React
- No crear server actions

## Tasks

- [x] Task 1: Crear migration 027 — `ai_summaries`
- [x] Task 2: Crear migration 028 — `notifications`
- [x] Task 3: Crear migration 029 — `notification_preferences`
- [x] Task 4: Crear migration 030 — `ai_cost_tracking`
- [x] Task 5: Crear migration 031 — RLS policies para las 4 tablas
- [x] Task 6: Crear `lib/types/ai.ts` con tipos y mappers
- [x] Task 7: Crear tests `tests/unit/ai/aiTypes.test.ts`
- [x] Task 8: Verificar que todos los tests pasan

## Dev Agent Record

### Decisiones tomadas
- Las migraciones 024-026 no existen aún (corresponden a Epic 11, no implementado). Se usan 027-031 según especificación del Dev Notes.
- `NotificationType` es un tipo `string` nominal para extensibilidad (no enum fijo), las stories siguientes añadirán los valores concretos.
- `ai_cost_tracking` usa `numeric(10,6)` para `estimated_cost_usd` para evitar errores de punto flotante en costes.

### Ficheros creados/modificados

**Creados:**
- `supabase/migrations/027_create_ai_summaries.sql`
- `supabase/migrations/028_create_notifications.sql`
- `supabase/migrations/029_create_notification_preferences.sql`
- `supabase/migrations/030_create_ai_cost_tracking.sql`
- `supabase/migrations/031_rls_ai_tables.sql`
- `lib/types/ai.ts`
- `tests/unit/ai/aiTypes.test.ts`
- `_bmad-output/implementation-artifacts/stories/12-1-migraciones-db-ai-summaries-notifications-cost-tracking.md`

**Tests:** 33 nuevos tests, 1440/1440 en suite completa. 0 fallos.

## File List

- `supabase/migrations/027_create_ai_summaries.sql`
- `supabase/migrations/028_create_notifications.sql`
- `supabase/migrations/029_create_notification_preferences.sql`
- `supabase/migrations/030_create_ai_cost_tracking.sql`
- `supabase/migrations/031_rls_ai_tables.sql`
- `lib/types/ai.ts`
- `tests/unit/ai/aiTypes.test.ts`

## Senior Developer Review (AI)

**Veredicto:** APPROVED
**Fecha:** 2026-05-06
**Reviewer:** Homer (CR)
**PR:** #93

**Resumen:** 7 findings — 0 CRITICAL, 0 HIGH, 2 MEDIUM, 4 LOW, 1 INFO.
Todos los ACs (1-7) verificados contra implementación real. 33/33 tests en verde (confirmado en ejecución).

### MEDIUM

**[MEDIUM-1] Índices redundantes en tablas con UNIQUE constraint**
- `027_create_ai_summaries.sql:19` — `ai_summaries_project_id_idx` duplica el índice del UNIQUE constraint en `project_id`
- `030_create_ai_cost_tracking.sql:21` — `ai_cost_tracking_month_idx` duplica el índice del UNIQUE constraint en `month`
- PostgreSQL crea automáticamente un índice B-tree cuando se declara UNIQUE. Los índices manuales añadidos generan overhead de storage y write-amplification sin beneficio de rendimiento.

**[MEDIUM-2] `docs/project/modules/ai-summaries.md` — Ficheros clave incompletos**
- La sección `## Ficheros clave` omite `029_create_notification_preferences.sql` y `030_create_ai_cost_tracking.sql`
- Stories 12.2-12.7 que consulten este módulo tendrán una visión incompleta de la infraestructura de DB.

### LOW

**[LOW-1] `NotificationType = string` — Sin documentación inline de valores futuros**
- `lib/types/ai.ts:12` — No hay comentario que apunte a qué story define los valores concretos.

**[LOW-2] `parseFloat` sin guard NaN en `aiCostTrackingFromRow`**
- `lib/types/ai.ts:148` — `parseFloat(row.estimated_cost_usd)` retorna NaN si recibe string inválido. La columna SQL tiene NOT NULL pero el tipo TS no refleja ese invariante. No hay test de cobertura de este edge case.

**[LOW-3] `Notification` — Shadowing del DOM global**
- `lib/types/ai.ts:57` — `tsconfig.json` incluye `"lib": ["dom"]`. El DOM define `interface Notification` (Web Notifications API). La exportación local sombrea el global en el scope del módulo. No genera error TS pero puede causar confusión DX. Recomendación: renombrar a `AppNotification` o `UserNotification`.

**[LOW-4] AC6 no menciona `NotificationPreference`, `AICostTracking` ni sus mappers**
- La especificación del AC6 queda desactualizada respecto a lo implementado (que es correcto y más completo).

### INFO

**[INFO-1] Gap 024-026 en migraciones** — Intencional. Documentado en Dev Agent Record. Supabase no requiere secuencias continuas.
**[INFO-2] `notification_preferences` sin `created_at`** — Decisión de diseño válida para tabla de preferencias. Consistente entre SQL y tipo TS.
