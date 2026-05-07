export type FeedbackScore = 1 | 2 | 3 // No=1, Somewhat=2, Yes=3

export type ContributorType = 'top-reviewer' | 'insightful' | 'changed-thinking'

export interface FeedbackEntryData {
  id: string
  reviewerName: string
  createdAt: string
  textResponses: FeedbackTextResponses
  contributorType?: ContributorType
  scores?: FeedbackScores
}

export interface FeedbackScores {
  p1: FeedbackScore
  p2: FeedbackScore
  p3: FeedbackScore
}

export interface FeedbackTextResponses {
  p1?: string
  p2?: string
  p3?: string
  p4: string // obligatorio
}

export interface Feedback {
  id: string
  projectId: string
  reviewerId: string
  communityId: string
  scores: FeedbackScores
  textResponses: FeedbackTextResponses
  createdAt: string
  // Story 11.1 — feedback quality
  customAnswer: string | null
  qualityScore: number | null
  // Story 13.1 — iteraciones
  iterationId: string | null
}

/** Forma del row tal como lo devuelve Supabase (snake_case) */
export interface FeedbackRow {
  id: string
  project_id: string
  reviewer_id: string
  community_id: string
  scores: FeedbackScores
  text_responses: FeedbackTextResponses
  created_at: string
  // Story 11.1 — feedback quality
  custom_answer: string | null
  quality_score: number | null
  // Story 13.1 — iteraciones
  iteration_id: string | null
}

export function feedbackFromRow(row: FeedbackRow): Feedback {
  return {
    id: row.id,
    projectId: row.project_id,
    reviewerId: row.reviewer_id,
    communityId: row.community_id,
    scores: row.scores,
    textResponses: row.text_responses,
    createdAt: row.created_at,
    // Story 11.1 — feedback quality
    customAnswer: row.custom_answer,
    qualityScore: row.quality_score,
    // Story 13.1 — iteraciones
    iterationId: row.iteration_id,
  }
}
