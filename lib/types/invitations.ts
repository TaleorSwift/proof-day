/**
 * InvitationLinkRow — matches Supabase/DB response (snake_case).
 * Use this when typing raw API/Supabase query responses.
 */
export interface InvitationLinkRow {
  id: string
  token: string
  community_id: string
  created_by: string
  used_at: string | null
  used_by: string | null
  created_at: string
}

/**
 * InvitationLink — camelCase alias kept for backwards compatibility.
 * For Supabase query responses, use InvitationLinkRow to avoid undefined fields.
 */
export interface InvitationLink {
  id: string
  token: string
  communityId: string
  createdBy: string
  usedAt: string | null
  usedBy: string | null
  createdAt: string
}

export interface InvitationLinkWithCommunity extends InvitationLinkRow {
  community: {
    id: string
    name: string
    slug: string
  }
}
