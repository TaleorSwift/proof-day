# Story 11.4: Recordatorio automático de feedback — cron job

Status: ready-for-dev

## Metadata

- **Epic:** 11 — Calidad del Feedback y Reciprocidad
- **Story key:** 11.4
- **Prerequisitos:**
  - Story 11.1 completada (columnas `quality_score` disponibles)
  - Story 12.1 completada (tablas `notifications` y `notification_preferences` disponibles en BD)
- **Phase:** Development
- **Agent:** Homer
- **Flow:** Full Flow (Homer)

## Story

Como Builder con un proyecto live,
quiero recibir una notificación semanal in-app si mi proyecto tiene pocos feedbacks recientes,
para que me mantenga informado del estado de validación y pueda tomar acción (compartir el proyecto, mejorar la descripción, etc.).

## Acceptance Criteria

**AC-1 — Ruta protegida con `CRON_SECRET`**
Dado que existe la ruta `POST /api/cron/feedback-reminder`,
cuando se hace una petición sin el header `Authorization: Bearer <CRON_SECRET>`,
entonces la ruta devuelve `401 Unauthorized` con `{ error: "Unauthorized", code: "CRON_UNAUTHORIZED" }`,
y no se crea ninguna notificación.

**AC-2 — Ruta ejecutable con secret correcto**
Dado que existe la ruta `POST /api/cron/feedback-reminder`,
cuando se hace una petición con el header `Authorization: Bearer <CRON_SECRET>` correcto,
entonces la ruta devuelve `200 OK` con `{ processed: N, skipped: M }` donde N = notificaciones creadas y M = proyectos omitidos (ya notificados esta semana o sin membresía activa).

**AC-3 — Detección de proyectos con pocos feedbacks recientes**
Dado que la ruta cron se ejecuta con el secret correcto,
cuando consulta la BD,
entonces obtiene todos los proyectos en estado `live` cuyo builder ha recibido < 3 feedbacks con `quality_score >= 0.6` en los últimos 7 días (contando desde el momento de ejecución).

**AC-4 — Creación de notificación in-app**
Dado que se detecta un proyecto live con < 3 feedbacks completos en los últimos 7 días,
cuando el builder no tiene ya una notificación de tipo `feedback_reminder` creada en los últimos 7 días para ese proyecto,
entonces se inserta una fila en `notifications` con:
- `user_id = project.builder_id`
- `type = 'feedback_reminder'`
- `payload = { projectId, projectSlug, projectTitle, feedbackCount }`
- `read = false`

**AC-5 — Respeto de `notification_preferences`**
Dado que se detecta un proyecto con pocos feedbacks,
cuando el builder tiene una fila en `notification_preferences` con `type = 'feedback_reminder'` y `email_enabled = false`,
entonces NO se crea la notificación in-app para ese builder,
y el proyecto cuenta como "skipped" en la respuesta.

Nota: `email_enabled` en `notification_preferences` actúa como opt-out global para ese tipo de notificación. Si no existe fila en `notification_preferences` para ese tipo, se considera opt-in por defecto.

**AC-6 — Sin duplicados en la misma semana**
Dado que el cron ya creó una notificación `feedback_reminder` para un proyecto concreto esta semana (en los últimos 7 días),
cuando el cron vuelve a ejecutarse (ej: ejecución doble por error),
entonces NO se crea una segunda notificación para ese proyecto,
y el proyecto cuenta como "skipped".

**AC-7 — `vercel.json` con cron schedule**
Dado que existe `vercel.json` en la raíz del proyecto,
cuando lo inspecciono,
entonces tiene una sección `crons` con una entrada:
```json
{
  "path": "/api/cron/feedback-reminder",
  "schedule": "0 9 * * 1"
}
```
(Lunes a las 9:00 UTC)

**AC-8 — Variable de entorno `CRON_SECRET` documentada**
Dado que el proyecto tiene un fichero `.env.example` o `docs/project/`,
cuando busco la documentación de variables de entorno,
entonces `CRON_SECRET` está listada como variable requerida para el cron job,
y hay instrucciones sobre cómo generarla (ej: `openssl rand -base64 32`).

**AC-9 — Tests pasan al 100%**
Dado que ejecuto `npm run test:unit`,
cuando se procesan los tests de esta story,
entonces todos los tests nuevos pasan al 100% y los tests existentes no se rompen.

## Tasks / Subtasks

- [ ] **T1** — TDD: handler `POST /api/cron/feedback-reminder` — protección (RED → GREEN)
  - [ ] T1.1 Crear `tests/integration/cron/feedback-reminder.test.ts`
  - [ ] T1.2 Escribir test: petición sin header → 401 con `code: "CRON_UNAUTHORIZED"`
  - [ ] T1.3 Escribir test: petición con header incorrecto → 401
  - [ ] T1.4 Crear `app/api/cron/feedback-reminder/route.ts` con verificación del secret
  - [ ] T1.5 Verificar tests en verde

- [ ] **T2** — TDD: lógica de detección de proyectos con pocos feedbacks (RED → GREEN)
  - [ ] T2.1 Escribir test: 0 proyectos live → `{ processed: 0, skipped: 0 }`
  - [ ] T2.2 Escribir test: 1 proyecto live con 0 feedbacks en 7 días → `{ processed: 1, skipped: 0 }`
  - [ ] T2.3 Escribir test: 1 proyecto live con 3+ feedbacks completos en 7 días → `{ processed: 0, skipped: 1 }` (tiene suficiente, se omite)
  - [ ] T2.4 Escribir test: 1 proyecto con notif ya creada esta semana → `{ processed: 0, skipped: 1 }`
  - [ ] T2.5 Implementar consulta Supabase para obtener proyectos live + conteo de feedbacks recientes
  - [ ] T2.6 Verificar tests en verde

- [ ] **T3** — TDD: respeto de `notification_preferences` (RED → GREEN)
  - [ ] T3.1 Escribir test: builder con `notification_preferences.feedback_reminder = false` → notificación NO creada, proyecto skipped
  - [ ] T3.2 Escribir test: builder sin fila en `notification_preferences` → notificación creada (opt-in por defecto)
  - [ ] T3.3 Implementar consulta de preferences en el handler
  - [ ] T3.4 Verificar tests en verde

- [ ] **T4** — TDD: sin duplicados en la misma semana (RED → GREEN)
  - [ ] T4.1 Escribir test: notificación ya existe para ese proyecto en los últimos 7 días → `skipped += 1`, no inserta
  - [ ] T4.2 Implementar consulta de notificaciones recientes antes del insert
  - [ ] T4.3 Verificar tests en verde

- [ ] **T5** — Crear handler completo con respuesta `{ processed, skipped }`
  - [ ] T5.1 Extraer lógica de negocio a `lib/services/feedbackReminder.service.ts` para testability
  - [ ] T5.2 Handler llama al service, retorna JSON
  - [ ] T5.3 Añadir logging básico (console.log del resultado) para trazabilidad en Vercel

- [ ] **T6** — `vercel.json` — añadir cron entry
  - [ ] T6.1 Verificar si `vercel.json` ya existe en la raíz
  - [ ] T6.2 Añadir (o crear) la entrada `crons` con el schedule `"0 9 * * 1"`

- [ ] **T7** — Documentación de variable de entorno
  - [ ] T7.1 Añadir `CRON_SECRET` al `.env.example` con comentario explicativo
  - [ ] T7.2 Documentar en `docs/project/modules/` o fichero de env vars del proyecto

## Dev Notes

### Contexto de negocio

El cron job sirve como sistema de retención pasiva. Si un Builder publica un proyecto y no recibe feedback en una semana, puede que haya olvidado promoverlo o que la comunidad no lo haya visto. La notificación in-app le recuerda que tiene un proyecto live esperando feedback.

**Umbral de "pocos feedbacks":** < 3 feedbacks con `quality_score >= 0.6` en los últimos 7 días. Si el proyecto tiene muchos feedbacks de baja calidad, el cron los ignora (no cuentan como "suficiente feedback").

**Threshold hardcodeado vs configurable:** Para esta story el threshold de 3 feedbacks es constante en el código (`MIN_COMPLETE_FEEDBACKS_PER_WEEK = 3`). No se conecta con `community.reciprocity_threshold` — son conceptos distintos.

### Arquitectura / Componentes

**Ficheros a crear:**

| Fichero | Descripción |
|---|---|
| `app/api/cron/feedback-reminder/route.ts` | Handler POST con verificación de `CRON_SECRET` |
| `lib/services/feedbackReminder.service.ts` | Lógica de negocio extraída: detectar proyectos, filtrar, crear notifs |

**Ficheros a modificar:**

| Fichero | Cambio |
|---|---|
| `vercel.json` | Añadir entrada `crons` con schedule semanal |
| `.env.example` | Añadir `CRON_SECRET=` con comentario |

### Estrategia de implementación

**Verificación del secret:**
```typescript
const secret = process.env.CRON_SECRET
const authHeader = request.headers.get('authorization')
if (!secret || authHeader !== `Bearer ${secret}`) {
  return NextResponse.json({ error: 'Unauthorized', code: 'CRON_UNAUTHORIZED' }, { status: 401 })
}
```

**Constantes del service:**
```typescript
const MIN_COMPLETE_FEEDBACKS_PER_WEEK = 3
const QUALITY_THRESHOLD = 0.6  // feedbacks con score >= este valor cuentan como completos
const DAYS_LOOKBACK = 7
const NOTIFICATION_TYPE = 'feedback_reminder'
```

**Consulta Supabase para proyectos live con pocos feedbacks:**

El servicio necesita:
1. `SELECT projects.id, projects.slug, projects.title, projects.builder_id FROM projects WHERE status = 'live'`
2. Para cada proyecto, contar feedbacks recientes completos: `SELECT COUNT(*) FROM feedbacks WHERE project_id = ? AND created_at >= (now() - '7 days'::interval) AND quality_score >= 0.6`
3. Filtrar los que tienen < 3

Para optimizar, se puede hacer con un JOIN o función RPC en Supabase. Para la primera versión, está bien hacerlo en el service con queries individuales (los proyectos live son pocos en esta fase del producto).

**Verificación de preferencias:**
```typescript
const { data: pref } = await supabase
  .from('notification_preferences')
  .select('email_enabled')
  .eq('user_id', builderId)
  .eq('type', NOTIFICATION_TYPE)
  .maybeSingle()

// Si no existe pref → opt-in por defecto
if (pref !== null && pref.email_enabled === false) {
  skipped++
  continue
}
```

**Verificación de duplicados:**
```typescript
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
const { data: existingNotif } = await supabase
  .from('notifications')
  .select('id')
  .eq('user_id', builderId)
  .eq('type', NOTIFICATION_TYPE)
  .contains('payload', { projectId })
  .gte('created_at', weekAgo)
  .maybeSingle()
```

**TDD — Mockear Supabase en tests:**
Usar el patrón de mock ya establecido en el proyecto (ver tests existentes en `tests/integration/`). Crear un mock de Supabase que devuelve los datos esperados para cada escenario.

**Nota sobre el campo `email_enabled` en `notification_preferences`:**
El nombre del campo es heredado del diseño de Epic 12 (Story 12.1). Para notificaciones in-app, actúa como flag de opt-out general: si `email_enabled = false`, no se envían notificaciones de ese tipo (ni email ni in-app). Esto es un diseño simplificado — en el futuro podría separarse en `in_app_enabled` y `email_enabled`.

### Tests a crear

```
tests/integration/cron/feedback-reminder.test.ts  (nuevo)
```

### Referencia a tablas de BD (Story 12.1)

```sql
-- notifications (story 12.1)
id         uuid PK DEFAULT gen_random_uuid()
user_id    uuid NOT NULL FK → auth.users.id ON DELETE CASCADE
type       text NOT NULL  -- 'feedback_reminder'
payload    jsonb NOT NULL DEFAULT '{}'  -- { projectId, projectSlug, projectTitle, feedbackCount }
read       bool NOT NULL DEFAULT false
created_at timestamptz DEFAULT now()

-- notification_preferences (story 12.1)
id           uuid PK DEFAULT gen_random_uuid()
user_id      uuid NOT NULL FK → auth.users.id ON DELETE CASCADE
type         text NOT NULL  -- 'feedback_reminder'
email_enabled bool NOT NULL DEFAULT true
UNIQUE (user_id, type)
```
