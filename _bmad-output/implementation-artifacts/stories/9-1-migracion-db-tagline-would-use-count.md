# Story 9.1: Migración DB — tagline y would_use_count

Status: implementation-complete

## Story

Como desarrollador,
quiero añadir el campo `tagline` a proyectos y un contador `would_use_count` con trigger automático,
para que las vistas del feed y el detalle de proyecto puedan mostrar esos datos sin cálculos ad-hoc en tiempo de render.

## Acceptance Criteria

1. **[AC-1]** Dado que ejecuto la migración 014, cuando inspecciono la tabla `projects`, entonces existe la columna `tagline text` (nullable) y los tipos TypeScript en `lib/types/projects.ts` reflejan el nuevo campo (`tagline: string | null` en `Project` y `ProjectRow`).

2. **[AC-2]** Dado que ejecuto la migración 015, cuando inspecciono la tabla `projects`, entonces existe la columna `would_use_count integer NOT NULL DEFAULT 0` y existe el trigger `feedbacks_recompute_would_use` sobre la tabla `feedbacks`.

3. **[AC-3]** Dado que se inserta un feedback donde `scores->>'p2' = '3'` (score p2 = Yes = 3), cuando el trigger se dispara en INSERT, entonces `would_use_count` del proyecto correspondiente se incrementa en 1.

4. **[AC-4]** Dado que se elimina un feedback donde `scores->>'p2' = '3'`, cuando el trigger se dispara en DELETE, entonces `would_use_count` se decrementa correctamente (no queda por debajo de 0).

5. **[AC-5]** Dado que hay feedbacks existentes al aplicar la migración 015, cuando se ejecuta el backfill incluido en la misma migración, entonces `would_use_count` de cada proyecto refleja el recuento real de feedbacks con `(scores->>'p2')::int = 3`.

6. **[AC-6]** Dado que se actualiza un feedback cambiando el score p2, cuando el trigger se dispara en UPDATE, entonces `would_use_count` del proyecto se recalcula correctamente (incrementa si p2 pasa a 3, decrementa si p2 deja de ser 3).

## Tasks / Subtasks

- [x] **T1** — Crear migración 014 (tagline) (AC: 1)
  - [x] T1.1 Crear `supabase/migrations/014_add_tagline_to_projects.sql`
  - [x] T1.2 Añadir `ADD COLUMN IF NOT EXISTS tagline text` a la tabla `projects`
  - [x] T1.3 Aplicar localmente: migración aplicada con `supabase db push --local`

- [x] **T2** — Actualizar tipos TypeScript para tagline (AC: 1)
  - [x] T2.1 En `lib/types/projects.ts`, añadir `tagline: string | null` a `Project`
  - [x] T2.2 En `lib/types/projects.ts`, añadir `tagline: string | null` a `ProjectRow`
  - [x] T2.3 En `projectFromRow()`, mapear `tagline: row.tagline`

- [x] **T3** — Crear migración 015 (would_use_count + trigger) (AC: 2-6)
  - [x] T3.1 Crear `supabase/migrations/015_add_would_use_counter.sql`
  - [x] T3.2 Añadir columna `would_use_count integer NOT NULL DEFAULT 0`
  - [x] T3.3 Crear función helper `feedback_would_use(scores jsonb)` + función trigger
  - [x] T3.4 Crear trigger `feedbacks_recompute_would_use` AFTER INSERT OR UPDATE OF scores OR DELETE ON feedbacks
  - [x] T3.5 Backfill inicial aplicado (usando `feedback_would_use`)
  - [x] T3.6 Migración aplicada con `supabase db push --local`
  - Nota: seed usa `scores.p2 = 'yes'` en lugar de int 3 — función helper maneja ambos formatos

- [x] **T4** — Actualizar tipos TypeScript para would_use_count (AC: 2)
  - [x] T4.1 En `lib/types/projects.ts`, añadir `wouldUseCount: number` a `Project`
  - [x] T4.2 En `lib/types/projects.ts`, añadir `would_use_count: number` a `ProjectRow`
  - [x] T4.3 En `projectFromRow()`, mapear `wouldUseCount: row.would_use_count`

- [x] **T5** — Tests (AC: 1-6)
  - [x] T5.1 5 tests unitarios para `projectFromRow()` con tagline y would_use_count — PASS
  - [x] T5.2 338/338 tests totales — PASS

- [x] **T6** — Verificación final
  - [x] T6.1 Migraciones 014 y 015 aplicadas y verificadas con query
  - [x] T6.2 `npx tsc --noEmit` sin errores
  - [x] T6.3 `npm run lint` sin errores

## Dev Notes

### Contexto de negocio

El campo `tagline` es un texto corto (1 línea) que resume la propuesta de valor de un proyecto. Aparecerá en:
- **ProjectCard** (Story 9.6): fallback a `problem` truncado si tagline vacío
- **LaunchIdeaDialog** (Story 9.8): campo requerido en creación
- **Project Detail** (Story 9.7): subtítulo debajo del H1

El campo `would_use_count` es un contador denormalizado de feedbacks positivos en la pregunta "¿Lo usarías?". Se usa en:
- **ProjectCard** (Story 9.6): "N lo usarían"
- **ValidationSignalCard** (Story 9.7): barra "Lo usarían X%"

### Estructura de migraciones existente

El proyecto usa migraciones numeradas secuencialmente en `supabase/migrations/`. La última es `013_feedbacks_profiles_fk.sql`. Convención:

```
supabase/migrations/
  001_create_communities.sql
  ...
  013_feedbacks_profiles_fk.sql   ← última existente
  014_add_tagline_to_projects.sql ← NUEVA (T1)
  015_add_would_use_counter.sql   ← NUEVA (T3)
```

Patrón de las migraciones existentes (ver 011, 013):
- Comentario en cabecera con número y descripción
- `IF NOT EXISTS` / `ADD CONSTRAINT IF NOT EXISTS` donde procede
- Estilo SQL limpio y explícito

### Mapeo `would_use` ↔ schema actual

El campo en la DB es `scores jsonb` con estructura `{ p1: 1|2|3, p2: 1|2|3, p3: 1|2|3 }` donde:
- `p2` = pregunta "¿Usarías esta solución si estuviera disponible?"
- Score `3` = "Sí" (ver `FeedbackScore = 1|2|3` en `lib/types/feedback.ts`)

Por tanto el trigger debe contar feedbacks donde `(scores->>'p2')::int = 3`.

> **Nota:** La AC de epics.md menciona `text_responses->>'would_use' = 'Yes'` — esto corresponde al nuevo `FeedbackFormInline` que Story 9.7 creará. Para compatibilidad con feedbacks existentes y el backfill, usar `(scores->>'p2')::int = 3`.

### Plantilla migración 015

```sql
-- Story 9.1: Contador would_use_count en tabla projects
-- Columna denormalizada + trigger AFTER INSERT/UPDATE/DELETE en feedbacks

-- 1. Columna
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS would_use_count integer NOT NULL DEFAULT 0;

-- 2. Función
CREATE OR REPLACE FUNCTION recompute_project_would_use_count()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_project_id uuid;
BEGIN
  v_project_id := COALESCE(NEW.project_id, OLD.project_id);
  UPDATE projects
  SET would_use_count = (
    SELECT COUNT(*)
    FROM feedbacks
    WHERE project_id = v_project_id
      AND (scores->>'p2')::int = 3
  )
  WHERE id = v_project_id;
  RETURN NULL;
END;
$$;

-- 3. Trigger
DROP TRIGGER IF EXISTS feedbacks_recompute_would_use ON feedbacks;
CREATE TRIGGER feedbacks_recompute_would_use
  AFTER INSERT OR UPDATE OF scores OR DELETE ON feedbacks
  FOR EACH ROW EXECUTE FUNCTION recompute_project_would_use_count();

-- 4. Backfill inicial
UPDATE projects p
SET would_use_count = (
  SELECT COUNT(*)
  FROM feedbacks f
  WHERE f.project_id = p.id
    AND (f.scores->>'p2')::int = 3
);
```

### Tipos TypeScript actuales en `lib/types/projects.ts`

Fichero actual (líneas clave):

```typescript
export interface Project {
  // ... campos existentes ...
  // Story 8.1 — campos opcionales de detalle
  targetUser: string | null
  demoUrl: string | null
  feedbackTopics: string[] | null
  // AÑADIR:
  // tagline: string | null        ← Story 9.1
  // wouldUseCount: number         ← Story 9.1
}

export interface ProjectRow {
  // ... campos existentes ...
  target_user: string | null
  demo_url: string | null
  feedback_topics: string[] | null
  // AÑADIR:
  // tagline: string | null        ← Story 9.1
  // would_use_count: number       ← Story 9.1
}

export function projectFromRow(row: ProjectRow): Project {
  return {
    // ... campos existentes ...
    targetUser: row.target_user,
    demoUrl: row.demo_url,
    feedbackTopics: row.feedback_topics,
    // AÑADIR:
    // tagline: row.tagline,
    // wouldUseCount: row.would_use_count,
  }
}
```

### Convención de nombres del proyecto

| DB (snake_case) | TypeScript (camelCase) |
|---|---|
| `tagline` | `tagline` |
| `would_use_count` | `wouldUseCount` |
| `target_user` | `targetUser` |
| `demo_url` | `demoUrl` |

### Aplicar migraciones localmente

```bash
# Opción 1 — supabase CLI (si hay supabase start activo):
supabase db push

# Opción 2 — aplicar migración individual:
supabase migration up

# Verificar que se aplicaron:
supabase status
```

### Tests — patrones del proyecto

Los tests de tipos usan Vitest. Ver `lib/types/projects.ts` para entender qué probar en `projectFromRow()`. Tests de integración de DB se hacen contra Supabase local (ver stories previas de Epic 1-3 para patrones).

### Sin query updates en esta story

Esta story es **solo DB + tipos**. No hay cambios en `lib/api/projects.ts`, `lib/repositories/`, ni componentes UI. Los consumers de `tagline` y `wouldUseCount` se implementan en Stories 9.6, 9.7, 9.8.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6 (Bart — Quick Flow)

### Debug Log References

- Seed usa `scores.p2 = 'yes'` en lugar de int 3 — función helper `feedback_would_use()` maneja ambos formatos
- Migración 015 falló en primer intento por `invalid input syntax for type integer: "yes"` — corregido con helper
- Post-CR: volatility de helper cambiada de `IMMUTABLE` a `STABLE` (migración 016) por uso de regex `~`

### Completion Notes List

- `would_use_count` correctamente backfillado: PulseCheck=1, resto=0 según datos de seed
- Gap intencional: `findByCommunity` no selecciona aún `tagline`/`would_use_count` — diferido a Story 9.6

### File List

- `supabase/migrations/014_add_tagline_to_projects.sql` (NUEVA)
- `supabase/migrations/015_add_would_use_counter.sql` (NUEVA)
- `supabase/migrations/016_fix_feedback_would_use_stable.sql` (NUEVA — post-CR fix volatility)
- `lib/types/projects.ts` (MODIFICADO — tagline y would_use_count en Project, ProjectRow, projectFromRow)
- `tests/unit/projects/projectFromRow.test.ts` (NUEVO — 5 tests)
- `docs/project/modules/projects.md` (MODIFICADO — schema actualizado + contadores denormalizados)
