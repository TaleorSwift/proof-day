export interface Profile {
  id: string
  name: string | null
  bio: string | null
  interests: string[]
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface ProfileWithStats extends Profile {
  feedbackCount: number
  projectCount: number
}
