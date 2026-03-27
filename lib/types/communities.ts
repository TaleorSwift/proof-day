export type CommunityRole = 'admin' | 'member'

export interface Community {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CommunityMember {
  id: string
  communityId: string
  userId: string
  role: CommunityRole
  joinedAt: string
}
