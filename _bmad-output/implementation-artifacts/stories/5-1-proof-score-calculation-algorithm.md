# Story 5.1: Proof Score Calculation Algorithm

Status: ready-for-dev

## Story

Como plataforma,
quiero calcular el Proof Score a partir de los feedbacks recibidos usando el algoritmo definido,
para que el Builder reciba una señal interpretable y accionable sobre su proyecto.

## Acceptance Criteria

1. Proof Score solo se calcula cuando hay ≥ 3 feedbacks (FR20) — con < 3 retorna `null`
2. Algoritmo de cálculo:
   - Each feedback contributes scores p1, p2, p3 (1-3 pts cada uno)
   - `average = sum(all scores) / (n_feedbacks × 3)`
   - Thresholds (escala 1-3): ≥ 2.5 → `Promising`, 1.75-2.49 → `Needs iteration`, < 1.75 → `Weak`
3. Función pura `calculateProofScore` en `lib/utils/proof-score.ts` — sin side effects
4. API Route GET `/api/proof-score/[projectId]` expone el resultado al cliente
5. Tests unitarios con al menos 6 casos: < 3 feedbacks, exactamente 3, todos Yes, todos No, mixtos, borde de threshold

## Rejection Criteria

- NO almacenar el Proof Score en base de datos — calculado on-demand
- NO exponer el Proof Score a Reviewers — solo al Builder (FR20)
- NO usar `getSession()` — `getUser()` en API Route

## Tasks / Subtasks

- [ ] **T1: Feature branch**
  - [ ] `git checkout develop && git pull`
  - [ ] `git checkout -b feat/5-1-proof-score-calculation-algorithm`

- [ ] **T2: Tipos TypeScript**
  - [ ] Crear `lib/types/proof-score.ts`:
    ```typescript
    export type ProofScoreLabel = 'Promising' | 'Needs iteration' | 'Weak'

    export interface ProofScoreResult {
      label: ProofScoreLabel
      average: number
      feedbackCount: number
    }
    ```

- [ ] **T3: Función pura `calculateProofScore`** (AC: 1, 2, 3)
  - [ ] Crear `lib/utils/proof-score.ts`:
    ```typescript
    import type { ProofScoreResult } from '@/lib/types/proof-score'

    const MIN_FEEDBACKS = 3
    const PROMISING_THRESHOLD = 2.5
    const NEEDS_ITERATION_THRESHOLD = 1.75

    interface FeedbackScoresInput {
      scores: { p1: number; p2: number; p3: number }
    }

    export function calculateProofScore(
      feedbacks: FeedbackScoresInput[]
    ): ProofScoreResult | null {
      if (feedbacks.length < MIN_FEEDBACKS) return null

      const allScores = feedbacks.flatMap(f => [f.scores.p1, f.scores.p2, f.scores.p3])
      const average = allScores.reduce((sum, s) => sum + s, 0) / allScores.length

      let label: ProofScoreResult['label']
      if (average >= PROMISING_THRESHOLD) label = 'Promising'
      else if (average >= NEEDS_ITERATION_THRESHOLD) label = 'Needs iteration'
      else label = 'Weak'

      return { label, average: Math.round(average * 100) / 100, feedbackCount: feedbacks.length }
    }
    ```

- [ ] **T4: API Route GET /api/proof-score/[projectId]** (AC: 4)
  - [ ] Crear `app/api/proof-score/[projectId]/route.ts`:
    ```typescript
    import { NextResponse } from 'next/server'
    import { createClient } from '@/lib/supabase/server'
    import { calculateProofScore } from '@/lib/utils/proof-score'

    export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 })

      const { projectId } = await params

      // Solo el builder puede ver el Proof Score
      const { data: project } = await supabase
        .from('projects')
        .select('id, builder_id')
        .eq('id', projectId)
        .single()
      if (!project) return NextResponse.json({ error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' }, { status: 404 })
      if (project.builder_id !== user.id) return NextResponse.json(
        { error: 'Solo el builder puede ver el Proof Score', code: 'PROOF_SCORE_FORBIDDEN' }, { status: 403 }
      )

      // Leer feedbacks del proyecto
      const { data: feedbacks } = await supabase
        .from('feedbacks')
        .select('scores')
        .eq('project_id', projectId)

      const result = calculateProofScore(feedbacks ?? [])
      return NextResponse.json({ data: result })  // null si < 3 feedbacks
    }
    ```

- [ ] **T5: Typed client wrapper**
  - [ ] Crear/actualizar `lib/api/proof-score.ts`:
    ```typescript
    import type { ProofScoreResult } from '@/lib/types/proof-score'

    export async function getProofScore(projectId: string): Promise<ProofScoreResult | null> {
      const res = await fetch(`/api/proof-score/${projectId}`)
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }
    ```

- [ ] **T6: Tests unitarios** (AC: 5)
  - [ ] Crear `tests/unit/proof-score/calculateProofScore.test.ts`:
    ```typescript
    import { calculateProofScore } from '@/lib/utils/proof-score'

    test('retorna null con < 3 feedbacks', () => ...)
    test('retorna null con 0 feedbacks', () => ...)
    test('calcula Promising con todos Yes (3,3,3)', () => ...)
    test('calcula Weak con todos No (1,1,1)', () => ...)
    test('calcula Needs iteration con scores mixtos ~2.0', () => ...)
    test('calcula en el borde de threshold 2.5 → Promising', () => ...)
    test('calcula con exactamente 3 feedbacks', () => ...)
    ```
    - Al menos 6 tests, idealmente 7

- [ ] **T7: PR y cierre**
  - [ ] `npm run test` — todos deben pasar
  - [ ] Commit: `feat(proof-score): add proof score calculation algorithm and API`
  - [ ] Push + PR contra `develop`
  - [ ] Actualizar `sprint-status.yaml`: `5-1-proof-score-calculation-algorithm: review`

## Dev Notes

### Algoritmo — ejemplo

```
3 feedbacks con scores:
  F1: p1=3, p2=2, p3=3  → 8 pts
  F2: p1=2, p2=3, p3=2  → 7 pts
  F3: p1=3, p2=3, p3=3  → 9 pts
Total: 24 pts / 9 respuestas = 2.67 → Promising
```

### Por qué on-demand y no almacenado

El Proof Score se recalcula en cada request. Ventajas: siempre fresco (reflejan el último feedback), sin sincronización. Para MVP el volumen de feedbacks por proyecto es pequeño (típicamente < 20). No hay necesidad de caché.

### Dependencias

- **Prerrequisito:** Story 4-1 (tabla `feedbacks`, estructura `scores`)

### References

- [Source: epic-5-proof-score-decision.md#Story 5.1] — ACs, algoritmo, thresholds
- [Source: architecture.md#Core Architectural Decisions] — Proof Score como función derivada on-demand

## Dev Agent Record

### Agent Model Used

_pendiente_

### Debug Log References

### Completion Notes List

### File List
