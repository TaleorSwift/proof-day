/**
 * Utilidades puras para gamificación — Story 6.2
 * Separadas para facilitar el testing sin dependencias de Supabase.
 */

export interface FeedbackRow {
  reviewer_id: string
  created_at: string
}

export interface TopReviewerResult {
  userId: string
  feedbackCount: number
  firstAt: string
}

/**
 * Calcula el inicio de la semana actual (lunes UTC a las 00:00:00).
 * dayOfWeek === 0 es domingo → retrocedemos 6 días al lunes anterior.
 */
export function getWeekStart(now: Date): Date {
  const dayOfWeek = now.getUTCDay()
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(now)
  weekStart.setUTCDate(now.getUTCDate() - daysFromMonday)
  weekStart.setUTCHours(0, 0, 0, 0)
  return weekStart
}

/**
 * Dado un array de feedbacks de la semana, devuelve el top reviewer.
 * En caso de empate en count, gana quien llegó primero (menor created_at del primer feedback).
 * Si no hay feedbacks, devuelve null.
 */
export function calculateTopReviewer(feedbacks: FeedbackRow[]): TopReviewerResult | null {
  if (!feedbacks || feedbacks.length === 0) return null

  const countMap = new Map<string, { count: number; firstAt: string }>()

  for (const fb of feedbacks) {
    const entry = countMap.get(fb.reviewer_id)
    if (!entry) {
      countMap.set(fb.reviewer_id, { count: 1, firstAt: fb.created_at })
    } else {
      entry.count += 1
    }
  }

  const sorted = [...countMap.entries()].sort(([, a], [, b]) => {
    if (b.count !== a.count) return b.count - a.count
    return a.firstAt.localeCompare(b.firstAt)
  })

  const [topUserId, topData] = sorted[0]
  return {
    userId: topUserId,
    feedbackCount: topData.count,
    firstAt: topData.firstAt,
  }
}
