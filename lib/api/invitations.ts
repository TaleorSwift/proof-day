/**
 * Client-side API wrapper for invitation links.
 * Used exclusively in Client Components (browser context).
 */

/**
 * Generates an invitation link for a community.
 * Calls POST /api/communities/[communityId]/invitations
 * Returns the full shareable URL (e.g. https://example.com/invite/<token>)
 */
export async function generateInvitationLink(communityId: string): Promise<string> {
  const res = await fetch(`/api/communities/${communityId}/invitations`, {
    method: 'POST',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Error al generar el link de invitación')
  }

  const { data } = await res.json()
  return `${window.location.origin}/invite/${data.token}`
}
