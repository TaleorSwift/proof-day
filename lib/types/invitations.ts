export interface InvitationLink {
  id: string
  token: string
  communityId: string
  createdBy: string
  usedAt: string | null
  usedBy: string | null
  createdAt: string
}

export interface InvitationLinkWithCommunity extends InvitationLink {
  community: {
    id: string
    name: string
    slug: string
  }
}
