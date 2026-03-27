export type ProjectStatus = 'draft' | 'live' | 'inactive'
export type ProofScoreState = 'Promising' | 'Needs iteration' | 'Weak'
export type Decision = 'iterate' | 'scale' | 'abandon'
export type CommunityRole = 'admin' | 'member'

export interface User {
  id: string
  email: string
  name?: string
  bio?: string
  interests?: string[]
  avatarUrl?: string
  createdAt: string
}

export interface Community {
  id: string
  slug: string
  name: string
  description: string
  imageUrl?: string
  createdAt: string
}

export interface Project {
  id: string
  communityId: string
  builderId: string
  title: string
  problem: string
  solution: string
  hypothesis: string
  status: ProjectStatus
  decision?: Decision
  decidedAt?: string
  imageUrls: string[]
  createdAt: string
  updatedAt: string
}

export interface FeedbackResponse {
  id: string
  projectId: string
  reviewerId: string
  communityId: string
  scores: { p1: 1 | 2 | 3; p2: 1 | 2 | 3; p3: 1 | 2 | 3 }
  textResponses: { p1?: string; p2?: string; p3?: string; p4: string }
  createdAt: string
}

export interface ProofScore {
  state: ProofScoreState
  average: number
  feedbackCount: number
}
