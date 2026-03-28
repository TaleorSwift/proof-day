import type { TopReviewer, FeedbackCountStats } from '@/lib/types/gamification'

export async function getTopReviewer(communityId: string): Promise<TopReviewer | null> {
  const res = await fetch(`/api/gamification/top-reviewer?communityId=${communityId}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Error al obtener el top reviewer')
  }
  return (await res.json()).data as TopReviewer | null
}

export async function getFeedbackCount(communityId: string): Promise<FeedbackCountStats> {
  const res = await fetch(`/api/gamification/feedback-count?communityId=${communityId}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Error al obtener el contador de feedbacks')
  }
  return (await res.json()).data as FeedbackCountStats
}
