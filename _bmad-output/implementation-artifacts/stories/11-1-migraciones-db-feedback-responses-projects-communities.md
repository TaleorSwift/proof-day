# Story 11.1 — Migraciones DB: feedback quality y reciprocidad

## Metadata
- **Epic:** 11 — Calidad del Feedback y Reciprocidad
- **Story key:** 11.1
- **Phase:** Development
- **Agent:** Homer
- **Flow:** Full Flow (Homer)

## User Story

Como desarrollador,
quiero disponer de las columnas de base de datos necesarias para almacenar la respuesta personalizada, el quality score del feedback y los umbrales de calidad/reciprocidad en proyectos y comunidades,
para que las stories de funcionalidad del Epic 11 puedan construirse sobre una base de datos sólida.

## Acceptance Criteria

**AC1 — Migración 024: columnas en feedbacks**
Given que se aplica la migración 024
When inspecciono la tabla `feedbacks`
Then tiene las columnas: `custom_answer` (TEXT, nullable) y `quality_score` (NUMERIC(4,2), nullable)
And los registros existentes no se ven afectados (valores por defecto NULL)

**AC2 — Migración 025: columnas en projects**
Given que se aplica la migración 025
When inspecciono la tabla `projects`
Then tiene las columnas: `custom_question` (TEXT, nullable) y `quality_threshold` (NUMERIC(4,2), nullable, DEFAULT 0.6)
And los proyectos existentes tienen `quality_threshold = 0.6` (DEFAULT aplicado retroactivamente)

**AC3 — Migración 026: columna en communities**
Given que se aplica la migración 026
When inspecciono la tabla `communities`
Then tiene la columna: `reciprocity_threshold` (INTEGER, nullable, DEFAULT 3)
And las comunidades existentes tienen `reciprocity_threshold = 3`

**AC4 — RLS: sin cambios**
Given que las tablas feedbacks, projects y communities ya tienen RLS habilitado
When se aplican las migraciones 024-026
Then no se requieren cambios en las políticas RLS (las columnas nuevas heredan las políticas existentes)

**AC5 — Tipos TypeScript: Feedback**
Given que existe `lib/types/feedback.ts`
When importo los tipos
Then `Feedback` incluye los campos `customAnswer: string | null` y `qualityScore: number | null`
And `FeedbackRow` incluye los campos `custom_answer: string | null` y `quality_score: number | null`
And la función `feedbackFromRow()` mapea correctamente los campos snake_case → camelCase

**AC6 — Tipos TypeScript: Project**
Given que existe `lib/types/projects.ts`
When importo los tipos
Then `Project` incluye los campos `customQuestion: string | null` y `qualityThreshold: number`
And `ProjectRow` incluye los campos `custom_question: string | null` y `quality_threshold: number`
And `projectFromRow()` mapea correctamente los nuevos campos

**AC7 — Tipos TypeScript: Community**
Given que existe `lib/types/communities.ts`
When importo los tipos
Then `Community` incluye el campo `reciprocity_threshold: number`
And `CommunityRow` existe con todos los campos en snake_case
And la función `communityFromRow()` mapea correctamente los campos

**AC8 — Fixtures actualizados**
Given que existen fixtures en `lib/fixtures/`
When importo los fixtures de feedback, projects y communities
Then los objetos incluyen los nuevos campos con valores coherentes
And los fixtures de tipo Row incluyen los campos snake_case nuevos

**AC9 — Tests**
Given que ejecuto `npm run test:unit`
When se procesan los tests de los mappers nuevos/modificados
Then todos los tests de mappers pasan al 100%

## Dev Notes

### Migraciones SQL

- 024: `supabase/migrations/024_add_feedback_quality_fields.sql`
  - `ALTER TABLE feedbacks ADD COLUMN custom_answer TEXT;`
  - `ALTER TABLE feedbacks ADD COLUMN quality_score NUMERIC(4,2);`

- 025: `supabase/migrations/025_add_project_quality_fields.sql`
  - `ALTER TABLE projects ADD COLUMN custom_question TEXT;`
  - `ALTER TABLE projects ADD COLUMN quality_threshold NUMERIC(4,2) DEFAULT 0.6;`

- 026: `supabase/migrations/026_add_community_reciprocity_threshold.sql`
  - `ALTER TABLE communities ADD COLUMN reciprocity_threshold INTEGER DEFAULT 3;`

### Tipos TypeScript

- `lib/types/feedback.ts` — añadir FeedbackRow, feedbackFromRow(), customAnswer, qualityScore a Feedback
- `lib/types/projects.ts` — añadir customQuestion, qualityThreshold a Project y ProjectRow, actualizar projectFromRow()
- `lib/types/communities.ts` — añadir CommunityRow, communityFromRow(), reciprocity_threshold a Community

### Fixtures

- `lib/fixtures/feedback.ts` — añadir customAnswer y qualityScore a todos los Feedback
- `lib/fixtures/projects.ts` — añadir customQuestion y qualityThreshold a todos los ProjectRow
- `lib/fixtures/communities.ts` — añadir reciprocity_threshold a todas las Community

### RLS summary

- Sin cambios en RLS. Las nuevas columnas heredan las políticas existentes de cada tabla.

### TDD Outside-In — orden de implementación

1. Tests de mapper `feedbackFromRow` (RED)
2. Implementar FeedbackRow + feedbackFromRow en feedback.ts (GREEN)
3. Tests de mapper `projectFromRow` con nuevos campos (RED)
4. Actualizar projectFromRow + Project + ProjectRow en projects.ts (GREEN)
5. Tests de mapper `communityFromRow` (RED)
6. Implementar CommunityRow + communityFromRow en communities.ts (GREEN)
7. Crear migraciones SQL
8. Actualizar fixtures

## Tasks

- [x] T1 — Tests TDD: feedbackFromRow mapper (RED → GREEN)
- [x] T2 — Tests TDD: projectFromRow con campos 11.1 (RED → GREEN)
- [x] T3 — Tests TDD: communityFromRow mapper (RED → GREEN)
- [x] T4 — Migración 024: feedbacks (custom_answer, quality_score)
- [x] T5 — Migración 025: projects (custom_question, quality_threshold)
- [x] T6 — Migración 026: communities (reciprocity_threshold)
- [x] T7 — Tipos TS: feedback.ts (FeedbackRow, feedbackFromRow, nuevos campos en Feedback)
- [x] T8 — Tipos TS: projects.ts (nuevos campos en Project, ProjectRow, projectFromRow)
- [x] T9 — Tipos TS: communities.ts (CommunityRow, communityFromRow, reciprocity_threshold)
- [x] T10 — Fixtures: feedback.ts, projects.ts, communities.ts

## Dev Agent Record

### Implementation notes
- FeedbackRow introducido como nuevo tipo con todos los campos snake_case de la tabla feedbacks
- feedbackFromRow() mapea snake_case → camelCase siguiendo el patrón establecido en projects.ts
- Community mantiene los campos snake_case existentes (patrón heredado) + reciprocity_threshold; CommunityRow añadido para consistencia
- Fixtures actualizados con valores representativos: customAnswer y qualityScore poblados en algunos feedbacks para tests realistas

### Files changed
- `supabase/migrations/024_add_feedback_quality_fields.sql` (new)
- `supabase/migrations/025_add_project_quality_fields.sql` (new)
- `supabase/migrations/026_add_community_reciprocity_threshold.sql` (new)
- `lib/types/feedback.ts` (modified)
- `lib/types/projects.ts` (modified)
- `lib/types/communities.ts` (modified)
- `lib/fixtures/feedback.ts` (modified)
- `lib/fixtures/projects.ts` (modified)
- `lib/fixtures/communities.ts` (modified)
- `tests/unit/feedback/feedbackFromRow.test.ts` (new)
- `tests/unit/projects/projectFromRow-11-1.test.ts` (new)
- `tests/unit/communities/communityFromRow.test.ts` (new)
- `_bmad-output/implementation-artifacts/stories/11-1-migraciones-db-feedback-responses-projects-communities.md` (new)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `docs/project/modules/feedback.md` (new/modified)
- `docs/project/modules/projects.md` (new/modified)
- `docs/project/modules/communities.md` (new/modified)
