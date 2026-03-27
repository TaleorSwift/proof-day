import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(
    { error: 'No autenticado', code: 'AUTH_REQUIRED' },
    { status: 401 }
  )

  // Buscar y validar el token via RPC (SECURITY DEFINER — no expone tabla completa, H3 fix)
  const { data: invitations } = await supabase
    .rpc('validate_invitation_token', { p_token: token })

  const invitation = invitations?.[0] ?? null

  if (!invitation) return NextResponse.json(
    { error: 'Este link ya no es válido', code: 'INVITATION_NOT_FOUND' },
    { status: 404 }
  )

  if (invitation.used_at) return NextResponse.json(
    { error: 'Este link ya no es válido', code: 'INVITATION_ALREADY_USED' },
    { status: 410 }
  )

  // Verificar si ya es miembro
  const { data: existingMember } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', invitation.community_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingMember) return NextResponse.json(
    { data: { alreadyMember: true, communityId: invitation.community_id } },
    { status: 200 }
  )

  // Unirse a la comunidad
  const { error: memberError } = await supabase
    .from('community_members')
    .insert({
      community_id: invitation.community_id,
      user_id: user.id,
      role: 'member',
    })

  if (memberError) return NextResponse.json(
    { error: 'Error al unirse a la comunidad', code: 'JOIN_ERROR' },
    { status: 500 }
  )

  // Invalidar el token — verificar error (AC 2: single-use crítico)
  const { error: invalidateError } = await supabase
    .from('invitation_links')
    .update({ used_at: new Date().toISOString(), used_by: user.id })
    .eq('id', invitation.id)

  if (invalidateError) return NextResponse.json(
    { error: 'Error al registrar el uso del link', code: 'TOKEN_INVALIDATION_ERROR' },
    { status: 500 }
  )

  return NextResponse.json(
    { data: { communityId: invitation.community_id } },
    { status: 200 }
  )
}
