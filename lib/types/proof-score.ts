export type ProofScoreLabel = 'Promising' | 'Needs iteration' | 'Weak'

export interface ProofScoreResult {
  label: ProofScoreLabel
  average: number
  feedbackCount: number
}
