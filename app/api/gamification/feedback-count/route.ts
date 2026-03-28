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
