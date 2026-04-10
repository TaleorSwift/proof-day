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

export interface TopContributor {
  userId: string
  name: string
  feedbackCount: number
}
