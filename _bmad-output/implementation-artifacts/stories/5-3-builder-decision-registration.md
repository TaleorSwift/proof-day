# Story 5.3: Builder Decision Registration

Status: ready-for-dev

## Story

Como Builder,
quiero poder registrar mi decisión explícita (Iterar / Escalar / Abandonar) cuando tenga mi Proof Score,
para que mi equipo vea el cierre del ciclo de validación y podamos aprender colectivamente.

## Acceptance Criteria

1. Botón "Registrar decisión" visible en sidebar SOLO cuando el Proof Score está disponible (≥ 3 feedbacks)
2. Dialog de confirmación con 3 opciones como `Card` seleccionables (FR22):
   - Iterar ↺: "Refinar la propuesta antes de escalar"
   - Escalar ↑: "Llevar adelante la idea"
   - Abandonar ✗: "Detener el desarrollo de esta idea"
3. Flujo en dos pasos: selección de opción → botón "Confirmar decisión" (disabled hasta seleccionar)
4. Decisión irreversible — no se puede cambiar una vez registrada
5. Post-confirmación: Dialog se cierra, `DecisionBadge` aparece en la vista del proyecto (FR23)
6. `DecisionBadge` visible para TODOS los miembros de la comunidad (FR23)
7. `DecisionBadge` visible en la `ProjectCard` de la lista de proyectos
8. Formulario de feedback bloqueado (botón "Dar feedback" oculto) tras registrar decisión
9. Botón "Registrar decisión" desaparece tras registrar

## Rejection Criteria

- NO usar dropdown ni select para la decisión — Cards seleccionables obligatorio (FR22)
- NO permitir cambiar la decisión una vez registrada
- NO mostrar el botón "Registrar decisión" si el Proof Score no está disponible aún

## Tasks / Subtasks

- [ ] **T1: Feature branch**
  - [ ] `git checkout develop && git pull`
  - [ ] `git checkout -b feat/5-3-builder-decision-registration`

- [ ] **T2: Tipos TypeScript**
  - [ ] Añadir a `lib/types/projects.ts` (ya existe):
    ```typescript
    // Ya definido en Story 3-1:
    // export type ProjectDecision = 'iterate' | 'scale' | 'abandon'
    // Verificar que existe — no duplicar
    ```

- [ ] **T3: API Route POST /api/projects/[id]/decision** (AC: 3, 4)
  - [ ] Crear `app/api/projects/[id]/decision/route.ts`:
    ```typescript
    import { NextResponse } from 'next/server'
    import { createClient } from '@/lib/supabase/server'
    import { z } from 'zod'

    const decisionSchema = z.object({
      decision: z.enum(['iterate', 'scale', 'abandon']),
    })

    export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 })

      const { id } = await params
      const body = await request.json()
      const result = decisionSchema.safeParse(body)
      if (!result.success) return NextResponse.json(
        { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' }, { status: 400 }
      )

      const { data: project } = await supabase
        .from('projects')
        .select('id, builder_id, decision')
        .eq('id', id)
        .single()

      if (!project) return NextResponse.json({ error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' }, { status: 404 })
      if (project.builder_id !== user.id) return NextResponse.json(
        { error: 'Solo el builder puede registrar la decisión', code: 'DECISION_FORBIDDEN' }, { status: 403 }
      )
      if (project.decision !== null) return NextResponse.json(
        { error: 'La decisión ya fue registrada y no puede modificarse', code: 'DECISION_ALREADY_REGISTERED' },
        { status: 409 }
      )

      const { data: updated, error } = await supabase
        .from('projects')
        .update({
          decision: result.data.decision,
          decided_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error || !updated) return NextResponse.json(
        { error: 'Error al registrar la decisión', code: 'DECISION_INSERT_ERROR' }, { status: 500 }
      )

      return NextResponse.json({ data: updated })
    }
    ```

- [ ] **T4: Función en typed client wrapper**
  - [ ] Añadir a `lib/api/projects.ts`:
    ```typescript
    export async function registerDecision(
      projectId: string,
      decision: 'iterate' | 'scale' | 'abandon'
    ): Promise<Project> {
      const res = await fetch(`/api/projects/${projectId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }
    ```

- [ ] **T5: Componente DecisionBadge** (AC: 5, 6, 7)
  - [ ] Crear `components/projects/DecisionBadge.tsx`:
    ```typescript
    import type { ProjectDecision } from '@/lib/types/projects'

    const DECISION_CONFIG = {
      iterate:  { icon: '↺', label: 'Iterar',   description: 'Refinando la propuesta' },
      scale:    { icon: '↑', label: 'Escalar',   description: 'Llevando la idea adelante' },
      abandon:  { icon: '✗', label: 'Abandonar', description: 'Desarrollo detenido' },
    }

    export function DecisionBadge({ decision }: { decision: ProjectDecision }) {
      const config = DECISION_CONFIG[decision]
      return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
            Decisión del Builder
          </p>
          <div className="flex items-center gap-2 font-semibold">
            <span aria-hidden="true">{config.icon}</span>
            <span>{config.label}</span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{config.description}</p>
        </div>
      )
    }
    ```

- [ ] **T6: Componente DecisionDialog** (AC: 2, 3)
  - [ ] Crear `components/projects/DecisionDialog.tsx` — Client Component:
    ```typescript
    interface DecisionDialogProps {
      projectId: string
      isOpen: boolean
      onClose: () => void
      onSuccess: (decision: ProjectDecision) => void
    }
    ```
    - `Dialog` con título "Registrar tu decisión"
    - 3 `Card` seleccionables: Iterar / Escalar / Abandonar
    - Estado local: `selectedDecision: string | null`
    - Botón "Confirmar decisión": disabled hasta que `selectedDecision !== null`
    - Texto de advertencia: "Esta acción es irreversible"
    - onSubmit: llama a `registerDecision()`, cierra Dialog, llama a `onSuccess(decision)`
    - `isLoading` durante petición

- [ ] **T7: Integrar en sidebar de vista de proyecto** (AC: 1, 5, 8, 9)
  - [ ] Actualizar `components/proof-score/ProofScoreSidebar.tsx`:
    - Si `score !== null` Y `project.decision === null`: mostrar botón "Registrar decisión"
    - Al hacer clic: abrir `DecisionDialog`
    - `onSuccess`: actualizar estado local para mostrar `DecisionBadge` y ocultar botón
  - [ ] Bloquear botón "Dar feedback" si `project.decision !== null` (AC: 8)

- [ ] **T8: DecisionBadge en ProjectCard** (AC: 7)
  - [ ] Actualizar `components/projects/ProjectCard.tsx`:
    - Añadir prop opcional `decision?: ProjectDecision | null`
    - Si `decision !== null`: renderizar `DecisionBadge` compacto bajo el título

- [ ] **T9: Tests unitarios** (AC: 3, 4)
  - [ ] Crear `tests/unit/projects/decisionRegistration.test.ts`:
    - Decisión `iterate` es válida
    - Decisión `scale` es válida
    - Decisión `abandon` es válida
    - Intentar segunda decisión → error `DECISION_ALREADY_REGISTERED`
    - Decisión inválida → error `VALIDATION_ERROR`
    - Al menos 5 tests

- [ ] **T10: PR y cierre**
  - [ ] `npm run test` — todos deben pasar
  - [ ] Commit: `feat(proof-score): add builder decision registration`
  - [ ] Push + PR contra `develop`
  - [ ] Actualizar `sprint-status.yaml`: `5-3-builder-decision-registration: review`

## Dev Notes

### La decisión como "momento de peso"

Según el UX spec, la decisión es el climax del journey del Builder. El Dialog debe transmitir permanencia — no es un simple formulario. Las Cards seleccionables con icono + título + descripción son el patrón correcto (no dropdown).

### Dependencias

- **Prerrequisito:** Story 5-1 (algoritmo Proof Score — necesario para saber si está disponible)
- **Prerrequisito:** Story 5-2 (sidebar con ProofScoreBadge — el botón se añade bajo el badge)

### References

- [Source: epic-5-proof-score-decision.md#Story 5.3] — ACs y notas técnicas
- [Source: ux-design-specification.md#Visual Foundation#Dialog Registrar Decisión] — 3 Cards, flujo 2 pasos
- [Source: ux-design-specification.md#Journey 1] — decisión como cierre del journey Builder

## Dev Agent Record

### Agent Model Used

_pendiente_

### Debug Log References

### Completion Notes List

### File List
