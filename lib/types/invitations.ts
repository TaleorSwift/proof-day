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

export interface InvitationLinkWithCommunity extends InvitationLinkRow {
  community: {
    id: string
    name: string
    slug: string
  }
}
