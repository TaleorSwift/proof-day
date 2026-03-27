import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInvitationSchema } from '@/lib/validations/invitations'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ communityId: string }> }
) {
  const { communityId } = await params
  const supabase = await createClient()

  // CR4-F4 fix: Auth check ANTES de Zod — semántica REST correcta (401 antes de 400)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(
    { error: 'No autenticado', code: 'AUTH_REQUIRED' },
    { status: 401 }
  )

  // Validar communityId con Zod (M2 fix — schema ahora usado en API Route)
  const validation = generateInvitationSchema.safeParse({ communityId })
  if (!validation.success) {
    return NextResponse.json(
      { error: 'ID de comunidad inválido', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Verificar que el usuario es admin de la comunidad
  const { data: membership } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') return NextResponse.json(
    { error: 'Solo los admins pueden generar invitation links', code: 'FORBIDDEN' },
    { status: 403 }
  )

  // Generar token criptográfico
  const token = crypto.randomUUID()

  const { data: invitation, error } = await supabase
    .from('invitation_links')
    .insert({
      token,
      community_id: communityId,
      created_by: user.id,
    })
    .select()
    .single()

  if (error || !invitation) return NextResponse.json(
    { error: 'Error al generar el link', code: 'INVITATION_CREATE_ERROR' },
    { status: 500 }
  )

  return NextResponse.json({ data: invitation }, { status: 201 })
}
