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
