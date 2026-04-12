import type { InvitationLinkRow, InvitationTokenResult } from '@/lib/types/invitations'
import {
  USER_ALEX, USER_SARA,
  COMMUNITY_ALPHA, COMMUNITY_STARTUP_LAB,
  INVITATION_UNUSED, INVITATION_USED,
} from './_ids'

// ── Invitation Links ──────────────────────────────────────────────────────────

/** Token válido, sin usar. */
export const invitationUnused: InvitationLinkRow = {
  id: INVITATION_UNUSED,
  token: 'invite-token-alpha-abc123',
  community_id: COMMUNITY_ALPHA,
  created_by: USER_ALEX,
  used_at: null,
  used_by: null,
  created_at: '2026-03-01T10:00:00Z',
}

/** Token ya consumido por Sara. */
export const invitationUsed: InvitationLinkRow = {
  id: INVITATION_USED,
  token: 'invite-token-lab-xyz789',
  community_id: COMMUNITY_STARTUP_LAB,
  created_by: USER_SARA,
  used_at: '2026-03-05T14:30:00Z',
  used_by: USER_SARA,
  created_at: '2026-03-01T09:00:00Z',
}

// ── Invitation Token Results (respuesta del RPC validate_invitation_token) ────

/** Token válido — listo para usar. */
export const invitationTokenResultValid: InvitationTokenResult = {
  id: INVITATION_UNUSED,
  community_id: COMMUNITY_ALPHA,
  used_at: null,
}

/** Token ya consumido. */
export const invitationTokenResultUsed: InvitationTokenResult = {
  id: INVITATION_USED,
  community_id: COMMUNITY_STARTUP_LAB,
  used_at: '2026-03-05T14:30:00Z',
}
