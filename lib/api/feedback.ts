import type { Feedback, FeedbackTextResponses } from '@/lib/types/feedback'
import type { SubmitFeedbackInput } from '@/lib/validations/feedback'

export interface FeedbackWithReviewer {
  id: string
  text_responses: FeedbackTextResponses
  created_at: string
  profiles: { id: string; name: string; avatar_url: string | null } | null
}

export async function submitFeedback(data: SubmitFeedbackInput): Promise<Feedback> {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return (await res.json()).data
}

export async function getFeedbacks(projectId: string): Promise<FeedbackWithReviewer[]> {
  const res = await fetch(`/api/feedback?projectId=${projectId}`)
  if (!res.ok) throw new Error((await res.json()).error)
  return (await res.json()).data
}
