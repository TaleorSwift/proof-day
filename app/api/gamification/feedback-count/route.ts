import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(
    { error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 }
  )

  const { searchParams } = new URL(request.url)
  const communityId = searchParams.get('communityId')
  if (!communityId) return NextResponse.json(
    { error: 'communityId requerido', code: 'VALIDATION_ERROR' }, { status: 400 }
  )

  // Verificar membresía en la comunidad
  const { data: membership } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .single()
  if (!membership) return NextResponse.json(
    { error: 'No perteneces a esta comunidad', code: 'COMMUNITY_ACCESS_DENIED' }, { status: 403 }
  )

  const { count, error } = await supabase
    .from('feedbacks')
    .select('id', { count: 'exact', head: true })
    .eq('community_id', communityId)
    .eq('reviewer_id', user.id)

  if (error) return NextResponse.json(
    { error: 'Error al obtener contador', code: 'COUNT_FETCH_ERROR' }, { status: 500 }
  )

  return NextResponse.json({ data: { count: count ?? 0, communityId } })
}
