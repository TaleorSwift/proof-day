# Story 4.1: Feedback Form (4 Guided Questions)

Status: ready-for-dev

## Story

Como Reviewer,
quiero dar feedback estructurado a un proyecto Live respondiendo 4 preguntas guiadas,
para que mi criterio contribuya a la señal de viabilidad del Builder de forma significativa.

## Acceptance Criteria

1. Botón "Dar feedback" visible en el sidebar de la vista de proyecto (`/communities/[slug]/projects/[id]`) solo cuando el proyecto está en estado `live`
2. El formulario de feedback se abre en un `Dialog` (no página separada) (FR16)
3. 4 preguntas obligatorias con `ToggleGroup` (Yes / Somewhat / No) (FR17):
   - P1: ¿Entiendes claramente el problema planteado?
   - P2: ¿Usarías esta solución si estuviera disponible?
   - P3: ¿Te parece viable técnicamente la solución propuesta?
   - P4: (Textarea obligatorio) ¿Qué mejorarías de esta propuesta?
4. Botón "Enviar feedback" disabled hasta que las 4 preguntas estén respondidas
5. P1-P3: `ToggleGroup` (Yes=3pts / Somewhat=2pts / No=1pt) + textarea libre opcional
6. P4: textarea obligatorio (mínimo 10 caracteres)
7. `Tooltip` con icono `?` junto a cada pregunta explicando el criterio de evaluación
8. Post-envío: Dialog se cierra, vista del proyecto muestra counter de feedbacks +1
9. La conversión de respuestas a puntos es interna — el Reviewer NO ve puntuaciones

## Rejection Criteria

- NO enviar feedback sin responder las 4 preguntas — botón disabled hasta completar
- NO mostrar puntuación numérica al Reviewer
- NO permitir feedback en proyectos `draft` o `inactive` — validación backend y UI
- NO usar página separada — siempre en Dialog
- NO usar toast para errores de validación — inline

## Tasks / Subtasks

- [ ] **T1: Feature branch**
  - [ ] `git checkout develop && git pull`
  - [ ] `git checkout -b feat/4-1-feedback-form-4-guided-questions`

- [ ] **T2: Tipos TypeScript** (AC: 5, 9)
  - [ ] Crear `lib/types/feedback.ts`:
    ```typescript
    export type FeedbackScore = 1 | 2 | 3  // No=1, Somewhat=2, Yes=3

    export interface FeedbackScores {
      p1: FeedbackScore
      p2: FeedbackScore
      p3: FeedbackScore
    }

    export interface FeedbackTextResponses {
      p1?: string
      p2?: string
      p3?: string
      p4: string  // obligatorio
    }

    export interface Feedback {
      id: string
      projectId: string
      reviewerId: string
      communityId: string
      scores: FeedbackScores
      textResponses: FeedbackTextResponses
      createdAt: string
    }
    ```

- [ ] **T3: Schema Zod** (AC: 4, 6)
  - [ ] Crear `lib/validations/feedback.ts`:
    ```typescript
    import { z } from 'zod'

    const scoreSchema = z.union([z.literal(1), z.literal(2), z.literal(3)])

    export const submitFeedbackSchema = z.object({
      projectId: z.string().uuid(),
      communityId: z.string().uuid(),
      scores: z.object({
        p1: scoreSchema,
        p2: scoreSchema,
        p3: scoreSchema,
      }),
      textResponses: z.object({
        p1: z.string().optional(),
        p2: z.string().optional(),
        p3: z.string().optional(),
        p4: z.string().min(10, 'Escribe al menos 10 caracteres en tu respuesta'),
      }),
    })

    export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>
    ```

- [ ] **T4: Migración SQL — tabla `feedbacks`** (AC: 2, 9)
  - [ ] Comprobar numeración en `supabase/migrations/`
  - [ ] Crear `supabase/migrations/00X_create_feedbacks.sql`:
    ```sql
    CREATE TABLE feedbacks (
      id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id       uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      reviewer_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      community_id     uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
      scores           jsonb NOT NULL,       -- { p1: 1|2|3, p2: 1|2|3, p3: 1|2|3 }
      text_responses   jsonb NOT NULL,       -- { p1?, p2?, p3?, p4: string }
      created_at       timestamptz NOT NULL DEFAULT now(),
      UNIQUE (project_id, reviewer_id)       -- un feedback por reviewer por proyecto
    );

    CREATE INDEX idx_feedbacks_project_id ON feedbacks(project_id);
    CREATE INDEX idx_feedbacks_reviewer_id ON feedbacks(reviewer_id);

    ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

    -- Solo el builder puede leer feedbacks de sus proyectos
    CREATE POLICY "builder_read_project_feedbacks"
      ON feedbacks FOR SELECT
      USING (
        auth.uid() IN (
          SELECT builder_id FROM projects WHERE id = project_id
        )
      );

    -- El reviewer puede leer sus propios feedbacks
    CREATE POLICY "reviewer_read_own_feedbacks"
      ON feedbacks FOR SELECT
      USING (auth.uid() = reviewer_id);

    -- Cualquier miembro autenticado puede insertar feedback (se valida en API Route)
    CREATE POLICY "member_insert_feedback"
      ON feedbacks FOR INSERT
      WITH CHECK (auth.uid() = reviewer_id);
    ```

- [ ] **T5: API Route POST /api/feedback** (AC: 4, 9)
  - [ ] Crear `app/api/feedback/route.ts`:
    ```typescript
    import { NextResponse } from 'next/server'
    import { createClient } from '@/lib/supabase/server'
    import { submitFeedbackSchema } from '@/lib/validations/feedback'

    export async function POST(request: Request) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json(
        { error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 }
      )

      const body = await request.json()
      const result = submitFeedbackSchema.safeParse(body)
      if (!result.success) return NextResponse.json(
        { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' }, { status: 400 }
      )

      const { projectId, communityId, scores, textResponses } = result.data

      // Verificar que el proyecto existe y está live
      const { data: project } = await supabase
        .from('projects')
        .select('id, status, builder_id')
        .eq('id', projectId)
        .single()

      if (!project) return NextResponse.json(
        { error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' }, { status: 404 }
      )
      if (project.status !== 'live') return NextResponse.json(
        { error: 'Solo se puede dar feedback en proyectos Live', code: 'PROJECT_NOT_LIVE' }, { status: 422 }
      )
      if (project.builder_id === user.id) return NextResponse.json(
        { error: 'No puedes dar feedback en tu propio proyecto', code: 'FEEDBACK_SELF_NOT_ALLOWED' }, { status: 422 }
      )

      // Verificar membresía en la comunidad
      const { data: member } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()
      if (!member) return NextResponse.json(
        { error: 'No eres miembro de esta comunidad', code: 'COMMUNITY_ACCESS_DENIED' }, { status: 403 }
      )

      // Verificar que no ha dado feedback ya
      const { data: existing } = await supabase
        .from('feedbacks')
        .select('id')
        .eq('project_id', projectId)
        .eq('reviewer_id', user.id)
        .maybeSingle()
      if (existing) return NextResponse.json(
        { error: 'Ya has dado feedback en este proyecto', code: 'FEEDBACK_ALREADY_SUBMITTED' }, { status: 409 }
      )

      const { data: feedback, error } = await supabase
        .from('feedbacks')
        .insert({
          project_id: projectId,
          reviewer_id: user.id,
          community_id: communityId,
          scores,
          text_responses: textResponses,
        })
        .select()
        .single()

      if (error || !feedback) return NextResponse.json(
        { error: 'Error al enviar feedback', code: 'FEEDBACK_INSERT_ERROR' }, { status: 500 }
      )

      return NextResponse.json({ data: feedback }, { status: 201 })
    }
    ```

- [ ] **T6: Typed client wrapper**
  - [ ] Crear `lib/api/feedback.ts`:
    ```typescript
    import type { Feedback } from '@/lib/types/feedback'
    import type { SubmitFeedbackInput } from '@/lib/validations/feedback'

    export async function submitFeedback(data: SubmitFeedbackInput): Promise<Feedback> {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }
    ```

- [ ] **T7: Componente FeedbackQuestion** (AC: 3, 5, 7)
  - [ ] Crear `components/feedback/FeedbackQuestion.tsx` — Client Component:
    ```typescript
    interface FeedbackQuestionProps {
      number: 1 | 2 | 3 | 4
      question: string
      tooltip: string
      value?: number | string
      onChange: (value: number | string) => void
      isTextOnly?: boolean    // true para P4
      textOptional?: boolean  // true para P1-P3 textarea
    }
    ```
    - `fieldset` + `legend` para accesibilidad
    - `ToggleGroup` (Yes / Somewhat / No) en P1-P3 — Yes=3, Somewhat=2, No=1
    - `Textarea` opcional en P1-P3, obligatorio en P4 (min 10 chars)
    - `Tooltip` con icono `?` junto al título de pregunta
    - Estado visual: ToggleGroup seleccionado = answered (resaltado)

- [ ] **T8: Componente FeedbackDialog** (AC: 2, 4, 8)
  - [ ] Crear `components/feedback/FeedbackDialog.tsx` — Client Component:
    ```typescript
    interface FeedbackDialogProps {
      projectId: string
      communityId: string
      isOpen: boolean
      onClose: () => void
      onSuccess: () => void   // refresca contador en la vista
    }
    ```
    - `Dialog` de shadcn/ui con título "Dar feedback"
    - 4 instancias de `FeedbackQuestion` apiladas
    - Estado local: `scores`, `textResponses`, `isLoading`, `error`
    - Botón "Enviar feedback": disabled hasta que P1-P3 tengan score Y P4 tenga ≥10 chars
    - onSubmit: llama a `submitFeedback()`, cierra Dialog, llama a `onSuccess()`
    - Error inline bajo el botón si la API responde error

- [ ] **T9: Integrar FeedbackDialog en vista de proyecto** (AC: 1, 8)
  - [ ] Actualizar `app/(app)/communities/[slug]/projects/[id]/page.tsx`:
    - Añadir botón "Dar feedback" en sidebar (solo si `project.status === 'live'` y el user NO es el builder)
    - Pasar `onSuccess` que recarga el contador de feedbacks
    - **Nota:** El sidebar completo se expande en Story 5-2; esta story añade el botón y el Dialog

- [ ] **T10: Tests unitarios** (AC: 4, 6)
  - [ ] Crear `tests/unit/feedback/submitFeedback.test.ts`:
    - `submitFeedbackSchema` rechaza scores fuera de {1,2,3}
    - `submitFeedbackSchema` rechaza P4 con < 10 chars
    - `submitFeedbackSchema` acepta P4 con ≥ 10 chars
    - `submitFeedbackSchema` acepta texto opcional en P1-P3
    - Validar que scores {p1:3, p2:2, p3:1} son válidos
    - Al menos 5 tests

- [ ] **T11: PR y cierre**
  - [ ] `npm run test` — todos deben pasar
  - [ ] Commit: `feat(feedback): add feedback dialog with 4 guided questions`
  - [ ] Push + PR contra `develop`
  - [ ] Actualizar `sprint-status.yaml`: `4-1-feedback-form-4-guided-questions: review`

## Dev Notes

### Scoring interno (no visible para Reviewer)

```
Yes = 3 pts | Somewhat = 2 pts | No = 1 pts
```
La conversión ocurre en el frontend al construir el objeto `scores` — el Reviewer solo ve "Yes/Somewhat/No". El Proof Score se calcula en Story 5-1 usando estos valores.

### Tooltips por pregunta

```
P1: "Evalúa si el problema está bien explicado y es comprensible."
P2: "Evalúa si la solución resuelve un problema real que tú tendrías."
P3: "Evalúa si la solución es técnicamente realizable con los recursos disponibles."
P4: "Comparte qué cambiarías, qué falta, o qué mejorarías."
```

### Dependencias

- **Prerrequisito:** Story 3-1 (tabla `projects`, estado `live`)
- Story 4-2 añade GET /api/feedback para leer feedbacks del proyecto

### References

- [Source: epic-4-feedback.md#Story 4.1] — ACs, notas técnicas, scoring
- [Source: architecture.md#Process Patterns] — auth, validación Zod, community check
- [Source: ux-design-specification.md#Component Strategy#FeedbackQuestion] — anatomía del componente
- [Source: ux-design-specification.md#Visual Foundation#Pantalla 8] — Dialog de feedback

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

ds-20260328-4-1

### Completion Notes List

- FeedbackButton.tsx creado como wrapper Client Component para inyectar el dialog en el Server Component de la vista de proyecto
- community_id obtenido directamente de typedProject.community_id (ya disponible en el row de Supabase)
- 10 tests unitarios pasando (118 total en la suite)
- Migración 008 (siguiente tras 007_create_projects.sql)

### File List

- lib/types/feedback.ts (nuevo)
- lib/validations/feedback.ts (nuevo)
- supabase/migrations/008_create_feedbacks.sql (nuevo)
- app/api/feedback/route.ts (nuevo)
- lib/api/feedback.ts (modificado)
- components/feedback/FeedbackQuestion.tsx (nuevo)
- components/feedback/FeedbackDialog.tsx (nuevo)
- components/feedback/FeedbackButton.tsx (nuevo)
- app/(app)/communities/[slug]/projects/[id]/page.tsx (modificado)
- tests/unit/feedback/submitFeedback.test.ts (nuevo)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modificado)
- _bmad-output/execution-log.yaml (modificado)
