# Story 13.1 — DB extensiones para iteraciones (project_iterations)

**Epic:** 13 — Iteración, Cierre del Loop y Copiloto IA
**Story key:** 13.1
**Status:** ready-for-dev
**Fase:** GROWTH 2.1

---

## User Story

**Como** Builder de un proyecto en Proof Day,
**quiero** que la plataforma tenga soporte de base de datos para versiones sucesivas de mi proyecto (iteraciones),
**para que** pueda publicar nuevas versiones tras iterar sobre el feedback recibido y el sistema pueda rastrear la evolución del proyecto a lo largo del tiempo.

---

## Acceptance Criteria

### AC1 — Tabla `project_iterations` creada con estructura correcta

**Given** que la migración se ha aplicado correctamente,
**When** un desarrollador consulta el esquema de la base de datos,
**Then** existe la tabla `project_iterations` con las columnas: `id` (UUID PK), `project_id` (UUID FK → projects con CASCADE), `version_number` (INTEGER NOT NULL), `title` (TEXT), `description` (TEXT), `hypothesis` (TEXT), `published_at` (TIMESTAMPTZ NOT NULL DEFAULT now()), `created_at` (TIMESTAMPTZ NOT NULL DEFAULT now()).

### AC2 — Constraint de unicidad por proyecto y versión

**Given** que ya existe un registro con `project_id = X` y `version_number = 1`,
**When** se intenta insertar otro registro con los mismos `project_id` y `version_number`,
**Then** la base de datos rechaza la operación con un error de restricción UNIQUE.

### AC3 — Columna `iteration_id` añadida a `feedbacks`

**Given** que la migración se ha aplicado correctamente,
**When** un desarrollador consulta el esquema de la tabla `feedbacks`,
**Then** existe la columna `iteration_id` de tipo UUID, nullable, con FK → `project_iterations(id)` (sin CASCADE para preservar feedbacks si se borra una iteración).

### AC4 — RLS: SELECT para miembros de la comunidad

**Given** que un usuario es miembro de la comunidad a la que pertenece el proyecto,
**When** consulta `project_iterations` para ese proyecto,
**Then** obtiene los registros correspondientes sin error de permisos.

### AC5 — RLS: INSERT solo para el Builder del proyecto

**Given** que un usuario NO es el autor del proyecto (`projects.builder_id != auth.uid()`),
**When** intenta insertar una fila en `project_iterations` para ese proyecto,
**Then** la operación es rechazada por la política RLS.

**Given** que un usuario ES el autor del proyecto (`projects.builder_id = auth.uid()`),
**When** inserta una fila en `project_iterations` para ese proyecto,
**Then** la operación se completa con éxito.

### AC6 — Tipos TypeScript creados y consistentes con el esquema

**Given** que la migración está aplicada,
**When** un desarrollador importa los tipos desde `lib/types/`,
**Then** existen `ProjectIteration`, `ProjectIterationRow` y `projectIterationFromRow` alineados con el esquema, y `Feedback` / `FeedbackRow` incluyen el campo `iterationId` / `iteration_id`.

### AC7 — Tests unitarios de los mappers pasan

**Given** que los tipos y mappers están implementados,
**When** se ejecuta `npm test`,
**Then** los tests de `projectIterationFromRow` y del mapper actualizado de `feedbackFromRow` pasan sin errores.

---

## Tasks de implementación

> Seguir TDD Outside-In: escribir test primero, implementar, verificar verde.

### Task 1 — Migración SQL: tabla `project_iterations`

Crear fichero `supabase/migrations/032_create_project_iterations.sql` con:
- Creación de la tabla `project_iterations` con todos sus campos y constraints.
- UNIQUE(project_id, version_number).
- FK → projects(id) ON DELETE CASCADE.
- Políticas RLS: habilitar RLS, SELECT para miembros de la comunidad, INSERT para el Builder.

### Task 2 — Migración SQL: extensión de `feedbacks`

Crear fichero `supabase/migrations/033_add_iteration_id_to_feedbacks.sql` con:
- `ALTER TABLE feedbacks ADD COLUMN iteration_id UUID NULL REFERENCES project_iterations(id);`
- Sin CASCADE: si se elimina una iteración, los feedbacks conservan su existencia con `iteration_id = NULL` (SET NULL).

### Task 3 — Tests unitarios para el mapper `ProjectIteration`

En `lib/types/__tests__/project-iterations.test.ts` (fichero nuevo):
- Test: `projectIterationFromRow` transforma correctamente snake_case → camelCase.
- Test: campos nullable (`title`, `description`, `hypothesis`) se mapean como `null` cuando son `null`.

### Task 4 — Tipos TypeScript: `lib/types/project-iterations.ts`

Crear fichero nuevo con:
- `ProjectIteration` (camelCase).
- `ProjectIterationRow` (snake_case, tal como devuelve Supabase).
- `projectIterationFromRow(row: ProjectIterationRow): ProjectIteration`.

### Task 5 — Tests unitarios para el mapper actualizado `feedbackFromRow`

En `lib/types/__tests__/feedback.test.ts` (si no existe, crearlo; si existe, añadir casos):
- Test: `feedbackFromRow` mapea `iteration_id → iterationId` correctamente.
- Test: `iterationId` es `null` cuando `iteration_id` es `null`.

### Task 6 — Actualizar tipos `Feedback` y `FeedbackRow`

En `lib/types/feedback.ts`:
- Añadir `iterationId: string | null` a `Feedback`.
- Añadir `iteration_id: string | null` a `FeedbackRow`.
- Actualizar `feedbackFromRow` para mapear el nuevo campo.
- Comentario: `// Story 13.1 — iteraciones`.

---

## Dev Notes

### Número de migraciones

Las últimas migraciones van del 024 al 031. Las nuevas migraciones de esta story son:
- `032_create_project_iterations.sql`
- `033_add_iteration_id_to_feedbacks.sql`

Verificar el número exacto en `supabase/migrations/` antes de crear los ficheros.

### SQL — Migración 032: `project_iterations`

```sql
-- 032_create_project_iterations.sql
-- Story 13.1 — Iteración, Cierre del Loop y Copiloto IA

CREATE TABLE project_iterations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number  INTEGER     NOT NULL,
  title           TEXT,
  description     TEXT,
  hypothesis      TEXT,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT project_iterations_project_version_unique
    UNIQUE (project_id, version_number)
);

-- RLS
ALTER TABLE project_iterations ENABLE ROW LEVEL SECURITY;

-- SELECT: miembros de la comunidad del proyecto
CREATE POLICY "project_iterations_select_community_members"
  ON project_iterations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM projects p
      JOIN community_members cm ON cm.community_id = p.community_id
      WHERE p.id = project_iterations.project_id
        AND cm.user_id = auth.uid()
    )
  );

-- INSERT: solo el Builder (author) del proyecto
CREATE POLICY "project_iterations_insert_builder"
  ON project_iterations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM projects p
      WHERE p.id = project_iterations.project_id
        AND p.builder_id = auth.uid()
    )
  );
```

### SQL — Migración 033: extensión de `feedbacks`

```sql
-- 033_add_iteration_id_to_feedbacks.sql
-- Story 13.1 — Iteración, Cierre del Loop y Copiloto IA

ALTER TABLE feedbacks
  ADD COLUMN iteration_id UUID NULL
  REFERENCES project_iterations(id) ON DELETE SET NULL;
```

> Nota: `ON DELETE SET NULL` garantiza que los feedbacks no se eliminan si la iteración referenciada es borrada. El feedback pierde la atribución pero sigue existiendo.

### Tipos TypeScript a crear: `lib/types/project-iterations.ts`

```typescript
// Story 13.1 — Iteración, Cierre del Loop y Copiloto IA

export interface ProjectIteration {
  id: string
  projectId: string
  versionNumber: number
  title: string | null
  description: string | null
  hypothesis: string | null
  publishedAt: string
  createdAt: string
}

/** Forma del row tal como lo devuelve Supabase (snake_case) */
export interface ProjectIterationRow {
  id: string
  project_id: string
  version_number: number
  title: string | null
  description: string | null
  hypothesis: string | null
  published_at: string
  created_at: string
}

export function projectIterationFromRow(row: ProjectIterationRow): ProjectIteration {
  return {
    id: row.id,
    projectId: row.project_id,
    versionNumber: row.version_number,
    title: row.title,
    description: row.description,
    hypothesis: row.hypothesis,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  }
}
```

### Extensión de tipos en `lib/types/feedback.ts`

Añadir en `Feedback`:
```typescript
  // Story 13.1 — iteraciones
  iterationId: string | null
```

Añadir en `FeedbackRow`:
```typescript
  // Story 13.1 — iteraciones
  iteration_id: string | null
```

Actualizar `feedbackFromRow`:
```typescript
    // Story 13.1 — iteraciones
    iterationId: row.iteration_id,
```

### Tabla `community_members` — nombre real

Verificar el nombre exacto de la tabla de membresía de comunidad antes de escribir la política RLS SELECT. Las migraciones previas usan el patrón `community_members` con columnas `community_id` y `user_id`. Confirmar en `supabase/migrations/` si el nombre es distinto.

### Notas de arquitectura

- Esta story es puramente de infraestructura de datos. No crea rutas API ni componentes UI.
- Las stories 13.2–13.6 dependen de que esta migración esté aplicada.
- El campo `version_number` es gestionado por la aplicación (no auto-increment de BD), lo que permite flexibilidad en la numeración y evita gaps en caso de rollback.

---

## Criterio de Done

- [x] Migración `032_create_project_iterations.sql` creada y aplicada localmente (`supabase db reset` o `supabase migration up`).
- [x] Migración `033_add_iteration_id_to_feedbacks.sql` creada y aplicada localmente.
- [x] `lib/types/project-iterations.ts` creado con `ProjectIteration`, `ProjectIterationRow` y `projectIterationFromRow`.
- [x] `lib/types/feedback.ts` actualizado con `iterationId` / `iteration_id` en las interfaces y en `feedbackFromRow`.
- [x] Tests unitarios en `tests/unit/project-iterations/projectIterationFromRow.test.ts` — 13/13 en verde.
- [x] Tests de `feedbackFromRow` actualizados — 10/10 en verde (Story 11.1 + 13.1).
- [x] `npm test` completo pasa sin regresiones — 171 test files, 1738 tests.
- [x] `npm run build` sin errores de TypeScript introducidos por esta story.
- [ ] Story actualizada a `done` en sprint-status.yaml tras CR aprobado y QA PASS.

---

## Dev Agent Record

**Implementado por:** Homer (2026-05-07)
**Modo:** GENERATE
**Rama:** feat/13-1-db-extensiones-iteraciones-project-iterations

### Tasks completadas

- [x] Task 1: `supabase/migrations/032_create_project_iterations.sql` — tabla con todos los campos, UNIQUE(project_id, version_number), FK ON DELETE CASCADE, RLS SELECT para miembros de comunidad, RLS INSERT para builder.
- [x] Task 2: `supabase/migrations/033_add_iteration_id_to_feedbacks.sql` — columna `iteration_id` UUID NULL con FK ON DELETE SET NULL.
- [x] Task 3 (TDD): Tests escritos antes del código en `tests/unit/project-iterations/projectIterationFromRow.test.ts` — 13 casos (campos normales + nullable + row completo).
- [x] Task 4: `lib/types/project-iterations.ts` — `ProjectIteration`, `ProjectIterationRow`, `projectIterationFromRow`.
- [x] Task 5 (TDD): Tests de `feedbackFromRow` extendidos en `tests/unit/feedback/feedbackFromRow.test.ts` con 3 nuevos casos Story 13.1 (iteration_id null, con UUID, preservación de campos).
- [x] Task 6: `lib/types/feedback.ts` — `iterationId: string | null` en `Feedback` y `FeedbackRow`, mapper actualizado.

### Ficheros adicionales actualizados (impacto del tipo)

- `lib/fixtures/feedback.ts` — 12 objetos `Feedback` con `iterationId: null`
- `app/api/webhooks/ai-synthesis/route.ts` — interfaz local `FeedbackRow` y mapper local actualizados
- `tests/unit/ai/synthesizeFeedbacks.test.ts` — 2 objetos `Feedback` con `iterationId: null`
- `tests/component/feedback/FeedbackDialog.test.tsx` — 1 objeto con `iterationId: null`
- `tests/component/feedback/FeedbackFormInline.test.tsx` — 5 objetos con `iterationId: null`
- `tests/component/feedback/FeedbackFormInline.11-2.test.tsx` — 1 objeto con `iterationId: null`

### Decisiones técnicas

- Los tests van en `tests/unit/project-iterations/` (no en `lib/types/__tests__/`) siguiendo la estructura existente del proyecto (vitest.config.ts incluye `tests/unit/**`).
- Los errores TS pre-existentes (`WizardFormData.customQuestion`, `templates.route.test`) no son de esta story y se dejan tal como estaban.
- `lib/types/**` está excluido de coverage por configuración, pero los tests en `tests/unit/` cubren los mappers correctamente.
