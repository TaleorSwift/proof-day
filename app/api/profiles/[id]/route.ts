import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateProfileSchema } from '@/lib/validations/profiles'

// GET — leer perfil (con verificación de comunidad compartida para terceros)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(
    { error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 }
  )

  const { id } = await params

  // Si es el propio perfil: acceso directo
  if (id !== user.id) {
    // Verificar que comparten al menos una comunidad
    const { data: shared } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', user.id)
      .in(
        'community_id',
        (await supabase
          .from('community_members')
          .select('community_id')
          .eq('user_id', id)
        ).data?.map((m: Record<string, unknown>) => m.community_id) ?? []
      )
      .limit(1)

    if (!shared || shared.length === 0) {
      return NextResponse.json(
        { error: 'No compartes ninguna comunidad con este usuario', code: 'COMMUNITY_ACCESS_DENIED' },
        { status: 403 }
      )
    }
  }

  // Obtener perfil
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, bio, interests, avatar_url, created_at, updated_at')
    .eq('id', id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'Perfil no encontrado', code: 'PROFILE_NOT_FOUND' }, { status: 404 }
    )
  }

  // Contar feedbacks dados
  const { count: feedbackCount } = await supabase
    .from('feedbacks')
    .select('id', { count: 'exact', head: true })
    .eq('reviewer_id', id)

  // Contar proyectos creados
  const { count: projectCount } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('builder_id', id)

  return NextResponse.json({
    data: {
      id: profile.id,
      name: profile.name,
      bio: profile.bio,
      interests: profile.interests ?? [],
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      feedbackCount: feedbackCount ?? 0,
      projectCount: projectCount ?? 0,
    }
  })
}

// PATCH — actualizar perfil propio
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(
    { error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 }
  )

  const { id } = await params

  // Solo puede editar su propio perfil
  if (id !== user.id) {
    return NextResponse.json(
      { error: 'Solo puedes editar tu propio perfil', code: 'FORBIDDEN' }, { status: 403 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'JSON inválido', code: 'INVALID_JSON' }, { status: 400 }
    )
  }

  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { name, bio, interests } = parsed.data
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (name !== undefined) updateData.name = name
  if (bio !== undefined) updateData.bio = bio
  if (interests !== undefined) updateData.interests = interests

  const { data: updated, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
    .select('id, name, bio, interests, avatar_url, created_at, updated_at')
    .single()

  if (error || !updated) {
    return NextResponse.json(
      { error: 'Error al actualizar el perfil', code: 'PROFILE_UPDATE_ERROR' }, { status: 500 }
    )
  }

  return NextResponse.json({
    data: {
      id: updated.id,
      name: updated.name,
      bio: updated.bio,
      interests: updated.interests ?? [],
      avatarUrl: updated.avatar_url,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    }
  })
}
