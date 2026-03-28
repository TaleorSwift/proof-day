# Story 5.2: Proof Score Display & Waiting State

Status: ready-for-dev

## Story

Como Builder,
quiero ver el Proof Score de mi proyecto con peso visual cuando esté disponible, y un estado de espera motivador mientras no lo esté,
para que siempre sepa qué está pasando con mi idea.

## Acceptance Criteria

**Estado de espera (< 3 feedbacks):**
1. `ProofScoreWaiting` visible en sidebar de vista de proyecto (Builder)
2. Número dinámico: "Faltan N feedbacks para tu señal" (N = 3 − feedbacks_recibidos)
3. `Progress` bar: value = (feedbacks_recibidos / 3) × 100
4. Copy motivador: "Tu señal estará lista pronto"
5. No mostrar ninguna métrica numérica parcial

**Estado con score (≥ 3 feedbacks):**
6. `ProofScoreBadge` variante `full` visible en sidebar
   - Promising: icono ✓, fondo `#E8F5EE`, texto `#2D7A4F`, "El equipo ve potencial real"
   - Needs iteration: icono ⟳, fondo `#FEF3E2`, texto `#A05C00`, "La solución genera dudas — refina antes de escalar"
   - Weak: icono ✗, fondo `#FEE2E2`, texto `#B91C1C`, "Señal débil — reconsidera el enfoque"
7. Score visible solo para el Builder — invisible para Reviewers (FR20)
8. `Skeleton` loading mientras se hace fetch del score

## Rejection Criteria

- NO mostrar el Proof Score a Reviewers bajo ninguna circunstancia
- NO mostrar scores parciales o averages numéricos
- NO saltarse el estado de espera si hay < 3 feedbacks

## Tasks / Subtasks

- [ ] **T1: Feature branch**
  - [ ] `git checkout develop && git pull`
  - [ ] `git checkout -b feat/5-2-proof-score-display-waiting-state`

- [ ] **T2: Componente ProofScoreWaiting** (AC: 1-5)
  - [ ] Crear `components/proof-score/ProofScoreWaiting.tsx`:
    ```typescript
    import { Progress } from '@/components/ui/progress'
    import { Skeleton } from '@/components/ui/skeleton'

    interface ProofScoreWaitingProps {
      feedbackCount: number   // feedbacks recibidos actualmente (0-2)
      isLoading?: boolean
    }

    export function ProofScoreWaiting({ feedbackCount, isLoading }: ProofScoreWaitingProps) {
      if (isLoading) return <Skeleton className="h-24 w-full rounded-lg" />
      const remaining = Math.max(0, 3 - feedbackCount)
      const progress = (feedbackCount / 3) * 100
      return (
        <div className="space-y-3 p-4 rounded-lg border border-[var(--color-border)]">
          <p className="font-medium text-sm">
            Faltan <span className="font-bold">{remaining}</span> {remaining === 1 ? 'feedback' : 'feedbacks'} para tu señal
          </p>
          <Progress value={progress} className="h-2" aria-label={`${feedbackCount} de 3 feedbacks recibidos`} />
          <p className="text-xs text-[var(--color-text-muted)]">Tu señal estará lista pronto</p>
        </div>
      )
    }
    ```

- [ ] **T3: Componente ProofScoreBadge** (AC: 6, 7)
  - [ ] Crear `components/proof-score/ProofScoreBadge.tsx`:
    ```typescript
    import type { ProofScoreLabel } from '@/lib/types/proof-score'

    interface ProofScoreBadgeProps {
      label: ProofScoreLabel
      variant?: 'compact' | 'full'
    }

    const SCORE_CONFIG = {
      'Promising': {
        icon: '✓',
        bg: '#E8F5EE',
        color: '#2D7A4F',
        description: 'El equipo ve potencial real',
      },
      'Needs iteration': {
        icon: '⟳',
        bg: '#FEF3E2',
        color: '#A05C00',
        description: 'La solución genera dudas — refina antes de escalar',
      },
      'Weak': {
        icon: '✗',
        bg: '#FEE2E2',
        color: '#B91C1C',
        description: 'Señal débil — reconsidera el enfoque',
      },
    }

    export function ProofScoreBadge({ label, variant = 'full' }: ProofScoreBadgeProps) {
      const config = SCORE_CONFIG[label]
      return (
        <div
          role="status"
          aria-label={`Proof Score: ${label}`}
          aria-live="polite"
          style={{ backgroundColor: config.bg, color: config.color }}
          className="rounded-lg p-4 space-y-1"
        >
          <div className="flex items-center gap-2 font-semibold">
            <span aria-hidden="true">{config.icon}</span>
            <span>{label}</span>
          </div>
          {variant === 'full' && (
            <p className="text-sm opacity-90">{config.description}</p>
          )}
        </div>
      )
    }
    ```
  - [ ] Crear Storybook stories en `stories/proof-score/ProofScoreBadge.stories.tsx`:
    - `Promising` (full)
    - `NeedsIteration` (full)
    - `Weak` (full)
    - `Compact` (variante compact)

- [ ] **T4: Integrar en sidebar de vista de proyecto** (AC: 7, 8)
  - [ ] Actualizar `app/(app)/communities/[slug]/projects/[id]/page.tsx`:
    - Añadir `ProofScoreSidebar` — Client Component que:
      1. Recibe `projectId`, `isBuilder: boolean`, `feedbackCount: number`
      2. Si `isBuilder === false`: no renderizar nada de proof score
      3. Si `isBuilder === true`: fetch `getProofScore(projectId)` en `useEffect`
      4. Mientras carga: `ProofScoreWaiting` con `isLoading=true`
      5. Si `score === null` (< 3 feedbacks): `ProofScoreWaiting` con `feedbackCount`
      6. Si `score !== null`: `ProofScoreBadge` variante `full`
  - [ ] Crear `components/proof-score/ProofScoreSidebar.tsx` con la lógica anterior

- [ ] **T5: Tests unitarios** (AC: 2, 3)
  - [ ] Crear `tests/unit/proof-score/proofScoreDisplay.test.ts`:
    - `ProofScoreWaiting`: con 0 feedbacks → "Faltan 3 feedbacks"
    - `ProofScoreWaiting`: con 2 feedbacks → "Falta 1 feedback"
    - `ProofScoreWaiting`: progress con 1 feedback → 33.33%
    - Al menos 3 tests de lógica de display

- [ ] **T6: PR y cierre**
  - [ ] `npm run test` — todos deben pasar
  - [ ] Commit: `feat(proof-score): add proof score display and waiting state components`
  - [ ] Push + PR contra `develop`
  - [ ] Actualizar `sprint-status.yaml`: `5-2-proof-score-display-waiting-state: review`

## Dev Notes

### Dependencias

- **Prerrequisito:** Story 5-1 (`calculateProofScore`, API Route, tipos)
- Story 5-3 añadirá el botón "Registrar decisión" bajo el `ProofScoreBadge`

### aria-live para screen readers

Los componentes de score usan `aria-live="polite"` — el score puede cambiar si el Builder recarga la página después de nuevos feedbacks. El `role="status"` en `ProofScoreBadge` garantiza que lectores de pantalla anuncien el cambio.

### References

- [Source: epic-5-proof-score-decision.md#Story 5.2] — ACs y estados visuales
- [Source: ux-design-specification.md#Component Strategy#ProofScoreWaiting] — anatomía
- [Source: ux-design-specification.md#Component Strategy#ProofScoreBadge] — variantes, colores
- [Source: ux-design-specification.md#Visual Foundation#Pantalla 6] — estados del sidebar

## Dev Agent Record

### Agent Model Used

_pendiente_

### Debug Log References

### Completion Notes List

### File List
