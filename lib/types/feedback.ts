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
}
