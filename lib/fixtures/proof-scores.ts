import type { ProofScoreResult } from '@/lib/types/proof-score'

/**
 * ProofScore precalculados para cada label posible.
 * Los valores numéricos son coherentes con los umbrales definidos en lib/utils/proof-score.ts:
 *   PROMISING_THRESHOLD      = 2.5
 *   NEEDS_ITERATION_THRESHOLD = 1.75
 *   MIN_FEEDBACKS            = 3
 */

/** label: Promising — average > 2.5. Deriva de los feedbacks de Pulse Check (avg 2.67). */
export const proofScorePromising: ProofScoreResult = {
  label: 'Promising',
  average: 2.67,
  feedbackCount: 3,
}

/**
 * label: Needs iteration — 1.75 ≤ average ≤ 2.5.
 * Deriva de los feedbacks de Iterate Labs (avg 2.0).
 */
export const proofScoreNeedsIteration: ProofScoreResult = {
  label: 'Needs iteration',
  average: 2.0,
  feedbackCount: 3,
}

/**
 * label: Weak — average < 1.75.
 * Deriva de los feedbacks de Retro Replay (avg 1.33).
 */
export const proofScoreWeak: ProofScoreResult = {
  label: 'Weak',
  average: 1.33,
  feedbackCount: 2,
}

/** Puntuación perfecta — todos los scores a 3. */
export const proofScorePerfect: ProofScoreResult = {
  label: 'Promising',
  average: 3.0,
  feedbackCount: 3,
}

/** Justo en el umbral inferior de Promising. */
export const proofScoreBorderlinePromising: ProofScoreResult = {
  label: 'Promising',
  average: 2.51,
  feedbackCount: 3,
}

/** Justo en el umbral superior de Needs iteration. */
export const proofScoreBorderlineNeedsIteration: ProofScoreResult = {
  label: 'Needs iteration',
  average: 2.49,
  feedbackCount: 3,
}
