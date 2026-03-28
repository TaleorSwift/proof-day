# Story 6.2: Feedback Counter & Top Reviewer Widget

Status: ready-for-dev

## Story

Como Reviewer,
quiero ver mi contador personal de feedbacks y aparecer como Top Reviewer si soy el más activo,
para que mi contribución sea reconocida por la comunidad.

## Acceptance Criteria

**Contador personal:**
1. Sidebar de `/communities/[slug]` muestra: "Has dado N feedbacks en esta comunidad" (FR28)
2. Contador personalizado al usuario autenticado — no es el total de la comunidad
3. Contador se actualiza al recargar/navegar

**Top Reviewer:**
4. Widget `TopReviewerWidget` visible en página de comunidad con el miembro con más feedbacks esta semana (FR29)
5. Datos del widget: avatar + nombre + "N feedbacks esta semana"
6. Período: lunes a domingo de la semana actual (UTC)
7. Si hay empate: el que llegó primero al número (menor `created_at` del feedback que hizo el empate)
8. Si esta semana no hay feedbacks: widget oculto o empty state "Sé el primero en dar feedback"
9. Avatar del Top Reviewer enlaza a su perfil `/profile/[id]`
10. Fondo del widget: `var(--color-hypothesis-bg)` — patrón reconocimiento, no ranking frío

## Rejection Criteria

- NO mostrar el widget Top Reviewer si no hay feedbacks en la semana actual
- NO exponer datos de gamificación a usuarios que no pertenecen a la comunidad
- NO mostrar feedbacks de otras comunidades en el contador personal

## Tasks / Subtasks

- [ ] **T1: Feature branch**
  - [ ] `git checkout develop && git pull`
  - [ ] `git checkout -b feat/6-2-feedback-counter-top-reviewer-widget`

- [ ] **T2: Tipos TypeScript**
  - [ ] Crear `lib/types/gamification.ts`:
    ```typescript
    export interface TopReviewer {
      userId: string
      name: string | null
      avatarUrl: string | null
      feedbackCount: number
    }

    export interface FeedbackCountStats {
      count: number
      communityId: string
    }
    ```

- [ ] **T3: API Route GET /api/gamification/top-reviewer** (AC: 4-9)
  - [ ] Crear `app/api/gamification/top-reviewer/route.ts`:
    ```typescript
    import { NextResponse } from 'next/server'
    import { createClient } from '@/lib/supabase/server'

    export async function GET(request: Request) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 })

      const { searchParams } = new URL(request.url)
      const communityId = searchParams.get('communityId')
      if (!communityId) return NextResponse.json(
        { error: 'communityId requerido', code: 'VALIDATION_ERROR' }, { status: 400 }
      )

      // Verificar membresía en la comunidad
      const { data: membership } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()
      if (!membership) return NextResponse.json(
        { error: 'No perteneces a esta comunidad', code: 'COMMUNITY_ACCESS_DENIED' }, { status: 403 }
      )

      // Calcular inicio de semana (lunes UTC)
      const now = new Date()
      const dayOfWeek = now.getUTCDay() // 0=domingo, 1=lunes...
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStart = new Date(now)
      weekStart.setUTCDate(now.getUTCDate() - daysFromMonday)
      weekStart.setUTCHours(0, 0, 0, 0)

      // Contar feedbacks por reviewer en la semana actual para esta comunidad
      const { data: feedbacks, error } = await supabase
        .from('feedbacks')
        .select('reviewer_id, created_at')
        .eq('community_id', communityId)
        .gte('created_at', weekStart.toISOString())

      if (error) return NextResponse.json(
        { error: 'Error al obtener datos de gamificación', code: 'GAMIFICATION_FETCH_ERROR' }, { status: 500 }
      )

      if (!feedbacks || feedbacks.length === 0) {
        return NextResponse.json({ data: null })
      }

      // Agrupar y encontrar top reviewer
      const countMap = new Map<string, { count: number; firstAt: string }>()
      for (const fb of feedbacks) {
        const entry = countMap.get(fb.reviewer_id)
        if (!entry) {
          countMap.set(fb.reviewer_id, { count: 1, firstAt: fb.created_at })
        } else {
          entry.count += 1
        }
      }

      // Ordenar: mayor count primero; en empate, menor firstAt
      const sorted = [...countMap.entries()].sort(([, a], [, b]) => {
        if (b.count !== a.count) return b.count - a.count
        return a.firstAt.localeCompare(b.firstAt)
      })

      const [topUserId, topData] = sorted[0]

      // Obtener perfil del top reviewer
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('id', topUserId)
        .single()

      return NextResponse.json({
        data: {
          userId: topUserId,
          name: profile?.name ?? null,
          avatarUrl: profile?.avatar_url ?? null,
          feedbackCount: topData.count,
        }
      })
    }
    ```

- [ ] **T4: API Route GET /api/gamification/feedback-count** (AC: 1, 2)
  - [ ] Crear `app/api/gamification/feedback-count/route.ts`:
    ```typescript
    export async function GET(request: Request) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 })

      const { searchParams } = new URL(request.url)
      const communityId = searchParams.get('communityId')
      if (!communityId) return NextResponse.json(
        { error: 'communityId requerido', code: 'VALIDATION_ERROR' }, { status: 400 }
      )

      const { count, error } = await supabase
        .from('feedbacks')
        .select('id', { count: 'exact', head: true })
        .eq('community_id', communityId)
        .eq('reviewer_id', user.id)

      if (error) return NextResponse.json(
        { error: 'Error al obtener contador', code: 'COUNT_FETCH_ERROR' }, { status: 500 }
      )

      return NextResponse.json({ data: { count: count ?? 0, communityId } })
    }
    ```

- [ ] **T5: Typed client wrappers**
  - [ ] Crear `lib/api/gamification.ts`:
    ```typescript
    import type { TopReviewer, FeedbackCountStats } from '@/lib/types/gamification'

    export async function getTopReviewer(communityId: string): Promise<TopReviewer | null> {
      const res = await fetch(`/api/gamification/top-reviewer?communityId=${communityId}`)
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }

    export async function getFeedbackCount(communityId: string): Promise<FeedbackCountStats> {
      const res = await fetch(`/api/gamification/feedback-count?communityId=${communityId}`)
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }
    ```

- [ ] **T6: Componente TopReviewerWidget** (AC: 4-10)
  - [ ] Crear `components/gamification/TopReviewerWidget.tsx` — Client Component:
    ```typescript
    import type { TopReviewer } from '@/lib/types/gamification'
    import Link from 'next/link'
    import Image from 'next/image'

    interface TopReviewerWidgetProps {
      communityId: string
    }
    ```
    - Fetch `getTopReviewer(communityId)` en `useEffect`
    - Si `data === null`: mostrar empty state "Sé el primero en dar feedback esta semana"
    - Si `data !== null`: Avatar (Image o placeholder) + nombre + "N feedbacks esta semana"
    - Avatar enlaza a `/profile/[data.userId]`
    - Fondo: `bg-[var(--color-hypothesis-bg)]`
    - Skeleton mientras carga

- [ ] **T7: Componente PersonalFeedbackCounter** (AC: 1, 2, 3)
  - [ ] Crear `components/gamification/PersonalFeedbackCounter.tsx` — Client Component:
    ```typescript
    interface PersonalFeedbackCounterProps {
      communityId: string
    }
    ```
    - Fetch `getFeedbackCount(communityId)` en `useEffect`
    - Renderiza: "Has dado {count} {count === 1 ? 'feedback' : 'feedbacks'} en esta comunidad"
    - Skeleton mientras carga

- [ ] **T8: Integrar widgets en página de comunidad** (AC: 1, 4)
  - [ ] Actualizar `app/(app)/communities/[slug]/page.tsx`:
    - Añadir sidebar derecho con `PersonalFeedbackCounter` + `TopReviewerWidget`
    - Ambos reciben `communityId`

- [ ] **T9: Tests unitarios** (AC: 6, 7)
  - [ ] Crear `tests/unit/gamification/topReviewer.test.ts`:
    - Con feedbacks en la semana: devuelve el reviewer con más feedbacks
    - Con empate: devuelve el que llegó primero
    - Sin feedbacks en la semana: devuelve `null`
    - Al menos 3 tests

- [ ] **T10: PR y cierre**
  - [ ] `npm run test` — todos deben pasar
  - [ ] Commit: `feat(gamification): add feedback counter and top reviewer widget`
  - [ ] Push + PR contra `develop`
  - [ ] Actualizar `sprint-status.yaml`: `6-2-feedback-counter-top-reviewer-widget: review`

## Dev Notes

### Período semanal (lunes–domingo UTC)

El cálculo del inicio de semana usa UTC para consistencia entre zonas horarias. `dayOfWeek === 0` es domingo — en ese caso retrocedemos 6 días para llegar al lunes anterior.

### Dependencias

- **Prerrequisito:** Story 4-1 (tabla `feedbacks` con `reviewer_id`, `community_id`, `created_at`)
- **Prerrequisito:** Story 6-1 (tabla `profiles` para join en avatar + nombre del Top Reviewer)

### References

- [Source: epic-6-perfiles-gamificacion.md#Story 6.2] — ACs y notas técnicas
- [Source: architecture.md#Structure Patterns] — `components/gamification/`, `lib/api/gamification.ts`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

N/A — 172/172 tests pasan. Sin errores.

### Completion Notes List

- Función pura `calculateTopReviewer` + `getWeekStart` en lib/utils/gamification.ts para testabilidad
- API Route GET /api/gamification/top-reviewer: verificación membresía, período lunes-domingo UTC, empate por firstAt
- API Route GET /api/gamification/feedback-count: contador personal por comunidad
- TopReviewerWidget: skeleton loading, empty state "Sé el primero", avatar con link a /profile/[id], fondo hypothesis-bg
- PersonalFeedbackCounter: texto "Has dado N feedbacks en esta comunidad" con singular/plural
- Integración en página de comunidad con sidebar de 280px (layout 2 columnas)
- 8 tests unitarios (172 total, todos pasan)

### File List

- `lib/types/gamification.ts` (CREATED)
- `lib/utils/gamification.ts` (CREATED — funciones puras calculateTopReviewer + getWeekStart)
- `app/api/gamification/top-reviewer/route.ts` (CREATED)
- `app/api/gamification/feedback-count/route.ts` (CREATED)
- `lib/api/gamification.ts` (MODIFIED — implementación completa)
- `components/gamification/TopReviewerWidget.tsx` (CREATED)
- `components/gamification/PersonalFeedbackCounter.tsx` (CREATED)
- `app/(app)/communities/[slug]/page.tsx` (MODIFIED — sidebar gamificación)
- `tests/unit/gamification/topReviewer.test.ts` (CREATED — 8 tests)
