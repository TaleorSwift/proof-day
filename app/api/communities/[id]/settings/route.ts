import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateCommunitySettingsSchema } from '@/lib/validations/communities'
import { createCommunitiesRepository } from '@/lib/repositories/communities.repository'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // AC-4 — Auth check: 401 si no hay sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'No autenticado', code: 'UNAUTHENTICATED' },
      { status: 401 }
    )
  }

  // AC-5 — Verificar que el usuario es admin de la comunidad
  const { data: membership } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return NextResponse.json(
      { error: 'Solo el admin puede cambiar esta configuración', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  // AC-2 — Validar body con Zod
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Body inválido', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const validation = updateCommunitySettingsSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Datos de configuración inválidos',
        code: 'VALIDATION_ERROR',
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  // AC-3 — Actualizar reciprocity_threshold en la BD
  const repository = createCommunitiesRepository(supabase)
  const { data: updated, error } = await repository.updateSettings(id, {
    reciprocityThreshold: validation.data.reciprocityThreshold,
  })

  if (error || !updated) {
    // Supabase devuelve PGRST116 cuando no encuentra el registro con .single()
    const isNotFound =
      error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116'

    if (isNotFound) {
      return NextResponse.json(
        { error: 'Comunidad no encontrada', code: 'COMMUNITY_NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar la configuración', code: 'UPDATE_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      data: {
        id: updated.id,
        reciprocityThreshold: updated.reciprocity_threshold,
      },
    },
    { status: 200 }
  )
}
