import type { ProofScoreResult } from '@/lib/types/proof-score'

const MIN_FEEDBACKS = 3
const PROMISING_THRESHOLD = 2.5
const NEEDS_ITERATION_THRESHOLD = 1.75

interface FeedbackScoresInput {
  scores: { p1: number; p2: number; p3: number }
}

export function calculateProofScore(feedbacks: FeedbackScoresInput[]): ProofScoreResult | null {
  if (feedbacks.length < MIN_FEEDBACKS) return null

  const allScores = feedbacks.flatMap(f => [f.scores.p1, f.scores.p2, f.scores.p3])
  const average = allScores.reduce((sum, s) => sum + s, 0) / allScores.length

  let label: ProofScoreResult['label']
  if (average >= PROMISING_THRESHOLD) label = 'Promising'
  else if (average >= NEEDS_ITERATION_THRESHOLD) label = 'Needs iteration'
  else label = 'Weak'

  return { label, average: Math.round(average * 100) / 100, feedbackCount: feedbacks.length }
}
