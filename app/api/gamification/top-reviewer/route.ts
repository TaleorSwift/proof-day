import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWeekStart, calculateTopReviewer } from '@/lib/utils/gamification'

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

  // Calcular inicio de semana (lunes UTC) usando utilidad pura
  const weekStart = getWeekStart(new Date())

  // Obtener feedbacks de la semana actual para esta comunidad
  const { data: feedbacks, error } = await supabase
    .from('feedbacks')
    .select('reviewer_id, created_at')
    .eq('community_id', communityId)
    .gte('created_at', weekStart.toISOString())

  if (error) return NextResponse.json(
    { error: 'Error al obtener datos de gamificación', code: 'GAMIFICATION_FETCH_ERROR' }, { status: 500 }
  )

  // Calcular top reviewer con función pura
  const top = calculateTopReviewer(feedbacks ?? [])

  if (!top) {
    return NextResponse.json({ data: null })
  }

  // Obtener perfil del top reviewer
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .eq('id', top.userId)
    .single()

  return NextResponse.json({
    data: {
      userId: top.userId,
      name: profile?.name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      feedbackCount: top.feedbackCount,
    }
  })
}
