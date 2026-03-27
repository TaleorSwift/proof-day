/**
 * InvitationTokenResult — result of validate_invitation_token() RPC.
 * Used in app/invite/[token]/page.tsx to type the RPC response.
 */
export interface InvitationTokenResult {
  id: string
  community_id: string
  used_at: string | null
}

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
