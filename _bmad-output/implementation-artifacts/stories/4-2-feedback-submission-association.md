# Story 4.2: Feedback Submission & Association

Status: ready-for-dev

## Story

Como plataforma,
quiero registrar cada feedback asociado al usuario que lo envía y al proyecto que lo recibe,
para que el Proof Score pueda calcularse correctamente y el Builder vea quién le dio feedback.

## Acceptance Criteria

1. Cada feedback queda asociado a: `reviewer_id`, `project_id`, `community_id` (FR18)
2. Un Reviewer solo puede dar feedback UNA VEZ por proyecto — validación backend (UNIQUE constraint + check en API)
3. El Builder NO puede dar feedback en su propio proyecto — validación backend
4. Feedback en proyectos `draft` o `inactive` es rechazado con error 422 (FR19)
5. Lista de feedbacks visible en sidebar de vista de proyecto para el Builder
6. Cada feedback en la lista muestra: avatar + nombre del Reviewer + respuestas textuales (P1-P4)
7. Feedbacks ordenados por fecha (más recientes primero)
8. Counter de feedbacks actualizado tras envío (revalidación de ruta Next.js)

## Rejection Criteria

- NO exponer scores numéricos al Builder — solo respuestas textuales en la lista
- NO mostrar la lista de feedbacks a Reviewers (solo al Builder)
- NO permitir un segundo feedback del mismo Reviewer en el mismo proyecto

## Tasks / Subtasks

- [ ] **T1: Feature branch**
  - [ ] `git checkout develop && git pull`
  - [ ] `git checkout -b feat/4-2-feedback-submission-association`

- [ ] **T2: API Route GET /api/feedback — leer feedbacks de un proyecto** (AC: 5, 6, 7)
  - [ ] Añadir `GET` handler a `app/api/feedback/route.ts`:
    ```typescript
    export async function GET(request: Request) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 })

      const { searchParams } = new URL(request.url)
      const projectId = searchParams.get('projectId')
      if (!projectId) return NextResponse.json(
        { error: 'projectId requerido', code: 'VALIDATION_ERROR' }, { status: 400 }
      )

      // Verificar que el usuario es el builder del proyecto
      const { data: project } = await supabase
        .from('projects')
        .select('id, builder_id')
        .eq('id', projectId)
        .single()
      if (!project || project.builder_id !== user.id) return NextResponse.json(
        { error: 'Solo el builder puede ver los feedbacks', code: 'FEEDBACK_FORBIDDEN' }, { status: 403 }
      )

      // Leer feedbacks con datos del reviewer (join a profiles)
      const { data: feedbacks, error } = await supabase
        .from('feedbacks')
        .select(`
          id, scores, text_responses, created_at,
          profiles:reviewer_id (id, name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) return NextResponse.json(
        { error: 'Error al obtener feedbacks', code: 'FEEDBACKS_FETCH_ERROR' }, { status: 500 }
      )

      return NextResponse.json({ data: feedbacks ?? [], count: feedbacks?.length ?? 0 })
    }
    ```
  - [ ] **Nota:** Requiere que la tabla `profiles` exista (Story 6-1). En entorno sin profiles, el join puede fallar. Añadir `.maybeSingle()` o manejar el caso `profiles = null` en el componente.

- [ ] **T3: Actualizar typed client wrapper**
  - [ ] Añadir a `lib/api/feedback.ts`:
    ```typescript
    export interface FeedbackWithReviewer extends Feedback {
      profiles: { id: string; name: string; avatarUrl: string | null } | null
    }

    export async function getFeedbacks(projectId: string): Promise<FeedbackWithReviewer[]> {
      const res = await fetch(`/api/feedback?projectId=${projectId}`)
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }
    ```

- [ ] **T4: Componente FeedbackList** (AC: 5, 6, 7)
  - [ ] Crear `components/feedback/FeedbackList.tsx` — Client Component:
    ```typescript
    interface FeedbackListProps {
      projectId: string
      isBuilder: boolean
    }
    ```
    - Si `isBuilder === false`: no renderizar nada
    - Si `isBuilder === true`: fetch feedbacks con `getFeedbacks(projectId)`
    - Por cada feedback: `Avatar` + nombre reviewer + respuestas P1-P4 textuales
    - Fecha relativa (ej: "hace 2 días")
    - Si el reviewer no tiene perfil (`profiles = null`): mostrar "Usuario" + avatar placeholder
    - Skeleton mientras carga
    - Empty state: "Aún no has recibido feedback"

- [ ] **T5: Componente FeedbackCounter** (AC: 8)
  - [ ] Crear `components/feedback/FeedbackCounter.tsx`:
    ```typescript
    // Muestra: "N feedbacks" — se actualiza tras envío via prop
    interface FeedbackCounterProps {
      count: number
    }
    export function FeedbackCounter({ count }: FeedbackCounterProps) {
      return (
        <p aria-live="polite" className="text-sm text-[var(--color-text-secondary)]">
          {count} {count === 1 ? 'feedback' : 'feedbacks'}
        </p>
      )
    }
    ```

- [ ] **T6: Integrar FeedbackList + FeedbackCounter en vista de proyecto** (AC: 5, 8)
  - [ ] Actualizar `app/(app)/communities/[slug]/projects/[id]/page.tsx`:
    - Sidebar derecho (40%): `FeedbackCounter` + `FeedbackList` (solo para builder)
    - `FeedbackCounter` se actualiza en `onSuccess` del `FeedbackDialog` (Story 4-1)
    - **Revalidación:** usar `router.refresh()` post-envío para actualizar datos del Server Component

- [ ] **T7: Tests unitarios** (AC: 2, 3, 4)
  - [ ] Crear `tests/unit/feedback/feedbackValidation.test.ts`:
    - Builder no puede dar feedback en su propio proyecto → error `FEEDBACK_SELF_NOT_ALLOWED`
    - Proyecto `draft` → error `PROJECT_NOT_LIVE`
    - Proyecto `inactive` → error `PROJECT_NOT_LIVE`
    - Segundo feedback del mismo reviewer → error `FEEDBACK_ALREADY_SUBMITTED`
    - Al menos 4 tests (lógica de validación pura, sin Supabase)

- [ ] **T8: PR y cierre**
  - [ ] `npm run test` — todos deben pasar
  - [ ] Commit: `feat(feedback): add feedback list and association rules`
  - [ ] Push + PR contra `develop`
  - [ ] Actualizar `sprint-status.yaml`: `4-2-feedback-submission-association: review`

## Dev Notes

### Dependencias

- **Prerrequisito:** Story 4-1 (tabla `feedbacks`, API POST)
- Story 5-1 consume los feedbacks para calcular el Proof Score
- Story 6-1 crea la tabla `profiles` — el join del GET puede retornar `profiles: null` sin ella

### Join con profiles — manejo defensivo

```typescript
// En FeedbackList, si profiles es null:
const reviewerName = feedback.profiles?.name ?? 'Usuario'
const avatarUrl = feedback.profiles?.avatarUrl ?? null
```

### References

- [Source: epic-4-feedback.md#Story 4.2] — ACs y notas técnicas
- [Source: architecture.md#Process Patterns] — auth, RLS, community membership check
- [Source: stories/4-1-feedback-form-4-guided-questions.md] — tabla feedbacks, tipos

## Dev Agent Record

### Agent Model Used

_pendiente_

### Debug Log References

### Completion Notes List

### File List
